## Obsidian Daily Repass

[Português 🇧🇷](README.ptbr.md)

A daily review companion for [Obsidian](https://obsidian.md) that carries your unfinished work forward into today's note, so you never have to copy and paste it yourself.

> Repass your day, one note at a time.

### What does it actually do?

Say you have a **Daily notes** plugin set up in Obsidian, and yesterday's note had a couple of to-dos you never got around to. Normally you'd have to open yesterday's note, find the leftovers, and copy them into today's note by hand.

This plugin does that for you:

- It looks at your most recent daily note.
- It grabs the tasks (and, if you want, a whole section of notes) that aren't finished yet.
- It adds them to today's note automatically.
- If you want, it can also remove them from yesterday's note once they've been moved, so you don't end up with duplicates.

You trigger it with a single command whenever you're ready — it doesn't happen silently in the background without you knowing.

### Do I need anything else installed?

Yes — this plugin relies on Obsidian's **Daily notes** feature (built into Obsidian) or the **Periodic Notes** community plugin. Either one needs to be enabled and set up with a folder and date format before this plugin has anything to work with.

## Installing the plugin

This plugin isn't listed in Obsidian's official Community Plugins browser yet, so the easiest way to install it is with a small helper plugin called **BRAT**. Don't worry — BRAT is itself a normal, well-known Obsidian plugin, and installing it takes less than a minute.

**Step 1 — Install BRAT**
1. In Obsidian, open **Settings**.
2. Go to **Community plugins** and click **Browse**.
3. Search for `BRAT` (full name: *Obsidian42 - BRAT*).
4. Click **Install**, then click **Enable**.

**Step 2 — Use BRAT to install this plugin**
1. Open the **command palette** (`Ctrl/Cmd + P`).
2. Search for and run `BRAT: Add a beta plugin for testing`.
3. Paste in this repository's link: `https://github.com/kuuh4/obsd.daily.repass`
4. Click **Add Plugin** and wait for BRAT to confirm it worked.
5. Go back to **Settings → Community plugins**, find "obsd.daily.repass" in your list, and toggle it **on**.

That's it — no files to download or move by hand. When a new version comes out, you can update it from BRAT's settings page with a couple of clicks.

## How to use it

1. Open the **command palette** (`Ctrl/Cmd + P`, or `/` inside a note).
2. Search for **"obsd.repass"**.
3. Choose **"bring tasks to today's note"** to pull yesterday's unfinished items into today.
4. If something went wrong, choose **"Undo last import/rollover"** to put things back — this only works for about 2 minutes after running the command.

## Settings, in plain terms

You'll find these under **Settings → obsd.daily.repass**:

- **Template heading** — Pick a heading (like `## To-do`) if you only want that section of yesterday's note brought over. Leave it on "None" and the plugin will just grab every unfinished to-do in the file instead.
- **Skip already-completed tasks** — When on, finished tasks (`- [x]`) are left behind instead of being copied over along with everything else.
- **Delete rolled-over content from previous day** — When on, once something is successfully copied to today, it's also removed from yesterday's note. Turn this off if you'd rather keep a full history and just accept a bit of duplication.
- **Remove empty todos in rollover** — Skips to-dos that have no text in them (just an empty checkbox).

## What it doesn't do

- It won't run automatically in the background — you choose when to trigger it.
- It only looks one day back, not your whole history at once.
- It can't undo changes made more than a couple of minutes ago, or after Obsidian has been closed and reopened.

---

### About this fork — obsd.daily.repass

This repository is a fork of `obsidian-daily-todo-pro` / `obsidian-rollover-daily-todos`, maintained by Deki @ kuuh.art.

This fork includes MIT-licensed code from upstream sources. Original portions of the project remain licensed under MIT, while this fork's newer additions are licensed under the Duck License for non-commercial use. Commercial use of the new contributions requires prior permission; please contact the copyright holder to obtain a license. See `LICENSE` for details.

#### Original source

- Upstream project: https://github.com/shichongrui/obsidian-rollover-daily-todos
- Original fork: https://github.com/die4passion/obsidian-daily-todo-pro
- Original author(s): `shichongrui`, `Die4passion`

#### License

- Original upstream code: MIT
- This fork's newer contributions: Duck License for non-commercial use
- Commercial use of this fork's newer contributions requires prior permission
- See `LICENSE` for the Duck License text and attribution requirements.
