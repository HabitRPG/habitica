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
  ([7a479098](https://github.com/habitrpg/habitrpg/commits/7a479098dc6535654e322c737d80813790967941))
- **todos:**
  - add migration for dateCreated & dateCompleted #2478
  ([4cc39f16](https://github.com/habitrpg/habitrpg/commits/4cc39f16a13f5fb9f0e3ddde7d274c0f224f4a0e))
  - add dateCompleted to todos so they're archived 3 days after completion, not 3 days after creation. Fixes #2478
  ([b1afc177](https://github.com/habitrpg/habitrpg/commits/b1afc177aa4bfc4cbd9b847e40431db91666d9c3))
- **translation:** Fix #2585.
  ([06200acc](https://github.com/habitrpg/habitrpg/commits/06200accada462c3234ab407cfb0f6b684e5effe))
- **translations:**
  - fix #2564 and similar ones
  ([42740902](https://github.com/habitrpg/habitrpg/commits/42740902055a3807532028a5dfb39eff905c104f))
  - add env.t to rootScope
  ([13131087](https://github.com/habitrpg/habitrpg/commits/13131087ff9563d2d174b2c978102f0dc2b87387))
  - remove translations for privacy & terms
  ([a9095f34](https://github.com/habitrpg/habitrpg/commits/a9095f346479336be13b2bf341666b908fa30b3d))
  - merge @luveluen pull request, fix some syntax
  ([a6c67f17](https://github.com/habitrpg/habitrpg/commits/a6c67f17815558f19895b8f67d29c40c14689f09))
  - @lefnire now everything is ok
  ([52decb7e](https://github.com/habitrpg/habitrpg/commits/52decb7edeefb4755ea832b0cf63eaeea5e93259))
  - correct some variables
  ([fba73953](https://github.com/habitrpg/habitrpg/commits/fba739535bc1b630d73eb469448e9c3706043efd))
  - revert some views
  ([d000c706](https://github.com/habitrpg/habitrpg/commits/d000c70679ae0e13d9bec749295e42cc8e299c95))


## Features

- **administrators:** start adding features page for admin accounts
  ([f7f4a0c1](https://github.com/habitrpg/habitrpg/commits/f7f4a0c166558ba7e5461732f7bb6d7bcac25f88))
- **bailey:** notif about STWC updates + scroll-purchase deadlines (@colegleason)
  ([90176444](https://github.com/habitrpg/habitrpg/commits/90176444e9c7a318040829e8b71d1493b5d58e9e))
- **challenges:**
  - add angular-ui-select2 for simpler find/select challenge winner.
  ([9fa45217](https://github.com/habitrpg/habitrpg/commits/9fa452173989889c48ed696a45cf4a1dc16294a4))
  - add button for csv export
  ([ae0d758d](https://github.com/habitrpg/habitrpg/commits/ae0d758d8fc751219a693fee7f3e3ebcfbd67590))
  - add csv export for challenge progress. WIP, will refine this over time - but we need it something like this for the STWC come 1/31.
  ([16a602f9](https://github.com/habitrpg/habitrpg/commits/16a602f94c3b7c99d49e42b47b4835b65a243690))
  - markdown in challenge-descriptions
  ([41233c7b](https://github.com/habitrpg/habitrpg/commits/41233c7b167905eeccfdff5589789e002ec23f97))
- **cheating:** prevent +habit spamming with a 10s timer
  ([ad4ca665](https://github.com/habitrpg/habitrpg/commits/ad4ca6655a3bdd870bb08173530372f81fdc9102))
- **homepage:**
  - start cleaning up homepage, add navbar for play button & upcoming links
  ([0ddaae4d](https://github.com/habitrpg/habitrpg/commits/0ddaae4d7525277e696a57d20234e49cd6fd1cbc))
  - use .marketing for centering, add playbutton as static in footer. This is pretty ugly (http://gyazo.com/215e20729569689ab48cf56c71c1fe28), let's iterate / prettify. @deilann
  ([47bcaf83](https://github.com/habitrpg/habitrpg/commits/47bcaf83e760dbb266ae7ff2f7299c2a1cdf3712))
- **marketing:**
  - add video tuts on "learn more" page until we have some copy
  ([5028707c](https://github.com/habitrpg/habitrpg/commits/5028707c7b174b5e050c7c1662155e781a6b415b))
  - some frontpage updates, a screenshot, & "contact us" button mods
  ([a582a054](https://github.com/habitrpg/habitrpg/commits/a582a0546d680d36a21c507deff725a6c38fdb28))
- **premium:**
  - updates to group plans info page
  ([66f95cdd](https://github.com/habitrpg/habitrpg/commits/66f95cdd4cfb698fddc765a77b66d29e31eb1361))
  - backport client-side premium code to public repo, it's client-side anyway (@colegleason @paglias)
  ([2e18f0eb](https://github.com/habitrpg/habitrpg/commits/2e18f0eb82f5efc77544d33d1db3fbb9cc583124))
- **quests:**
  - add level requirement for quests
  ([9e69d795](https://github.com/habitrpg/habitrpg/commits/9e69d7959f174955f44429a94f22ce40fc5f7861))
  - add canBuy so we can exclude certain items from the market (if you can only find them on quest-drop, etc). This isn't the prettiest, change?
  ([f16654d2](https://github.com/habitrpg/habitrpg/commits/f16654d2354dc86cc7c52e1cf0562f850cf203be))
  - allow quests to drop multiple items
  ([d9e5725e](https://github.com/habitrpg/habitrpg/commits/d9e5725ee13f7e9ad329fc548537d5265cf483ca))


## Docs

- **rebirth:** Bullet point about repurchase of limited ed gear after Rebirth

