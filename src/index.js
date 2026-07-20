import {
  Notice,
  Plugin,
  Setting,
  PluginSettingTab,
  moment,
  Tasks
} from 'obsidian'
import {
  getDailyNoteSettings,
  getAllDailyNotes,
  getDailyNote
} from 'obsidian-daily-notes-interface'
import UndoModal from './ui/UndoModal'
import RolloverSettingTab from './ui/RolloverSettingTab'

const MAX_TIME_SINCE_CREATION = 5000

export default class DailyTodoProPlugin extends Plugin {
  async loadSettings () {
    const DEFAULT_SETTINGS = {
      templateHeading: 'none',
      deleteOnComplete: false,
      removeEmptyTodos: false,
      skipCompletedTasks: true,
      displayTodayInHistory: false,
      todayHistoryHeader: '## Today in history',
      historyShowDirect: false,
      todayHistoryCount: '1'
    }
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings () {
    await this.saveData(this.settings)
  }

  isDailyNotesEnabled () {
    const dailyNotesPlugin = this.app.internalPlugins.plugins['daily-notes']
    const dailyNotesEnabled = dailyNotesPlugin && dailyNotesPlugin.enabled

    const periodicNotesPlugin = this.app.plugins.getPlugin('periodic-notes')
    const periodicNotesEnabled =
      periodicNotesPlugin && periodicNotesPlugin.settings?.daily?.enabled

    return dailyNotesEnabled || periodicNotesEnabled
  }

  // shuffle (array) {
  //   for (let i = array.length - 1; i > 0; i--) {
  //     let j = Math.floor(Math.random() * (i + 1))
  //     ;[array[i], array[j]] = [array[j], array[i]]
  //   }
  // }

  getLastDailyNote (random = false) {
    const { folder, format } = getDailyNoteSettings()

    // get all notes in directory that aren't null
    // and filter name by date
    const dailyNoteFiles = this.app.vault
      .getMarkdownFiles()
      .filter(file => file.path.startsWith(folder))
      .filter(file => file.basename != null)
      .filter(file =>
        moment(file.basename, format).isSameOrBefore(moment(), 'day')
      )
      .sort(
        (a, b) =>
          moment(b.basename, format).valueOf() -
          moment(a.basename, format).valueOf()
      )

    if (random !== false) {
      dailyNoteFiles.shift()
      dailyNoteFiles.shuffle()
    }

    return dailyNoteFiles[1]
  }

  /**
   * Strip completed tasks (checkbox marked with x/X) out of a list of
   * lines, along with any lines nested underneath them (determined by
   * leading whitespace being greater than the completed task's own
   * indentation). Used so that "done" work doesn't get rolled forward
   * when a whole heading section is copied over.
   */
  stripCompletedTasks (lines) {
    const result = []
    let skipIndent = null

    for (const line of lines) {
      const indentLength = line.match(/^\s*/)[0].length
      const checkboxMatch = line.match(/^\s*(?:[-+*]|\d+\.)\s\[([^\]])\]\s/)

      // We're currently skipping the children nested under a completed task
      if (skipIndent !== null) {
        if (line.trim() !== '' && indentLength > skipIndent) {
          continue
        }
        skipIndent = null
      }

      if (checkboxMatch && /[xX]/.test(checkboxMatch[1])) {
        // this is a completed task: drop it, and start skipping its children
        skipIndent = indentLength
        continue
      }

      result.push(line)
    }

    return result
  }

