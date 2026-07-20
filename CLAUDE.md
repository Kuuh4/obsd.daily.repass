# CLAUDE.md — obsd.daily.repass

Context doc for whoever (human or Claude) picks this project up next.

## What this plugin does

Obsidian plugin. On creation of today's daily note, or via command, it pulls
content forward from the most recent previous daily note into today's note.
Fork of `obsidian-daily-todo-pro` that was a fork of `obsidian-rollover-daily-todos`, extended with: template-heading
targeting, delete-on-complete, empty-todo filtering, "today in history"
backlinks, and a "Lucky Note" random-daily-note command.

**This fork's specific goal (in progress):** instead of rolling over only
todo *lines* under a heading, roll over the *entire heading section*
(headings, prose, sub-bullets, everything) — with an optional filter to
still drop already-completed tasks. That work is implemented; see "Session
log" below for exactly what changed and what's still unverified.

## File map

```
src/index.js                 Plugin class: settings, rollover logic, commands
src/ui/RolloverSettingTab.js Settings panel (Setting API)
src/ui/UndoModal.js          Undo confirmation modal, unaffected by this session's changes
manifest.json                Obsidian plugin manifest (id, version, minAppVersion)
package.json / rollup.config.js  Build via rollup -> main.js (cjs bundle)
versions.json                 Obsidian minAppVersion compatibility map
README.md / README-CN.md      User-facing docs (EN / 中文) — NOT yet updated for this session's changes
```

Build: `npm run build` (prod) or `npm run dev` (watch). Output is `main.js`
at repo root (gitignored, built at release time). No test suite exists in
this repo — verification so far has only been `node --check` for syntax,
not behavioral testing inside actual Obsidian.

## Settings model (`this.settings`, persisted via `saveData`/`loadData`)

| key | default | meaning |
|---|---|---|
| `templateHeading` | `'none'` | Which heading (exact text, e.g. `## todo`) to roll over. `'none'` = whole-file unfinished-todo fallback mode. |
| `skipCompletedTasks` | `true` | **New this session.** When true, strips `- [x]` lines and their nested children out of the rolled-over section. |
| `deleteOnComplete` | `false` | After rollover, delete the rolled-over lines from yesterday's note. |
| `removeEmptyTodos` | `false` | Drop lines that are exactly `- [ ]` / `- [  ]` (empty checkbox, no text) from what gets added to today. |
| `displayTodayInHistory` | `false` | Append "N years ago today" backlinks to today's note. |
| `todayHistoryHeader` | `'## Today in history'` | Header text for that backlink block. |
| `historyShowDirect` | `false` | Use `![[...]]` embed instead of `[[...]]` link for history backlinks. |
| `todayHistoryCount` | `'1'` | How many years back to link (1–5, string-typed from dropdown). |

## Core algorithm (post-this-session)

### `getHeadingSection(file, templateHeading)` — src/index.js
Replaces the old regex-only todo scanner (`getAllUnfinishedTodos`, now
deleted).

- Reads yesterday's note, splits into lines.
- If `templateHeading === 'none'`: filters for unfinished-checkbox lines
  only (`/^\s*[-+*]\s\[[^xX]\]\s.*/`) — this is the legacy behavior,
  preserved as-is.
- Otherwise:
  1. Determines heading level from `#` count in `templateHeading`.
  2. Finds the line that **exactly matches** `templateHeading.trim()`
     (`line.trim() === templateHeading.trim()`). This is the same
     exact-match assumption the original code relied on (it used
     `String.replace(templateHeading, ...)`), just made explicit as a
     line search instead of a substring replace.
  3. Scans forward for the next line matching `/^(#{1,6})\s/` whose `#`
     count is `<= level` (i.e. same-or-higher-level heading = sibling or
     ancestor). That's the section boundary.
  4. Returns `lines.slice(headingIndex + 1, endIndex)` — everything
     between the heading and its boundary, heading line itself excluded
     (because the caller re-inserts content *after* the existing heading
     text in today's note, it doesn't duplicate the heading).
- Returns `[]` if the heading isn't found or has no legal `#` prefix
  (caller then just no-ops, same as "0 todos found" before).

### `stripCompletedTasks(lines)` — src/index.js
New this session. Runs only if `skipCompletedTasks` is true.

- Walks lines top to bottom, tracking `skipIndent` (indentation level of a
  completed task currently being dropped, or `null`).
- A line matching `/^\s*[-+*]\s\[([^\]])\]\s/` with `x`/`X` inside the
  brackets is dropped, and `skipIndent` is set to that line's leading
  whitespace length.
- While `skipIndent !== null`, any non-blank line with *more* leading
  whitespace than `skipIndent` is also dropped (treated as a nested
  child). The first line seen with indentation `<= skipIndent` (or a
  blank line) ends the skip.
- **Indentation-based nesting detection, not markdown-list-parsing.**
  It does not distinguish tabs vs spaces, doesn't understand Obsidian's
  actual list/outline model, and doesn't use `metadataCache.listItems`
  (which the old, buggy, unused code in `getAllUnfinishedTodos` was
  reaching for but never finished). This is a pragmatic heuristic, not a
  real outline parser.

