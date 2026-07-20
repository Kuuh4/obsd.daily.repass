2026-07-20 @15h @gmt-3

Test of V00.1 - First build of this branch.

It works quite nicely! It just happens to ignore numbered to-dos, as in :

```
1. [ ] kept
2. [x] kept //should get removed
3. [x] kept //should get removed
    1. [ ] kept //should get removed as well, by inheritance
- [ ] works //is kept
- [x] works //is removed
    - [ ] works //is removed as expected of inheritance

```

else from that, everything is fine by now


---

2026-07-20 @15h @gmt-3

Test of V00.2 - Build warnings review.

Build note:
- Running `npm run build` produced Rollup warnings about unused external imports for `Tasks` in `src/index.js`, `src/ui/RolloverSettingTab.js`, and `src/ui/UndoModal.js`.
- These warnings do not prevent the build from succeeding, but they are worth cleaning up later.