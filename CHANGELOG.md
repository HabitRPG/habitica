<a name="">My app - Changelog</a>
#  (2014-02-15)


## Documentation

- **rebirth:** Bullet point about repurchase of limited ed gear after Rebirth
  ([d3f4a561](watch/commits/d3f4a561fdf137e5d8f406bae03be4fef1caff22))


## Bug Fixes

- **#2003:** healer gear not showing
  ([949cd97b](watch/commits/949cd97b91b42e9450eba559bbfea17e239ab100))
- **#2375:** merge in @SabreCat's stats.jade changes "More elegant show/hide setup for attribute bonuses"
  ([518f200a](watch/commits/518f200a8fc7373b44ed7d7b5f016d921b0746bd))
- **allocateNow:** Send empty object to user.ops per @colegleason suggestion
  ([f6e12fa2](watch/commits/f6e12fa25e4366622db3e6f1b6ab03e848b49e10))
- **batch-update:** send errors to client if batch-update found an error, crash pid.
  ([f9679629](watch/commits/f967962996be69a5335454610af76d10e1db08b8))
- **beastmaster:** fixes #2557, adds opacity to previously-owned pets after they're mounted. You can earn them back again
  ([5caaff1c](watch/commits/5caaff1cea1a68fe572e7ddf4aac50248b13df5d))
- **bosses:** don't reset progress.up when starting a new quest. We want to be able to carry over damage from the same day a boss battle begins, even if the dailies were completed before battle-start. Fixes #2168
  ([4efd0f5e](watch/commits/4efd0f5ed8708f2491dd483f93e3d7a268a6337d))
- **bower:** updated jquery directory
  ([191b789d](watch/commits/191b789d760a7bdc7d1b53727f6127b677c78c94))
- **bs3:**
  - fix to MemberModalCtrl parameter
  ([ebd1df93](watch/commits/ebd1df932e28263e5cc01e8a35f545ab26f1e8bd))
  - port pet feeding bar
  ([5db96ebc](watch/commits/5db96ebca2fbd5b64f49af03a5137ea80f6b1673))
- **buffs:** Move help bubble to left of special buffs
  ([4f911a68](watch/commits/4f911a68d805742e6744383948eea6f224f2b0ea))
