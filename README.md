# obsd.daily.repass
---
This repository is a fork of `obsidian-daily-todo-pro` / `obsidian-rollover-daily-todos`, maintained by Deki @ kuuh.art.

This fork includes MIT-licensed code from upstream sources. Original portions of the project remain licensed under MIT,
while this fork's newer additions are licensed under the Duck License for non-commercial use. Commercial use of the new
contributions requires prior permission; please contact the copyright holder to obtain a license. See `LICENSE` for details.

## Original source

- Upstream project: https://github.com/shichongrui/obsidian-rollover-daily-todos
- Original fork: https://github.com/die4passion/obsidian-daily-todo-pro
- Original author(s): `shichongrui`, `Die4passion`

## License

- Original upstream code: MIT
- This fork's newer contributions: Duck License for non-commercial use
- Commercial use of this fork's newer contributions requires prior permission
- See `LICENSE` for the Duck License text and attribution requirements.

## Obsidian Daily Todo Pro Plugin

[中文说明](README-CN.md)

inspired by <https://github.com/shichongrui/obsidian-rollover-daily-todos>

> get things dead day by day - enhance your daily note

## Main features

Import your unfinished todos in daily notes from yeaterday or a few days ago to today's daily notes.

## All features

- Put unfinished todos to today
- Delete yesterday's unfinished todos (optional)
- Ignore empty todos (optional)
- Select the title from the diary template as Todo you need to synchronize
  - No selection or no template gets, appends all toDos to the end of the file.
  - If a title is selected, only todos under the current title is selected and the subheadings are kept until the next sibling title is intercepted.
- Today in history (bottom)
  - self-selected titles
  - up to five years to display
- Lucky note
  - get a lucky note by a command.
  
## Commands you need

1. just use `ctrl + p`  or `/` in any file
2. then input `todo pro`
3. choose `Rollover Todos Now` to get todos
4. choose `Undo last rollover` to undo the changes.only availabal in min.
5. choose `Lucky Note` to get a lucky note.
