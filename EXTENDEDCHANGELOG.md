<a name="">HabitRPG</a>
#  (2014-01-28)


## Documentation

- **rebirth:** Bullet point about repurchase of limited ed gear after Rebirth
  ([d3f4a561](https://github.com/habitrpg/habitrpg/commits/d3f4a561fdf137e5d8f406bae03be4fef1caff22))


## Bug Fixes

- **#2003:** healer gear not showing
  ([949cd97b](https://github.com/habitrpg/habitrpg/commits/949cd97b91b42e9450eba559bbfea17e239ab100))
- **#2375:** merge in @SabreCat's stats.jade changes "More elegant show/hide setup for attribute bonuses"
  ([518f200a](https://github.com/habitrpg/habitrpg/commits/518f200a8fc7373b44ed7d7b5f016d921b0746bd))
- **beastmaster:** fixes #2557, adds opacity to previously-owned pets after they're mounted. You can earn them back again
  ([5caaff1c](https://github.com/habitrpg/habitrpg/commits/5caaff1cea1a68fe572e7ddf4aac50248b13df5d))
- **bosses:** don't reset progress.up when starting a new quest. We want to be able to carry over damage from the same day a boss battle begins, even if the dailies were completed before battle-start. Fixes #2168
  ([4efd0f5e](https://github.com/habitrpg/habitrpg/commits/4efd0f5ed8708f2491dd483f93e3d7a268a6337d))
- **classes:**
  - misc fixes
  ([d2121a85](https://github.com/habitrpg/habitrpg/commits/d2121a858716cb5a532a53ee9c5a1adaa74a7f69))
  - misc class fixes (not @snicker, ng-if on item store since we dynamically swap it sometimes)
  ([478be611](https://github.com/habitrpg/habitrpg/commits/478be6111337cd200374f7f31b959725c6a0b945))
- **find_uniq_user:** fix
  ([ecbe780e](https://github.com/habitrpg/habitrpg/commits/ecbe780e70549b1470504efe052f238c89a9db14))
- **mounts:** Move avatar upward when mounted regardless of pet
  ([bc1adeb1](https://github.com/habitrpg/habitrpg/commits/bc1adeb1277103a5ca1f756e175ed68bbe837a2f))
- **nodemon:** ignore CHANGELOG.md on watch
  ([d6c55952](https://github.com/habitrpg/habitrpg/commits/d6c55952da8b49f36e9d8e4570d80931d081343d))
- **party:** Round boss health up instead of to nearest integer
  ([626da568](https://github.com/habitrpg/habitrpg/commits/626da5681f5ea95700f8ddf40587c7184926971c),
   [#2504](https://github.com/habitrpg/habitrpg/issues/2504))
- **paypal:** fixes #2492, remove environment check for now, only have production-mode option. revisit
  ([1dc68112](https://github.com/habitrpg/habitrpg/commits/1dc68112d131e4ebdec32ddff938eb6311d6565f))
- **profile:** fix bug where empty profile displayed on username click
  ([0579c432](https://github.com/habitrpg/habitrpg/commits/0579c432489c4a038e8c9f95ea3b285f5abc146f),
   [#2465](https://github.com/habitrpg/habitrpg/issues/2465))
- **quests:**
  - bug fix to multi-drop
  ([f478d10c](https://github.com/habitrpg/habitrpg/commits/f478d10c20f816cd104b3f0da814c189957f45f5))
  - list multiple rewards in dialog
  ([e48c7277](https://github.com/habitrpg/habitrpg/commits/e48c7277f8256cf827790aece51e897fe0439374))
- **settings:** reintroduce space between captions and help bubbles stripped during localization
  ([5ddf09fe](https://github.com/habitrpg/habitrpg/commits/5ddf09fe13c7f8d844c8c47be0fb8f8b2fd1df33))
- **spells:**
  - more $rootScope spell-casting bug fixes
  ([47bd6dcb](https://github.com/habitrpg/habitrpg/commits/47bd6dcb79778d90d6f3ddeb003c3d8e45433333))
  - add some spells tests, don't send up body to spell paths
  ([e0646bb9](https://github.com/habitrpg/habitrpg/commits/e0646bb98d44b6874b5259107c9be5fa34c58933))
  - some $rootScope.applying action fixes so cast-ending is immediate instead of waiting on response. Also, slim down party population to the essentials to avoid RequestEntityTooLarge
  ([c6f7ab8a](https://github.com/habitrpg/habitrpg/commits/c6f7ab8a5c6f4e382208a928b90ba5f4eba9cd37))
  - <ESC> to cancel spell-casting
  ([a1df41ad](https://github.com/habitrpg/habitrpg/commits/a1df41ad8165cd9eb6d2d5d59c7fe404edde716c))
- **stable:** show hatchable combo when petOwned>0 (fyi @deilann)
  ([51bff238](https://github.com/habitrpg/habitrpg/commits/51bff23885ca0080e7e71ff752daa0950ae923ae))
- **stats:** Better layout for attribute point allocation
  ([d782fc6b](https://github.com/habitrpg/habitrpg/commits/d782fc6b6a3cd7e90d327c93a5764626b2990c74))
- **tests:**
  - include select2 in test manifest
  ([38b4cea7](https://github.com/habitrpg/habitrpg/commits/38b4cea73299f51c4db7f6b2eb12533d219745f8))
  - don't use cluster in tests, else we get "connection refused"
  ([7a479098](https://github.com/habitrpg/habitrpg/commits/7a479098dc6535654e322c737d80813790967941)