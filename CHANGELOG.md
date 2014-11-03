<a name="">My app - Changelog</a>
#  (2014-10-29)


## Bug Fixes

- **IE:** Remove comment triggering quirks mode in IE, fixes #3550
  ([09392aca](watch/commits/09392aca24230e6981313fd6416a2491d74d7dd4))
- **accessories:** add body accessory to user model, fixes #3346
  ([c441ae41](watch/commits/c441ae418bcc22a74dd9ed679d36b3e798a25b49))
- **avatar:** put missing ng-click=buy-set back in
  ([ab3c238d](watch/commits/ab3c238d11ef2cebfa03f0dad04d210648ba38c7))
- **avatar.jade:** change .notBackground to .noBackgroundImage
  ([a6d10120](watch/commits/a6d101202cf6485b48583c295308337e46525296))
- **backers:** give missing backer mount to $70+, sorry everyone :( :( fixes #3544
  ([831f9711](watch/commits/831f971193e3c4d3bcf1007ac08cfade4ab813cb))
- **backgrounds:** 15G confirm dialog, fixes #3595
  ([99fb9b09](watch/commits/99fb9b09595bccfe7b2b8266328ef963e41b9549))
- **bailey:**
  - tweak
  ([b8b76d6c](watch/commits/b8b76d6ce97fc4a999987aa9bba089d6d5d17d17))
  - small tweaks to 7/31 (spacing, remove project files)
  ([9efda1d9](watch/commits/9efda1d95500388a80977b115a4a023adeea2513))
  - add links to recent update
  ([17c6df4f](watch/commits/17c6df4f6accad6c2a8879c41541256acc204658))
  - updated wording to save vicky
  ([95193f55](watch/commits/95193f550db78f5a60a278c6164d4bbe4939ce23))
- **bower:** pin angular @beta-11, that ~ was upgrading to beta-17 which doesn't play well with jQuery right now
  ([745d330c](watch/commits/745d330ce78e5360025783fb2d5fdf0a81e9c489))
- **challenges:** since we're setting {minimize:false} on tasks, don't overwrite user tasks.*.challenges in the _.merge()
  ([0bb1de68](watch/commits/0bb1de680cd8654fb9c8a522ac41a8495b57a4c2))
- **communityGuidelines:** modify script query to use collection indexes first for better perf
  ([85aef2dd](watch/commits/85aef2dd274e82766274384b94a72d3efced1bb0))
- **console:** remove console.log
  ([40fb17fd](watch/commits/40fb17fdaf149e14c9b31932b4b31dcb2fb69e2a))
- **coupons:** fix to limit
  ([5c309444](watch/commits/5c309444e050160b7d7852d3f03508acde862395))
- **delete account:** allow deleting account after they've canceled subscription, before it terminates
  ([97373242](watch/commits/973732421a048f701443cfc3b1ecc8a16ec4b3ca))
- **dilatory:**
  - dont' modify original user.progress on world boss dmg, fixes #3737
  ([016d99a4](watch/commits/016d99a4a793222c1267e23dc2bf6e80f6b2bed3))
  - tmp fix to prevent high damage #3712
  ([860b3acc](watch/commits/860b3acc52eb122ca5dd266e219d57bfe9ab7f86))
  - round boss hp/rage to bil/mil/thou, fixes #3667
  ([9c55bfb4](watch/commits/9c55bfb498e7c34b730bc9bfbd00f07a7018e478))
  - typo
  ([de2ba362](watch/commits/de2ba362749cb7f2adc684e441c3f4ce0f0bd607))
  - misc chat fixes for better formatting of neglect strikes
  ([14c60192](watch/commits/14c60192582ec0516231804bae6b77454d32be85))
- **emails:**
  - try multiple attemps (delay not avalaible in api because in not yet released version)
  ([292d2455](watch/commits/292d2455ba2fb7c6f83903b4455879e27371af5c))
  - re-add emails for payments, @lefnire should be ok now I had used req.user but it did not exist. There is a way to test payments locally? Because even now I can not verify it is really ok
  ([900d8e7d](watch/commits/900d8e7dfab87707fe43e1c5b7606832130ffba6))
  - send only if email found
  ([3118508e](watch/commits/3118508e9c17993a2722b677e3ed9fde85da7231))
- **fbAuth:** get user email @lefnire this should be all we need but not having the keys i can not test before going live
  ([63403126](watch/commits/634031269546376576d0d30af8f1ac6d83601bec))
- **filters:** use k not K for thousand
  ([a56b1eec](watch/commits/a56b1eec129114773e31ca4d57fb42bea8d36bfc))
- **filters.jade:** prevent duplication of new tags
  ([eedb1d14](watch/commits/eedb1d147cd2f3b0fee05ba6eb9dedf6575441b2))
- **flower:** remove default on flower for now, #1529 @Alys
  ([33b2e8c4](watch/commits/33b2e8c4fedaa0bb899f4fee023169d0c6034454))
- **footer:** update github link
  ([020f2785](watch/commits/020f278577f4f3807321b0b7d1a0d8e385f3328d))
- **global-modules:** prevent labels from hiding tooltips
  ([d1a5ff0c](watch/commits/d1a5ff0cef4856d18f3850aa01af192104a3bd7e))
- **groupsServices:** allow for direct modification of data @lefnire it is necessary for mobile but does not break anything
  ([6db5b53c](watch/commits/6db5b53c81b48a78b01ff28b251989f1835e5410))
- **i18n:**
  - add support for latin american spanish
  ([81b96b0f](watch/commits/81b96b0f7ee8b55729fbf4e3da3b6ef3601c9ee4))
  - add moment support for chinese
  ([15641b5f](watch/commits/15641b5f371bda0d71357e53b1fd951f83b0c1cf))
  - use string
  ([7e11d970](watch/commits/7e11d970a88bfba956c754aa88a2eeafaf95dfff))
  - stable
  ([57e1013a](watch/commits/57e1013ada7e7c80bc286085153f23a8b0f1aa16))
  - use strings
  ([74d206ab](watch/commits/74d206ab742af1c0b3acb7ff1cc183a60eaa1022))
  - use strings
  ([df8eb107](watch/commits/df8eb107cda3cd78f59735cd63547242fbb81620))
  - fix /content api call
  ([01c9307c](watch/commits/01c9307cd137b40b31ab9413dd179b7e62c5a9fc))
  - signup, clone default tasks
  ([a38f2354](watch/commits/a38f2354f503fb4570d132220a013f6e091cb7d0))
  - callback => next
  ([50f28d44](watch/commits/50f28d4478ef27b16d461449335464e8fd2bb835))
  - fix #3461
  ([8c6564b0](watch/commits/8c6564b0f50e39c637a6c65716467173cca2cf91))
  - use strings
  ([304beb64](watch/commits/304beb64823de0b65dcc4eb3fed70f95c8c4f319))
  - use everywhere i18n.getUserLanguage middleware - part 2
  ([4ac10585](watch/commits/4ac10585bb5f9171c1f594f5153e2c1b02c8c581))
  - use everywhere i18n.getUserLanguage middleware
  ([9aa118e3](watch/commits/9aa118e3342fb5acd93ed605dbe3385531d0874e))
  - default tasks checklists
  ([ce69b42b](watch/commits/ce69b42b2b1788de6fb7b8d9a05b1f2cddcd7d0d))
  - use correct branch
  ([f3d15c9b](watch/commits/f3d15c9b91e1518d6b7b049db30a8ab1e1510c2c))
  - misc
  ([57e93d66](watch/commits/57e93d6623e468136a1cdab5c8bf5cbe3b10ae93))
  - pet and mounts
  ([9b435026](watch/commits/9b4350266922a4f2f698e20569dacbad8f21d98a))
  - pass req.language when using batchUpdate
  ([ddf5ad8e](watch/commits/ddf5ad8ec948d123c5e9c534ab2e914ea7804dcc))
  - use translated attributes and classes
  ([52d2693d](watch/commits/52d2693d94f883fce4766c9f43bb75f976f04d08))
  - translate class names in equipment
  ([dce4dd3a](watch/commits/dce4dd3ad65a8b016dcb79dc29cd2adb015bd122))
  - missing strings
  ([99f50b04](watch/commits/99f50b0461af1b3a08610402eafa0f62a691637f))
  - end tour
  ([d0f14407](watch/commits/d0f144077e45145e1dfcbca01bb7e05a1b3e7b7f))
  - spacing
  ([e4f8ee1b](watch/commits/e4f8ee1b93d6b8c5c919499b8056dbc6c1835320))
  - spaces around string
  ([8eb65126](watch/commits/8eb65126379416eb76b328cf2b5f75fac8450037))
  - user creation does not override preferences
  ([70ecad3c](watch/commits/70ecad3c65f90b967b2f1a211082092492fa3b82))
  - group name
  ([dd4accf5](watch/commits/dd4accf56f0bb84edfc52ada475722490cb34392))
  - group name
  ([31449727](watch/commits/314497271a74e98c323c73c75fdba8109f0bca5a))
  - use right strings
  ([95d57590](watch/commits/95d57590422f64986cb8550a3c48a4d72240a755))
  - use strings
  ([1f8722cb](watch/commits/1f8722cb5724404f535a104461e68e58285dde81))
  - better strings for items
  ([6930b693](watch/commits/6930b693e0ebe05321ececd612fffedf67ea2c56))
  - use strings
  ([21efe44d](watch/commits/21efe44d4d42d9fbad85bd1fe1f9927d88f9c502))
  - use habitrpg-shared branch for bower
  ([d485ea71](watch/commits/d485ea71432705b4def7bda105fe88e0f2b78bae))
- **jade:**
  - update api page to new doctype
  ([95e71c68](watch/commits/95e71c68de295abc81ea07c4abfaf495aad386b2))
  - fix warings
  ([4c8309c8](watch/commits/4c8309c8cce5ff610d34944c433da83888260059))
  - fix jade warning about "missing space before text for line..."
  ([e8779f21](watch/commits/e8779f21215fd67a44e54997d1059188e7289de8))
- **memleak:**
  - possible improvements to leaked vars #4079
  ([57a5a62d](watch/commits/57a5a62d7c3266808bc72e8ca2de7888ff4bdf75))
  - temp, wonky fix to #4079 . Sets closure vars `user` to null in api.batchUpdate(). More will be needed
  ([ead42e7c](watch/commits/ead42e7cef968aa8ae82bf5ba1ee4e893abc2e4e))
- **mobile:**
  - start adapting boss to mobile
  ([0837f2c3](watch/commits/0837f2c39bad1562d8e9152e9aac0ecc80cb94d4))
  - export i18n for mobile so it can temporarily use en translations
  ([3edd37f5](watch/commits/3edd37f537b5c12f98ecc8757e67ec3362bc9609))
- **modules:** load i18n
  ([c2aed860](watch/commits/c2aed860dbb68c537f9a3c16866d2a741b53345b))
- **moment:**
  - use new syntax, remove deprecation warning
  ([cd4626ec](watch/commits/cd4626ec06c44854477f2cc5a67c6face71b4999))
  - fix deprecated warnings, use updated moment syntax
  ([2a812887](watch/commits/2a8128872d91c17eb6c07ebb0b2d0eb99570da3a))
- **mongo:** tmp fix to #3607 until https://github.com/LearnBoost/mongoose/issues/1920 fixed
  ([8d313761](watch/commits/8d31376165def21d4266971e868f33529b003645))
- **newMessages:** ad migration
  ([9d2723b4](watch/commits/9d2723b4186cd19a7b7f754f292f3c783d0c6ac4))
- **notifications:** fix drop notifications
  ([a30ee436](watch/commits/a30ee4368a4f525284f4f9ece1472de21d542909))
- **package.json:** relax and update bower version
  ([899581ee](watch/commits/899581ee560e7710b01d62b0003a63c5dc6272e3))
- **password:** case-insensitive emails in forgot-password
  ([327482f0](watch/commits/327482f0b0c628956d52638a2130094cd5d4a8cc))
- **payments:**
  - revert unwanted change
  ([8da33857](watch/commits/8da33857e4c73d571a44f9be0f4199f22fbc3b7f))
  - revert payments.js to 5cc4c60, see #2454 cc @paglias
  ([ad146d6d](watch/commits/ad146d6d883ccd8a2b9eb91936506f12c678105d))
- **pets:** if !Content.hatchingPotions[x], use string passed for displayname. Fixes #3575
  ([efc9a6e7](watch/commits/efc9a6e715842b7e3518c96a2803977d445fa8a5))
- **profile:** fix profile classes for mobile include
  ([311586e5](watch/commits/311586e5a370baac976be094744fbfa5e33d0823))
- **pushTo:** only pushToBottom on todos
  ([dc359e7f](watch/commits/dc359e7f75653e720c308bdc6df086a2f7370c77))
- **quests:**
  - prevent very high damage
  ([89369e21](watch/commits/89369e21a3daf9c6b69e26487b96a4e061d1d09e))
  - show completion dialog
  ([d848faee](watch/commits/d848faee8eb2c7a48c1c34d193575bb3d31e276c))
  - don't reset quest progress when world boss defeated
  ([496618c6](watch/commits/496618c6658c28caa580b7a0dfa775353082be99))
  - when leaving group, if leader or quest.leader is leaving, re-assign to most senior member. #3709
  ([80dbc111](watch/commits/80dbc1111e231cce0ae9eb25f84d49049162b77a))
  - temporarily send error email on questStart (if already started), see #3451. Revert later
  ([35ef88c6](watch/commits/35ef88c6c054cf912606b5e51298d243bc8ab1e2))
  - don't allow questStart on already-started quests
  ([9a4e8d38](watch/commits/9a4e8d38b46d02475ca97121b5d77a777f8d1f92))
- **responseInterceptor:** update response interceptor to use latest angular API (prep for 1.3)
  ([19c0a6b9](watch/commits/19c0a6b9b0d40be43405b5e44c51879a6fa640bc))
- **shared:** use develop branch
  ([f29eaab7](watch/commits/f29eaab7190d07ab4c37da87644d430984b083b4))
- **sortable:**
  - revert back to jqueryUI, fixes #3946
  ([f9812231](watch/commits/f981223153532035d72c35d42412628145c40385))
  - don't trigger sort when dragging in place, fixes #3926
  ([4ba860ea](watch/commits/4ba860ea8ca5d1102a2847721842152dd352ebdf))
- **spells:** temp fix to #4067, for some reason _v is undefined after casting spells?
  ([562f593c](watch/commits/562f593c8f77fb14fff41eb4176ffb69affa8823))
- **spookDust:**
  - rename to spooky sparkles
  ([8e855816](watch/commits/8e855816791f63f170bb9bb29da4e65946ded20e))
  - user serverside method for spookdust as it's path-protected
  ([e666d2f8](watch/commits/e666d2f837608caa9e4cbee74d9df7382e8042a6))
- **static:** fix static/api page, fixes #3636
  ([1fbf3a7e](watch/commits/1fbf3a7eba58c7de14e282b848b0e74a9fd71ac9))
- **subscriptions:** expose cancelSubscription on $rootScope (don't know why $scope doesn't work here). Fix UI bug
  ([0dadc86a](watch/commits/0dadc86a619075a03a302e677668f836a5472762))
- **swagger:**
  - rollback unwanted changes
  ([0efb74ea](watch/commits/0efb74eaed6ba16e58e1f86b2039a1fff1b3b53d))
  - correct API docs, fix #3679
  ([e72a6668](watch/commits/e72a6668fc2c7dbfda4e5431bd1b40a181797bb2))
- **tags:** fix sortable tags by separating edit & !edit into diff <ul>s (cc @Fandekasp)
  ([50a34eb6](watch/commits/50a34eb6c70cd8f042731a4d6925c023803de4dd))
- **tasks:** tmp fix for #4066, minimize:false on tasks so they have tags:{} default empty object
  ([a6631f5d](watch/commits/a6631f5d3681dc9424c9dc3cc2157b4c72250421))
- **tests:** snowball
  ([ef83c999](watch/commits/ef83c9999b5c7a34dd597a8f43faaaff5c0a42b1))
- **vagrant:** explicitly call bower install
  ([bbd14bd4](watch/commits/bbd14bd47c91c82a9bcbc5e063b277e8cfaf90c3))


## Features

- **admin:** allow admins to update user's items (restoring lost items, granting quest scrolls, etc). @deilann :)
  ([34236536](watch/commits/34236536df4038a2999d34aba7be9083fbd03958))
- **audio:** refactor user.preferences.{sound,soundTheme} into just user.preferences.sound. Fix audio dropdown bug by moving to list-items instead
  ([39911ef8](watch/commits/39911ef8e043cd3826d3c39a98126df8dad6a793))
- **auth:** allow logging in with either username or email address
  ([772ea500](watch/commits/772ea500a37a7b6779cbc826f3e27889dba594e4))
- **backgrounds:**
  - move backgrounds to mixin
  ([50d888e7](watch/commits/50d888e7f858d0f222cff6e58d5944b00afb2e1b))
  - bailey
  ([2aacf633](watch/commits/2aacf633080165a2b8166960b0d4e43b15b59b0e))
  - i18n for backgrounds
  ([e3aeaab6](watch/commits/e3aeaab64174832924da5033750c0e8f6ff64fc8))
  - use nested backgrounds as {set:{bg1,bg2,bg3}} for easier "purchase set". Refactor twoGem()
  ([da4f51f0](watch/commits/da4f51f049e822f327e23fe7b915e77814525d3c))
  - add backgrounds feature
  ([c6232c2d](watch/commits/c6232c2d1ac8e8c7eda3b8cefff6af67da3edbb1))
- **block-user:** show "blocked" status in an alert, log the user out
  ([a4ae9332](watch/commits/a4ae9332bb693832b6089b30f08058a29956aa4f))
- **bosses:** add limit-break for bosses
  ([850f67cd](watch/commits/850f67cd29a99d214bf43c1e245a6845a625c835))
- **chat:**
  - dynamic list of tavern mods (see http://goo.gl/9XhIZ6)
  ([e5c002bc](watch/commits/e5c002bcdb417d260a29afebbaaa22eb3ff6dbce))
  - allow banning problem users from chat rooms
  ([af74ff9d](watch/commits/af74ff9da0e94b8cf45c4a6da01829309c206d9f))
- **clearCompleted:** explain what clearCompleted does #3670
  ([c0ae0b35](watch/commits/c0ae0b35b61f581b69f83f59bb65b85c23e3ba10))
- **contribs:** start for #3801, update to new badge colors
  ([e10c04c9](watch/commits/e10c04c9bcf09e8f33fa7dfe4e9bbe88ec58b58a))
- **contributors:** small update to alys's script
  ([35308853](watch/commits/35308853a53590c38dac27e5707dfc9832598dab))
- **coupons:** update wording @veeeeeee
  ([439828d2](watch/commits/439828d2b1f005286dcd836691818d9bf714435d))
- **debug:** debug buttons for NODE_ENV==test too
  ([3136b4cc](watch/commits/3136b4cc2cceaa9187545646b029a746cb6548a3))
- **dilatory:**
  - add dilatory achievement
  ([b9463381](watch/commits/b946338184d1ae392621ab09824405ff3c386c1a))
  - scene damage + boss def/str. bug fixes, tests
  ([9f1035c3](watch/commits/9f1035c3172baa7f4db1fa4774319a5340f0cf37))
  - load tavern boss on each cron, removing caching for now (was too buggy)
  ([79df201c](watch/commits/79df201c662739c75a627fe63ae868069583a4d3))
  - model updates for tavern bosses
  ([fad4e5bb](watch/commits/fad4e5bb02bbd8a90d8e3cf1777be69a4fb00581))
- **directives:** move directive to be used in mobile to habitrpg-shared
  ([4f0b4fd1](watch/commits/4f0b4fd171d32c3c4f0b1ece43e8f43ecb80eb9a))
- **emails:**
  - add new images
  ([b1fc435c](watch/commits/b1fc435c9a22e515865f3f1f69dc2c9a829bfaa5))
  - add backoff to delay failed jobs
  ([1a15043c](watch/commits/1a15043cddcf3c1c2ac864b268e3b6e641d926f7))
  - add subscription cancelled email
  ([fda93773](watch/commits/fda93773c731506babf811da8d12c31d4dacfab8))
  - add emails on signup, subscription begin and donation
  ([fca45a3c](watch/commits/fca45a3c0b5b13a22b0fccd16402f812051551a1))
- **fall:** bailey + free candy script
  ([f38db7b9](watch/commits/f38db7b964a5f3a7dbbeeaa242ac2909183b2f61))
- **filters:** add button to hide tags and restyle
  ([1ff77932](watch/commits/1ff77932ff9c2ed227e7a700a6af4b43f78e975c))
- **hall:** click hero name for modal. fixes #3478
  ([ef166a9a](watch/commits/ef166a9a1085b59ae35c981ae321c648e22ecb7d))
- **halloween:**
  - updated bailey @lemoness
  ([fb68f70a](watch/commits/fb68f70adf355a92f6d6850a68d19ac5be8de148))
  - jackolantern pet
  ([0a630d7d](watch/commits/0a630d7d9be8d207364812820cb42b8f72895e51))
  - refactoring skin & hair to use the same mixins, add new halloween seasonal set
  ([3605b517](watch/commits/3605b517481de55b111295a8ade12ce330744fa8))
- **i18n:**
  - add change language button on front page, fix #3530
  ([1d92ddd6](watch/commits/1d92ddd645be4076a49ede74a56d76158aa04ae2))
  - add notices
  ([f2a10f8f](watch/commits/f2a10f8fc10bbd840a0c174d8cf46de93336dc53))
  - support british english
  ([f10b9cbf](watch/commits/f10b9cbfc6819b18e482507ff1f89cfd9731c0cd))
- **jade:** split file to be used on mobile
  ([45ab2826](watch/commits/45ab28269a4abaabf9b5486ed7cd2e6b32ecb0a2))
- **jshint:** add initial config
  ([aa0ce6d8](watch/commits/aa0ce6d8664dd875087c0af8e82363582bd431dd))
- **mobile:** adapt boss box to mobile
  ([6d251aeb](watch/commits/6d251aeb91bae435d22793acbb36c938f03b289c))
- **mystery:**
  - 201409
  ([351e220b](watch/commits/351e220b83cd0586c0c2e4341e73470a68e70fec))
  - august mystery
  ([2cc25114](watch/commits/2cc251149ce7020bfc981ee43e0f952e7036a935))
  - mystery items 062014
  ([2bffa643](watch/commits/2bffa643a95a4e423fa701f655d46044970740ed))
  - may 2014 mystery item
  ([29be5d6e](watch/commits/29be5d6e3ed53d2afe1001e58ab12b9b7adb00aa))
- **newStuff:** show newStuff modal on page load if present
  ([0b9c5271](watch/commits/0b9c5271bb6d58c9b6c5035edebfa472c17f93e5))
- **quests:**
  - spider quest
  ([39ab4154](watch/commits/39ab41549a4512ca17e73e827454b4bf3ec22264))
  - add rooster rampage quest
  ([94e1d485](watch/commits/94e1d48588354665135d314f26202270ccef4d00))
  - parrot quest
  ([a88fde98](watch/commits/a88fde98627d9302664ee03cc3081660d04d94c7))
  - seahorse quest
  ([c66c5ec8](watch/commits/c66c5ec83b6cbe78cc04ac711a15690b4ed058ea))
  - add octopus quest
  ([f85d6b29](watch/commits/f85d6b29788e6236dd7a13f943b21af17c20f09d))
- **rat:** add rat quest
  ([8506db98](watch/commits/8506db984955a129b7d8ce0319fe78dcbc2dda86))
- **readme:** dependencies badge
  ([0bd21f31](watch/commits/0bd21f318b1578587f5367bae82511e0f6d30b4f))
- **registration:** show some basic registration information on Settings > Site (if facebook, then "Registered with Facebook". If local, then username & email)
  ([592ffd98](watch/commits/592ffd9818f3dd605ced71bf1741c16b7888f0a2))
- **sortable:** use angular-ui-sortable instead of jqueryui directly
  ([750135b6](watch/commits/750135b6734b8a3978885e97d83bc14fb423a3cb))
- **spookDust:** add the spookDust special spell, like snowballs. Note: this is handled specially so spookDust can be bought with GP, is a WIP
  ([0841cafd](watch/commits/0841cafd1f68dd2217f27e0f9aeed4320b827f44))
- **stats:** expos stats jade files to mobile
  ([e60cf01b](watch/commits/e60cf01b6f16a839497922edb6a523ea7688ade2))
- **subscription:** disable "update card" for paypal subscribers
  ([a1f2375b](watch/commits/a1f2375b9df6a6b6dcb61c0fd38e7b4dd2dcbd0b))
- **todolist:** Push To Top Button
  ([76ac1039](watch/commits/76ac10395f5844b98438aa8233a2d6f6050dfbb0))
- **toolbar:** add button to hide/show toolbar
  ([2309184a](watch/commits/2309184ae3fdec65e1409eb99a34642b21a854ea))