  /**
   * Grab an entire heading section - every line between `templateHeading`
   * and the next heading of the same (or higher) level - so headings,
   * prose, sub-bullets, and todos all come along together.
   *
   * If no heading is selected ('none'), fall back to the old behaviour:
   * grab every unfinished todo in the file, to be appended to the end
   * of today's note.
   */
  async getHeadingSection (file, templateHeading) {
    const contents = await this.app.vault.cachedRead(file)
    const lines = contents.split('\n')

    if (templateHeading === 'none') {
      const unfinishedTodoRegex = /^\s*(?:[-+*]|\d+\.)\s\[[^xX]\]\s.*/
      return lines.filter(line => unfinishedTodoRegex.test(line))
    }

    const headingLevelMatch = templateHeading.match(/^#+/)
    if (!headingLevelMatch) return []
    const level = headingLevelMatch[0].length

    const headingIndex = lines.findIndex(
      line => line.trim() === templateHeading.trim()
    )
    if (headingIndex === -1) return []

    const headingRegex = /^(#{1,6})\s/
    let endIndex = lines.length
    for (let i = headingIndex + 1; i < lines.length; i++) {
      const match = lines[i].match(headingRegex)
      if (match && match[1].length <= level) {
        endIndex = i
        break
      }
    }

    return lines.slice(headingIndex + 1, endIndex)
  }

  async rollover (file = undefined) {
    /*** First we check if the file created is actually a valid daily note ***/
    const { folder, format } = getDailyNoteSettings()
    let ignoreCreationTime = false

    // Rollover can be called, but we need to get the daily file
    if (file == undefined) {
      const allDailyNotes = getAllDailyNotes()
      file = getDailyNote(moment(), allDailyNotes)
      ignoreCreationTime = true
    }
    if (!file) return

    // is a daily note
    if (!file.path.startsWith(folder)) return

    // is today's daily note
    const today = new Date()
    const todayFormatted = moment(today).format(format)
    if (todayFormatted !== file.basename) return

    // was just created
    if (
      today.getTime() - file.stat.ctime > MAX_TIME_SINCE_CREATION &&
      !ignoreCreationTime
    )
      return

    /*** Next, if it is a valid daily note, but we don't have daily notes enabled, we must alert the user ***/
    if (!this.isDailyNotesEnabled()) {
      new Notice(
        'RolloverTodosPlugin unable to rollover unfinished todos: Please enable Daily Notes, or Periodic Notes (with daily notes enabled).',
        10000
      )
    } else {
      const {
        templateHeading,
        deleteOnComplete,
        removeEmptyTodos,
        skipCompletedTasks,
        displayTodayInHistory,
        todayHistoryHeader,
        historyShowDirect,
        todayHistoryCount
      } = this.settings

      // check if there is a daily note from yesterday
      const lastDailyNote = this.getLastDailyNote()
      if (lastDailyNote == null) return

      // TODO: Rollover to subheadings (optional)
      // this.sortHeadersIntoHeirarchy(lastDailyNote)

      // get the heading section (or unfinished todos, if no heading chosen) from yesterday
      let todos_yesterday = await this.getHeadingSection(
        lastDailyNote,
        templateHeading
      )

      // optionally drop already-completed tasks (and their nested children)
      if (skipCompletedTasks) {
        todos_yesterday = this.stripCompletedTasks(todos_yesterday)
      }

      if (todos_yesterday.length == 0) {
        console.log(
          `rollover-daily-todos: nothing found in ${lastDailyNote.basename}.md`
        )
        return
      }

      // setup undo history
      let undoHistoryInstance = {
        previousDay: {
          file: undefined,
          oldContent: ''
        },
        today: {
          file: undefined,
          oldContent: ''
        }
      }

      // Potentially filter todos from yesterday for today
      let todosAdded = 0
      let emptiesToNotAddToTomorrow = 0
      let todos_today = !removeEmptyTodos ? todos_yesterday : []
      if (removeEmptyTodos) {
        todos_yesterday.forEach((line, i) => {
          const trimmedLine = (line || '').trim()
          if (!/^((?:[-+*]|\d+\.)\s\[\s*\])$/.test(trimmedLine)) {
            todos_today.push(line)
            todosAdded++
          } else {
            emptiesToNotAddToTomorrow++
          }
        })
      } else {
        todosAdded = todos_yesterday.length
      }

      // get today's content and modify it
      let templateHeadingNotFoundMessage = ''
      const templateHeadingSelected = templateHeading !== 'none'

      if (todos_today.length > 0) {
        let dailyNoteContent = await this.app.vault.read(file)
        undoHistoryInstance.today = {
          file: file,
          oldContent: `${dailyNoteContent}`
        }
        let todos_todayString = `\n${todos_today.join('\n')}`

        // '\n' + [[20210403]] + '\n'

        // If template heading is selected, try to rollover to template heading
        if (templateHeadingSelected) {
          const contentAddedToHeading = dailyNoteContent.replace(
            templateHeading,
            `${templateHeading}${todos_todayString}`
          )
          if (contentAddedToHeading == dailyNoteContent) {
            templateHeadingNotFoundMessage = `Rollover couldn't find '${templateHeading}' in today's daily not. Rolling todos to end of file.`
          } else {
            dailyNoteContent = contentAddedToHeading
          }
        }

        // Rollover to bottom of file if no heading found in file, or no heading selected
        if (
          !templateHeadingSelected ||
          templateHeadingNotFoundMessage.length > 0
        ) {
          dailyNoteContent += todos_todayString
        }

        // Day-in-history feature disabled in this fork.
        //
        // if (displayTodayInHistory) {
        //   let lastYearToday = [todayHistoryHeader + '\n']
        //
        //   const [year, month, day] = moment()
        //     .format('YYYY-MM-DD')
        //     .split('-')
        //
        //   let historyBeginWith = `- [[`
        //   if (historyShowDirect) {
        //     historyBeginWith = `- ![[`
        //   }
        //
        //   for (let i = 1; i <= todayHistoryCount; i++) {
        //     lastYearToday.push(
        //       `${historyBeginWith}${year - i}-${month}-${day}]]`
        //     )
        //   }
        //
        //   const lastYearToday_String = `\n${lastYearToday.join('\n')}`
        //
        //   dailyNoteContent += lastYearToday_String
        //   dailyNoteContent += '\n'
        // }
        // return

        // 最终执行 更改文件
        await this.app.vault.modify(file, dailyNoteContent)
      }

      // if deleteOnComplete, get yesterday's content and modify it
      if (deleteOnComplete) {
        let lastDailyNoteContent = await this.app.vault.cachedRead(
          lastDailyNote
        )
        undoHistoryInstance.previousDay = {
          file: lastDailyNote,
          oldContent: `${lastDailyNoteContent}`
        }
        let lines = lastDailyNoteContent.split('\n')

        for (let i = lines.length; i >= 0; i--) {
          if (todos_yesterday.includes(lines[i])) {
            lines.splice(i, 1)
          }
        }

        let modifiedContent = lines.join('\n')

        let modifiedContentLines = modifiedContent.split('\n')

        for (let i = modifiedContentLines.length; i >= 0; i--) {
          if (
            i > 0 &&
            modifiedContentLines[i] == '' &&
            modifiedContentLines[i - 1] == ''
          ) {
            modifiedContentLines.splice(i, 1)
          }
        }

        modifiedContent = modifiedContentLines.join('\n')

        await this.app.vault.modify(lastDailyNote, modifiedContent)
      }

      // Let user know rollover has been successful with X todos
      const todosAddedString =
        todosAdded == 0
          ? ''
          : `- ${todosAdded} item${todosAdded > 1 ? 's' : ''} rolled over.`
      const emptiesToNotAddToTomorrowString =
        emptiesToNotAddToTomorrow == 0
          ? ''
          : deleteOnComplete
          ? `- ${emptiesToNotAddToTomorrow} empty todo${
              emptiesToNotAddToTomorrow > 1 ? 's' : ''
            } removed.`
          : ''
      const part1 =
        templateHeadingNotFoundMessage.length > 0
          ? `${templateHeadingNotFoundMessage}`
          : ''
      const part2 = `${todosAddedString}${
        todosAddedString.length > 0 ? ' ' : ''
      }`
      const part3 = `${emptiesToNotAddToTomorrowString}${
        emptiesToNotAddToTomorrowString.length > 0 ? ' ' : ''
      }`

      let allParts = [part1, part2, part3]
      let nonBlankLines = []
      allParts.forEach(part => {
        if (part.length > 0) {
          nonBlankLines.push(part)
        }
      })

      const message = nonBlankLines.join('\n')
      if (message.length > 0) {
        new Notice(message, 4000 + message.length * 3)
      }
      this.undoHistoryTime = new Date()
      this.undoHistory = [undoHistoryInstance]
    }
  }

  async onload () {
    await this.loadSettings()
    this.undoHistory = []
    this.undoHistoryTime = new Date()

    this.addSettingTab(new RolloverSettingTab(this.app, this))

    // can not find how to trigger event after load the template
    // so close this feature now
    // this.registerEvent(
    //   this.app.vault.on('create', async file => {
    //     this.rollover(file)
    //   })
    // )

    this.addCommand({
      id: 'obsidian-daily-todo-pro-rollover',
      name: 'Rollover Todos Now',
      callback: () => this.rollover()
    })

    this.addCommand({
      id: 'obsidian-daily-todo-pro-random',
      name: 'Lucky Note',
      callback: () => {
        // const activeFile = this.createSelectedFileStore();
        const existingFile = this.getLastDailyNote(1)
        if (!existingFile) {
          console.log(`Something wrong with Lucky Note.`)
          return
        }
        this.app.workspace.getUnpinnedLeaf().openFile(existingFile)
      }
    })

    this.addCommand({
      id: 'obsidian-daily-todo-pro-undo',
      name: 'Undo last rollover',
      checkCallback: checking => {
        // no history, don't allow undo
        if (this.undoHistory.length > 0) {
          const now = moment()
          const lastUse = moment(this.undoHistoryTime)
          const diff = now.diff(lastUse, 'seconds')
          // 5+ mins since use: don't allow undo
          if (diff > 5 * 60) {
            return false
          }
          if (!checking) {
            new UndoModal(this).open()
          }
          return true
        }
        return false
      }
    })
  }
}