### `rollover()` changes
- Calls `getHeadingSection` then conditionally `stripCompletedTasks`
  instead of the old `getAllUnfinishedTodos`.
- `removeEmptyTodos` filtering is unchanged — still an exact string match
  on trimmed line content, so it only catches literally-empty checkboxes,
  not e.g. `- [ ]   ` with trailing junk or a checkbox with only a link.
- `deleteOnComplete` still deletes lines from yesterday's note by matching
  against the **raw** (pre-`removeEmptyTodos`-filter, but
  post-`stripCompletedTasks`) `todos_yesterday` array via
  `lines.includes(...)`. Worth double-checking: if `skipCompletedTasks`
  is on, completed tasks are *not* in `todos_yesterday` anymore, so
  `deleteOnComplete` will **leave completed tasks sitting in yesterday's
  note** even though the rest of the section got moved. That's arguably
  correct (nothing to "complete-and-clear" if it wasn't rolled over) but
  wasn't explicitly asked for — flag this behavior to the user if it
  comes up.
- Notice text changed from "N todo(s) rolled over" to "N item(s) rolled
  over" since it's no longer just todos.

## Known gaps / things to verify before shipping

1. **No integration test against a real Obsidian vault.** Everything so
   far is `node --check` syntax validation only. The heading-boundary
   slicing, in particular, needs to be tried against real files with:
   nested headings, headings with trailing whitespace, headings that
   appear more than once in the file (first match wins — could be wrong
   file/heading), and CRLF vs LF line endings (`contents.split('\n')`
   will leave stray `\r` at line ends on CRLF files, which would break
   the exact-match heading search and the checkbox regexes).
2. **Exact heading string matching is fragile** — flagged to the user at
   the end of the last session, not yet resolved. `templateHeading` comes
   from a dropdown populated from the *template* file's headings
   (`RolloverSettingTab.getTemplateHeadings`), but matching happens
   against *yesterday's daily note* content. If the note's heading text
   differs at all from the template's (extra space, different case,
   edited manually) the match silently fails and nothing rolls over — no
   error, note just doesn't update. `templateHeadingNotFoundMessage` only
   fires for the *today* insertion side, not for this yesterday-side
   lookup failure.
3. **`stripCompletedTasks` indentation heuristic** may misfire on:
   tab-indented lists mixed with space-indented lists in the same file,
   lines that are indented for reasons other than nesting (e.g. wrapped
   paragraph text), and callouts/code blocks that happen to be indented
   under a completed task.
4. **`deleteOnComplete` interaction with `skipCompletedTasks`** (see
   above) — behavior is plausible but unconfirmed as intended.
5. **README.md / README-CN.md are stale** — still describe the old
   "todos under a heading" behavior, not "entire section under a
   heading." Should be updated once the behavior above is confirmed
   correct.
6. **No settings migration path** — existing users upgrading will get
   `skipCompletedTasks: true` by default (via `Object.assign` with
   `DEFAULT_SETTINGS`), which was chosen deliberately to match old
   behavior, but this hasn't been tested against a real `data.json` with
   pre-existing settings.
7. **`manifest.json` / `package.json` version still `0.0.1`** — not
   bumped for this change; do that before release along with a
   CHANGELOG entry.

## Session log

**This session (continuing from a prior turn):**
- User asked to bring over the *entire* heading section (not just todo
  lines), with "skip completed tasks" as an optional toggle rather than
  implicit behavior.
- Clarified via quick-question: completed tasks + their nested content
  should be fully removed when the toggle is on; new mode replaces the
  old extraction entirely (no dual-mode toggle).
- Implemented `getHeadingSection` + `stripCompletedTasks` in
  `src/index.js`, removed the old `getAllUnfinishedTodos` (which also
  fixed a pre-existing bug: undeclared `taskUndoCount` variable that
  would throw if that code path ever ran).
- Added `skipCompletedTasks` setting + toggle in
  `src/ui/RolloverSettingTab.js`, updated heading/delete descriptions to
  reflect new whole-section behavior.
- Verified both files with `node --check --input-type=module` only — no
  behavioral/runtime testing done.
- Flagged the exact-heading-match fragility to the user; not yet
  addressed (see gap #2).

## Useful next steps (pick up here)

- [ ] Decide on and implement a fix for gap #2 (fuzzy/whitespace-
      tolerant heading matching), if the user wants it.
- [ ] Manually test in an actual Obsidian vault: multi-year daily notes,
      nested sub-headings inside the target heading, completed tasks with
      nested sub-bullets, CRLF line endings.
- [ ] Decide/confirm intended `deleteOnComplete` + `skipCompletedTasks`
      interaction (gap #4); adjust code or docs accordingly.
- [ ] Update README.md and README-CN.md to describe whole-section
      rollover instead of todo-only rollover.
- [ ] Bump `manifest.json`/`package.json`/`versions.json` version and add
      a changelog before publishing a release.
