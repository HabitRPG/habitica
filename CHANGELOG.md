<a name="">My app - Changelog</a>
#  (2014-01-24)


## Documentation

- **rebirth:** Bullet point about repurchase of limited ed gear after Rebirth
  ([d3f4a561](watch/commits/d3f4a561fdf137e5d8f406bae03be4fef1caff22))


## Bug Fixes

- **#2003:** healer gear not showing
  ([949cd97b](watch/commits/949cd97b91b42e9450eba559bbfea17e239ab100))
- **#2375:** merge in @SabreCat's stats.jade changes "More elegant show/hide setup for attribute bonuses"
  ([518f200a](watch/commits/518f200a8fc7373b44ed7d7b5f016d921b0746bd))
- **bosses:** don't reset progress.up when starting a new quest. We want to be able to carry over damage from the same day a boss battle begins, even if the dailies were completed before battle-start. Fixes #2168
  ([4efd0f5e](watch/commits/4efd0f5ed8708f2491dd483f93e3d7a268a6337d))
- **classes:**
  - misc fixes
  ([d2121a85](watch/commits/d2121a858716cb5a532a53ee9c5a1adaa74a7f69))
  - misc class fixes (not @snicker, ng-if on item store since we dynamically swap it sometimes)
  ([478be611](watch/commits/478be6111337cd200374f7f31b959725c6a0b945))
- **nodemon:** ignore CHANGELOG.md on watch
  ([d6c55952](watch/commits/d6c55952da8b49f36e9d8e4570d80931d081343d))
- **profile:** fix bug where empty profile displayed on username click
  ([0579c432](watch/commits/0579c432489c4a038e8c9f95ea3b285f5abc146f),
   [#2465](watch/issues/2465))
- **quests:**
  - bug fix to multi-drop
  ([f478d10c](watch/commits/f478d10c20f816cd104b3f0da814c189957f45f5))
  - list multiple rewards in dialog
  ([e48c7277](watch/commits/e48c7277f8256cf827790aece51e897fe0439374))
- **settings:** reintroduce space between captions and help bubbles stripped during localization
  ([5ddf09fe](watch/commits/5ddf09fe13c7f8d844c8c47be0fb8f8b2fd1df33))
- **spells:**
  - more $rootScope spell-casting bug fixes
  ([47bd6dcb](watch/commits/47bd6dcb79778d90d6f3ddeb003c3d8e45433333))
  - add some spells tests, don't send up body to spell paths
  ([e0646bb9](watch/commits/e0646bb98d44b6874b5259107c9be5fa34c58933))
  - some $rootScope.applying action fixes so cast-ending is immediate instead of waiting on response. Also, slim down party population to the essentials to avoid RequestEntityTooLarge
  ([c6f7ab8a](watch/commits/c6f7ab8a5c6f4e382208a928b90ba5f4eba9cd37))
  - <ESC> to cancel spell-casting
  ([a1df41ad](watch/commits/a1df41ad8165cd9eb6d2d5d59c7fe404edde716c))
- **stats:** Better layout for attribute point allocation
  ([d782fc6b](watch/commits/d782fc6b6a3cd7e90d327c93a5764626b2990c74))
- **tests:**
  - include select2 in test manifest
  ([38b4cea7](watch/commits/38b4cea73299f51c4db7f6b2eb12533d219745f8))
  - don't use cluster in tests, else we get "connection refused"
  ([7a479098](watch/commits/7a479098dc6535654e322c737d80813790967941))
- **todos:**
  - add migration for dateCreated & dateCompleted #2478
  ([4cc39f16](watch/commits/4cc39f16a13f5fb9f0e3ddde7d274c0f224f4a0e))
  - add dateCompleted to todos so they're archived 3 days after completion, not 3 days after creation. Fixes #2478
  ([b1afc177](watch/commits/b1afc177aa4bfc4cbd9b847e40431db91666d9c3))
- **translations:**
  - merge @luveluen pull request, fix some syntax
  ([a6c67f17](watch/commits/a6c67f17815558f19895b8f67d29c40c14689f09))
  - @lefnire now everything is ok
  ([52decb7e](watch/commits/52decb7edeefb4755ea832b0cf63eaeea5e93259))
  - correct some variables
  ([fba73953](watch/commits/fba739535bc1b630d73eb469448e9c3706043efd))
  - revert some views
  ([d000c706](watch/commits/d000c70679ae0e13d9bec749295e42cc8e299c95))


## Features

- **bailey:** notif about STWC updates + scroll-purchase deadlines (@colegleason)
  ([90176444](watch/commits/90176444e9c7a318040829e8b71d1493b5d58e9e))
- **challenges:**
  - add angular-ui-select2 for simpler find/select challenge winner.
  ([9fa45217](watch/commits/9fa452173989889c48ed696a45cf4a1dc16294a4))
  - add button for csv export
  ([ae0d758d](watch/commits/ae0d758d8fc751219a693fee7f3e3ebcfbd67590))
  - add csv export for challenge progress. WIP, will refine this over time - but we need it something like this for the STWC come 1/31.
  ([16a602f9](watch/commits/16a602f94c3b7c99d49e42b47b4835b65a243690))
  - markdown in challenge-descriptions
  ([41233c7b](watch/commits/41233c7b167905eeccfdff5589789e002ec23f97))
- **cheating:** prevent +habit spamming with a 10s timer
  ([ad4ca665](watch/commits/ad4ca6655a3bdd870bb08173530372f81fdc9102))
- **quests:**
  - add level requirement for quests
  ([9e69d795](watch/commits/9e69d7959f174955f44429a94f22ce40fc5f7861))
  - add canBuy so we can exclude certain items from the market (if you can only find them on quest-drop, etc). This isn't the prettiest, change?
  ([f16654d2](watch/commits/f16654d2354dc86cc7c52e1cf0562f850cf203be))
  - allow quests to drop multiple items
  ([d9e5725e](watch/commits/d9e5725ee13f7e9ad329fc548537d5265cf483ca))


## Docs

- **rebirth:** Bullet point about repurchase of limited ed gear after Rebirth