- **challenges:**
  - better handling of deleted challenges. If !chal, break the task.challenge. Move the function into userController#score so we have access to next, etc. fixes #1883
  ([33b326b5](watch/commits/33b326b59685ea6e50f9950094d009460ce80094))
  - challenge csv export now has proper filename
  ([36f21196](watch/commits/36f21196f466260b7cd52b283c50b9e16943f668),
   [#2689](watch/issues/2689))
- **classes:**
  - misc fixes
  ([d2121a85](watch/commits/d2121a858716cb5a532a53ee9c5a1adaa74a7f69))
  - misc class fixes (not @snicker, ng-if on item store since we dynamically swap it sometimes)
  ([478be611](watch/commits/478be6111337cd200374f7f31b959725c6a0b945))
- **css:**
  - temp fix for bailey height
  ([c8faffcc](watch/commits/c8faffcc7289090990c3a17ab8c07a00069f5ce4))
  - menu and gems wallet margin
  ([975b5165](watch/commits/975b5165730477310aa64bac27ddc07a34ea6c1d))
  - lighter columns title
  ([a22e2814](watch/commits/a22e28143f74302c8340c3d33b01af9714875523))
  - better food tray
  ([1c41c4dd](watch/commits/1c41c4ddb9a5b04297a371bc4d6aba013ce33f17))
- **errors:**
  - `return next(err)` when experiencing errors, instead of res.json(500,{err:err}). Let the top-level error handler handle this (needed for upcoming versionerror discarding)
  ([bf5e9016](watch/commits/bf5e9016a4cb7889b3a9e39b90eb35cb8f7f9ec8))
  - handle if err.message == undefined, send err
  ([b42dacf2](watch/commits/b42dacf2035d62453b585cfcf453829a423b59de))
- **event-tracking:**
  - typo
  ([ff9d4b88](watch/commits/ff9d4b886ef7a98da0514975441a8bb845496c31))
  - stripe sub, not pp
  ([0c99976b](watch/commits/0c99976bf5a3c7f04f031d62a8b07c862c85a0a9))
- **find_uniq_user:** fix
  ([ecbe780e](watch/commits/ecbe780e70549b1470504efe052f238c89a9db14))
- **footer:** ensure window.env is accessible from static pages, so we can get deferred scripts on frontpage (esp google analytics)
  ([67ee011a](watch/commits/67ee011aa35969db93e2d7dc1cd1e1f587f146de))
- **groups:**
  - pass missing next into Like function
  ([afee0968](watch/commits/afee0968f8f6923847e186d3e11b9745ced9606e))
  - send error if +1 errored
  ([5b6c4427](watch/commits/5b6c4427b504b6143f24bfee314f562b9803c5a4))
- **hall:** let's try $gt instead of $ne:null, the query is still slow
  ([a72b0131](watch/commits/a72b013131cfc7fa5d3affdbfe59b5b3cb15ae89))
- **i18n:** do not save user language for now
  ([094a4be0](watch/commits/094a4be0015f0f0deaaf94a0734193eb40a8beae))
- **misc:**
  - some styles & translations
  ([8f19f225](watch/commits/8f19f225f104960b3cf27e229a5571e014be697c))
  - isStaticPage and debug buttons
  ([19139f56](watch/commits/19139f562b8e68ed43f4cab748920f1e0634e86e))
- **missing-gems:** remove ad-removal from script, since ads are part of subscription
  ([e1240dde](watch/commits/e1240dde1d3dcaca4235fad384fea5c07a3706bf))
- **mongoose:** typo
  ([2786b362](watch/commits/2786b362067efdd245c3efa3a4891021fcfaab2d))
- **mounts:**
  - fix pets & mounts css to position the user based on pet/mount equip
  ([37340d23](watch/commits/37340d23180da02d3742dc9be40a5fb780ecb13b))
  - Move avatar upward when mounted regardless of pet
  ([bc1adeb1](watch/commits/bc1adeb1277103a5ca1f756e175ed68bbe837a2f))
- **nodemon:**
  - Add another ignore for weirdsauce Windoze dev environments
  ([3fda08c3](watch/commits/3fda08c366793c8fbcbf701a9594ae3b2fd8bbea))
  - ignore CHANGELOG.md on watch
  ([d6c55952](watch/commits/d6c55952da8b49f36e9d8e4570d80931d081343d))
- **party:** Round boss health up instead of to nearest integer
  ([626da568](watch/commits/626da5681f5ea95700f8ddf40587c7184926971c),
   [#2504](watch/issues/2504))
- **paypal:** fixes #2492, remove environment check for now, only have production-mode option. revisit
  ([1dc68112](watch/commits/1dc68112d131e4ebdec32ddff938eb6311d6565f))
- **performance:** cache spritesmith image, fix #2633
  ([f03d7d7d](watch/commits/f03d7d7dde4f8cb39babd2b982d77e7f88f349b7))
- **pets:** add questPets to UserSchema.items.mounts too fixes #2814
  ([42766125](watch/commits/42766125d5c8870f25c3a0a001473f700b8f6cc1))
- **profile:** fix bug where empty profile displayed on username click
  ([0579c432](watch/commits/0579c432489c4a038e8c9f95ea3b285f5abc146f),
   [#2465](watch/issues/2465))
- **quests:**
  - quests with a level cap cannot be bought before that level.
  ([dab9ddbd](watch/commits/dab9ddbda27f5e10e4545fea703deebfe2dd9975),
   [#2707](watch/issues/2707))
  - bug fix to multi-drop
  ([f478d10c](watch/commits/f478d10c20f816cd104b3f0da814c189957f45f5))
  - list multiple rewards in dialog
  ([e48c7277](watch/commits/e48c7277f8256cf827790aece51e897fe0439374))
- **readme:** remove text about translations wip
  ([f2bb1fd2](watch/commits/f2bb1fd26e44a9eb0ba325776bf335e021beeece))
- **settings:**
  - remove unnecessary code
  ([5f0cf657](watch/commits/5f0cf6575c0dc4cfc041956e3dc27898d8b4242d))
  - reintroduce space between captions and help bubbles stripped during localization
  ([5ddf09fe](watch/commits/5ddf09fe13c7f8d844c8c47be0fb8f8b2fd1df33))
- **spells:**
  - temp workaround for spell & task being undefined. #2649 #2640
  ([241d0414](watch/commits/241d04140f5db77929d9f597d232f55843bb0f5d))
  - more $rootScope spell-casting bug fixes
  ([47bd6dcb](watch/commits/47bd6dcb79778d90d6f3ddeb003c3d8e45433333))
  - add some spells tests, don't send up body to spell paths
  ([e0646bb9](watch/commits/e0646bb98d44b6874b5259107c9be5fa34c58933))
  - some $rootScope.applying action fixes so cast-ending is immediate instead of waiting on response. Also, slim down party population to the essentials to avoid RequestEntityTooLarge
  ([c6f7ab8a](watch/commits/c6f7ab8a5c6f4e382208a928b90ba5f4eba9cd37))
  - <ESC> to cancel spell-casting
  ([a1df41ad](watch/commits/a1df41ad8165cd9eb6d2d5d59c7fe404edde716c))
- **stable:** show hatchable combo when petOwned>0 (fyi @deilann)
  ([51bff238](watch/commits/51bff23885ca0080e7e71ff752daa0950ae923ae))
- **stats:** Better layout for attribute point allocation
  ([d782fc6b](watch/commits/d782fc6b6a3cd7e90d327c93a5764626b2990c74))
- **swagger:** fix jade script warning in swagger
  ([2e2fcfcf](watch/commits/2e2fcfcf464fbae21bff9e1be1ca915f071b976b))
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
- **toolbar:**
  - Tweak Settings drop-down
  ([e241429c](watch/commits/e241429cc3d2eca18d2f5a9726f6caa6270a1b02))
  - Tweak icon popovers
  ([4454204f](watch/commits/4454204f47f80e64119f7896bf246259173d115b))
  - tweaks
  ([5501d57e](watch/commits/5501d57e107c0bc7085847b0c808f027360fa405))
- **translation:** Fix #2585.
  ([06200acc](watch/commits/06200accada462c3234ab407cfb0f6b684e5effe))
- **translations:**
  - fix #2564 and similar ones
  ([42740902](watch/commits/42740902055a3807532028a5dfb39eff905c104f))
  - add env.t to rootScope
  ([13131087](watch/commits/13131087ff9563d2d174b2c978102f0dc2b87387))
  - remove translations for privacy & terms
  ([a9095f34](watch/commits/a9095f346479336be13b2bf341666b908fa30b3d))
  - merge @luveluen pull request, fix some syntax
  ([a6c67f17](watch/commits/a6c67f17815558f19895b8f67d29c40c14689f09))
  - @lefnire now everything is ok
  ([52decb7e](watch/commits/52decb7edeefb4755ea832b0cf63eaeea5e93259))
  - correct some variables
  ([fba73953](watch/commits/fba739535bc1b630d73eb469448e9c3706043efd))
  - revert some views
  ([d000c706](watch/commits/d000c70679ae0e13d9bec749295e42cc8e299c95))
- **user:**
  - make sure next is passed to all routes, and is available in err-back of batch updates
  ([0c21f54c](watch/commits/0c21f54c67b52b07c417fd8216c6b04bce59d0ab))
  - if need to upgrade site, send 501, not 400
  ([ab86ba11](watch/commits/ab86ba11bdb3379a8d8fa1814879640d61c57227))
  - PUT user retricted path errors are 401, not 500
  ([0aec4caa](watch/commits/0aec4caa785c3b12e15f1c2e19c5b67b20d1a6e1))
- **winston:** typo
  ([83b3739f](watch/commits/83b3739f4671a08466e057242f936140d5c739ef))


## Features

- **administrators:** start adding features page for admin accounts
  ([f7f4a0c1](watch/commits/f7f4a0c166558ba7e5461732f7bb6d7bcac25f88))
- **attributes:** Add backfill button in flat and classbased allocation modes
  ([76a7ab5b](watch/commits/76a7ab5bcce2d486dab3f447f0659ba870d1ff7e))
- **bailey:** notif about STWC updates + scroll-purchase deadlines (@colegleason)
  ([90176444](watch/commits/90176444e9c7a318040829e8b71d1493b5d58e9e))
- **bug-crushing:** add the critical hammer of bug-crushing
  ([00af5f7d](watch/commits/00af5f7d0258b0f7dddef8ede40bd825b057748a))
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
- **event-tracking:**
  - better page-view tracking via ui-router
  ([b093717b](watch/commits/b093717b8d54b61e5d4b44b0d56a1f43308f078c))
  - track registration count
  ([72b6c9bc](watch/commits/72b6c9bc9189275909804f9ecab18e9fe1f69d27))
  - pass ga to server user.ops
  ([9217b517](watch/commits/9217b5174ab9ab4754269263b214f6bfe45d4f1d))
  - track ecommerce events
  ([d89fb17b](watch/commits/d89fb17b03b2e2c0fb1da77fb13cc660a5b6c9d1))
  - add server-side GA tracking for ecommerce events
  ([f7b4a04a](watch/commits/f7b4a04a590ade26871abc726ade2c666176488e))
  - start adding some client-side GA event-tracking
  ([ffb42906](watch/commits/ffb42906e1d7c6bd8f01e715d98d96426bc6d0de))
- **groups:** add group chat notifications
  ([ce82be63](watch/commits/ce82be637d1d707e899aeee5f315da69367fa367))
- **habitBirthday:** add habitrpg birthday event. includes cakes for all pets, absurd party robes, npc swap, badge, etc. @lemoness
  ([aff885c0](watch/commits/aff885c05c03bd70beeb0db8d68922671fc46309))
- **homepage:**
  - start cleaning up homepage, add navbar for play button & upcoming links
  ([0ddaae4d](watch/commits/0ddaae4d7525277e696a57d20234e49cd6fd1cbc))
  - use .marketing for centering, add playbutton as static in footer. This is pretty ugly (http://gyazo.com/215e20729569689ab48cf56c71c1fe28), let's iterate / prettify. @deilann
  ([47bcaf83](watch/commits/47bcaf83e760dbb266ae7ff2f7299c2a1cdf3712))
- **marketing:**
  - more copy for mobile
  ([cbb44847](watch/commits/cbb448478edfd0003c43d20ed216bab20d25dadd))
  - start fleshing out the about page with images, content, etc. Create separate videos page
  ([cb079977](watch/commits/cb079977e6f35f9308ab28158373dd3e1de9f798))
  - add video tuts on "learn more" page until we have some copy
  ([5028707c](watch/commits/5028707c7b174b5e050c7c1662155e781a6b415b))
  - some frontpage updates, a screenshot, & "contact us" button mods
  ([a582a054](watch/commits/a582a0546d680d36a21c507deff725a6c38fdb28))
- **premium:**
  - subscriber mystery item (doesn't yet do anything)
  ([d0342628](watch/commits/d0342628340ce7dce95fa20177ccbcfe1ebf93e6))
  - backport server code for premium subs (it's just ccard handling & uer model stuff)
  ([3660f1a8](watch/commits/3660f1a85c1447de118f334a145d0d7698b93981))
  - updates to group plans info page
  ([66f95cdd](watch/commits/66f95cdd4cfb698fddc765a77b66d29e31eb1361))
  - backport client-side premium code to public repo, it's client-side anyway (@colegleason @paglias)
  ([2e18f0eb](watch/commits/2e18f0eb82f5efc77544d33d1db3fbb9cc583124))
- **quests:**
  - add flags.levelDrops for dropping items at certain levels
  ([78315d82](watch/commits/78315d828ba9a1033526b9a72b7c385281e6ad0a))
  - allow dropping scrolls in quests
  ([54064deb](watch/commits/54064debf3c95390b5507acd826f9db3339b9f09))
  - allow html in quest notes
  ([800231cf](watch/commits/800231cf6481351032d4e5143edd54f5e7e3a179))
  - add level requirement for quests
  ([9e69d795](watch/commits/9e69d7959f174955f44429a94f22ce40fc5f7861))
  - add canBuy so we can exclude certain items from the market (if you can only find them on quest-drop, etc). This isn't the prettiest, change?
  ([f16654d2](watch/commits/f16654d2354dc86cc7c52e1cf0562f850cf203be))
  - allow quests to drop multiple items
  ([d9e5725e](watch/commits/d9e5725ee13f7e9ad329fc548537d5265cf483ca))
- **rainbow-hair:** add rainbow hair colors
  ([82d9233d](watch/commits/82d9233d99167d6704c878884dcc49a55cc7d884))
- **restore:** add restore-gp back in. Parly to end the winter event, partly due to the convo at #2681 regarding subscriptions. Fixes #2681
  ([179316e1](watch/commits/179316e10fa7597b08573d94721861baa3dbbb1c))
- **toolbar:**
  - try with icons instead of text, test against prod / beta & get a vote.
  ([7456f00d](watch/commits/7456f00dc6122ad293652b7a32fb4ce671f75241))
  - add toolbar featuring navigation, gems / subs, bailey, & chat / invite notifications
  ([f72cb213](watch/commits/f72cb21300c078b439b3334bfa3e205ba04dc949))
- **tracking:** gems > toolbar separately from wallet
  ([f6abfc67](watch/commits/f6abfc67b31808c0e2d325c235747260855338c9))
- **valentine:** valentine event
  ([fd6eb872](watch/commits/fd6eb8724eae38d02849ffccb09f1f9c7d8e490d))
- **winter:**
  - remove purchasable winter hair colors, keep available if they purchased during event
  ([f8796e90](watch/commits/f8796e9028d4f4cd2b5c5ede1734d2876d174dc9))
  - remove winter scrolls & snowballs
  ([52f8f0d5](watch/commits/52f8f0d5b0fdf4271fcb5f7d497ad3bf544c24e8))


## Docs

- **rebirth:** Bullet point about repurchase of limited ed gear after Rebirth

