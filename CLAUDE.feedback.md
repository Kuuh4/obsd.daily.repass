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
```

else from that, everything is fine by now