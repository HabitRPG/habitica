<a name="">My app - Changelog</a>
#  (2015-02-18)


## Documentation

- **rebirth:** Bullet point to reassure users that they can get their limited ed gear back after Rebirth
  ([667a4264](watch/commits/667a4264c594066b99fc0d9ad189602329c10e43))


## Bug Fixes

- **#4282:**
  - refactor for DRY unlock/hide paths
  ([1e5b7e6f](watch/commits/1e5b7e6f2d0026bf0849a33de2f5eb701605a274))
  - fix $parse errors in avatar customize screens
  ([0278caca](watch/commits/0278caca76dce9d2891d732a8eb3fe8fb50b1e11))
- **.task-filter:** force long words to wrap
  ([9c2c08c0](watch/commits/9c2c08c03d8449db5e8b4474a4663e8011f3a6fd),
   [#4308](watch/issues/4308))
- **?:** for issue 2222 - untick removes too little XP,GP
  ([6c5eae18](watch/commits/6c5eae184794fdab98d7a7b642d2c7bd5b06aefe))
- **Bailey:** correct date
  ([17138430](watch/commits/1713843067df6b40187755bc40c73da1ec6972e5))
- **Gems:** Clarify badge count
  ([f2c6c07f](watch/commits/f2c6c07ff87f9d90b710d64cb89dc150ecea8a4b))
- **I18N:**
  - Remove more hardcoded text
  ([8cd1ea48](watch/commits/8cd1ea48dbc4eea07cd4822bd0743046cad00aba))
  - Remove hardcoded text
  ([29f693cd](watch/commits/29f693cd246c20f0a85c644442566657e7a8fd93))
  - Translate TT in menu
  ([506c396b](watch/commits/506c396baf0ee708026644ef49a2c52ec676f620))
  - Make Time Travel translatable
  ([35b02cfd](watch/commits/35b02cfdd894a21f69175b81b5fefc74a0c35cda))
  - Translate Time Travelers
  ([8d042745](watch/commits/8d042745bed9cff86b15987882f56a4a9214194f))
- **IE:** Remove comment triggering quirks mode in IE, fixes #3550
  ([09392aca](watch/commits/09392aca24230e6981313fd6416a2491d74d7dd4))
- **MMM:** typo
  ([dacaf41d](watch/commits/dacaf41d636d8eec22fd71c45f31d68a590fe3e3))
- **NYE:**
  - fix cards
  ([ccfe4809](watch/commits/ccfe48099fda85f7af5c354533637c1c16b15b96))
  - Correct achievement badge
  ([438516b2](watch/commits/438516b26f8d799de6401d359fc1d9f1c00614e4))
  - I18N for random text
  ([e3572286](watch/commits/e35722865abad24f22bac9833a53f3bbd7d8e1ac))
  - I18N for random text
  ([7a16c644](watch/commits/7a16c644c3b9946abffe3713178d60155af850e0))
  - t undefined
  ([11beb14e](watch/commits/11beb14e1421e2376d22edcbed61b9272cf4bd60))
  - Card to self exploit
  ([e7388822](watch/commits/e7388822f1d3c01350408778b4af6c33c49d7207))
  - I18N shop text
  ([5623fb00](watch/commits/5623fb00780ec294b84ec04964254268a3bc8a06))
- **Saddle:** Tweak wording
  ([33fbc571](watch/commits/33fbc5716bc1a448ab578c0eea873c7d73d47272))
- **Spring:** Add stats text to Spring gear
  ([f4d5ce83](watch/commits/f4d5ce83cb1d41fb0970a9da8544c930bcce1ce2))
- **abilities:**
  - Correct crits, desc for Flames
  ([af45479f](watch/commits/af45479f93d19c8552fa8e987bfbbb8b1f59b7ff))
  - Correct crits and desc for Smash
  ([6ff30462](watch/commits/6ff30462305d92908112df71661e56c0e668b264))
- **accessories:**
  - add body accessory to user model, fixes https://github.com/HabitRPG/habitrpg/issues/3346
  ([73b8128a](watch/commits/73b8128af992dcdd6b088519f72e267d83483564))
  - add body accessory to user model, fixes #3346
  ([c441ae41](watch/commits/c441ae418bcc22a74dd9ed679d36b3e798a25b49))
- **achievements:**
  - Tweak wording for Streaker
  ([258ed6f0](watch/commits/258ed6f003193d6ac205a0ae0d93695ff726f22b))
  - Differentiate singular and plural
  ([1e128a3a](watch/commits/1e128a3ae973ed05e33b7b408224f57570af6424))
- **auth:** search case-insensitive usernames when registering
  ([c3bb42b1](watch/commits/c3bb42b1086fccfa955d87e9d37801eb979204da))
- **autoAllocate:** don't detrain stats on ripening To-Dos
  ([70394ea0](watch/commits/70394ea0b99f4ece13bb8218ea9f8bc7f55c6057))
- **avatar:**
  - prevent avatar from obscuring name
  ([8cf3cd66](watch/commits/8cf3cd66ccd35cf0171a08a696ff67b5243d4235))
  - Correct "Facial Hair" text
  ([e4df3435](watch/commits/e4df3435e13690288c920236c039b70988bc24cf))
  - put missing ng-click=buy-set back in
  ([ab3c238d](watch/commits/ab3c238d11ef2cebfa03f0dad04d210648ba38c7))
- **avatar-sharing:**
  - screw it, 1.3.3 backwards compat isn't working at the router level anyway. Besides, avatar sharing hasn't worked via addthis for a while, so we don't need this
  ([a44e0f7c](watch/commits/a44e0f7c31dbb7f70c0a024a961ae10b7d5554e6))
  - angular@1.3.9 upgrade fixed the /#?memberId=x bug. Also, anon wasn't able to view avatar shares!
  ([a053486f](watch/commits/a053486fcde200fb212e9863ffefe60f3a562600))
- **avatar.jade:** change .notBackground to .noBackgroundImage
  ([a6d10120](watch/commits/a6d101202cf6485b48583c295308337e46525296))
- **avatar.styl:** improve label layout
  ([0943a229](watch/commits/0943a229ec5cbb976e204ec7ec4641b138aea39b),
   [#4349](watch/issues/4349))
- **backers:** give missing backer mount to $70+, sorry everyone :( :( fixes #3544
  ([831f9711](watch/commits/831f971193e3c4d3bcf1007ac08cfade4ab813cb))
- **backgrounds:**
  - Frigid, not Snowy, Peak
  ([285ff622](watch/commits/285ff6228cd2b2b5d82a0f887b6ac3fc8530c1db))
  - borders
  ([33b3448e](watch/commits/33b3448e1f869a4fc6499714293a2c8a7a367a07))
  - clearer wording wrt lim editions
  ([5beff883](watch/commits/5beff8833088835d92417c0f35c6302c0236dc74))
  - 15G confirm dialog, fixes #3595
  ([99fb9b09](watch/commits/99fb9b09595bccfe7b2b8266328ef963e41b9549))
- **bailey:**
  - mystery 3014 promo
  ([bd5f8d79](watch/commits/bd5f8d79eaddcbcc42957f92c2e059da8b44979e))
  - tweak
  ([b8b76d6c](watch/commits/b8b76d6ce97fc4a999987aa9bba089d6d5d17d17))
  - small tweaks to 7/31 (spacing, remove project files)
  ([9efda1d9](watch/commits/9efda1d95500388a80977b115a4a023adeea2513))
  - add links to recent update
  ([17c6df4f](watch/commits/17c6df4f6accad6c2a8879c41541256acc204658))
  - updated wording to save vicky
  ([95193f55](watch/commits/95193f550db78f5a60a278c6164d4bbe4939ce23))
- **beastmaster:** allow hatching pets when petOwned<=0 (fyi @deilann). Man, browserify adds so many lines - this commit is a one-liner, lol
  ([be986e09](watch/commits/be986e09f678696d1554d0dc69695a8bb4b59feb))
- **billing:** script to fix current_period_end, see #4420
  ([ca2d4511](watch/commits/ca2d45113c7f0d9ad5b59ac919355bb0d93737ef))
- **bootstrap:** upgrade angular-ui-bootstrap
  ([b36c9c0f](watch/commits/b36c9c0fb0515af78b67913de71c02cecd0c29ea))
- **bosses:** Limit Break => Rage
  ([1fc62f13](watch/commits/1fc62f1322612c1ca77b2a86d0c25e1dc3e10fd5))
- **bower:** pin angular @beta-11, that ~ was upgrading to beta-17 which doesn't play well with jQuery right now
  ([745d330c](watch/commits/745d330ce78e5360025783fb2d5fdf0a81e9c489))
- **cds:** max hour is 23 not 24
  ([193b92c1](watch/commits/193b92c16ba4a312d97194e7f2eba31a33acfd81))
- **challenges:** since we're setting {minimize:false} on tasks, don't overwrite user tasks.*.challenges in the _.merge()
  ([0bb1de68](watch/commits/0bb1de680cd8654fb9c8a522ac41a8495b57a4c2))
- **chat:** fix missing like button
  ([7de70fb5](watch/commits/7de70fb5b1782da1a46b9105ba30110674659b61))
- **checklists:**
  - Improved checklist popover text
  ([4a9cce3c](watch/commits/4a9cce3c24be772a21c530599ab3e2df5c7b1447))
  - Bring MP behavior in sync with XP/Gold
  ([14fc4a3c](watch/commits/14fc4a3c317e7671ec74735cfdc705d5fb48b011))
  - Make checklist To-Do behavior more intuitive
  ([a770d0c7](watch/commits/a770d0c72f7ec836dfbc2e0f03d2a51acae3e057))
- **classes:** misc class fixes
  ([6d0a2ad5](watch/commits/6d0a2ad5b3fd265c51b7393ae0bccde8b157400c))
- **coffee:** ops, used js instead of coffee!
  ([91724277](watch/commits/91724277438a9a2b83e36f2106f5c688bbe0bac7))
- **communityGuidelines:** modify script query to use collection indexes first for better perf
  ([85aef2dd](watch/commits/85aef2dd274e82766274384b94a72d3efced1bb0))
- **config:** switch to new config style for emails, cc @lefnire
  ([727c96e5](watch/commits/727c96e5dafcdbc315f8934a7a2d434be2a2a00c))
- **console:**
  - remove console.log
  ([c301bd3e](watch/commits/c301bd3e89e4fb0b02bc62b5b16356cf327f46c0))
  - remove console.log
  ([40fb17fd](watch/commits/40fb17fdaf149e14c9b31932b4b31dcb2fb69e2a))
- **content:**
  - Cannot call 'toString' of undefined
  ([d5eb5bbf](watch/commits/d5eb5bbfe0416fbfa7270f371edc956c8c166c6b))
  - typo
  ([1bc87c80](watch/commits/1bc87c80d3e5e5cc64f3da075430db905e7ca144))
- **costume:**
  - better fix for #4274
  ([c0a3fc88](watch/commits/c0a3fc887a125341ebaea8085152a101cc5c895b))
  - fixes #4274
  ([43fa461a](watch/commits/43fa461a67ddea2125def4a0e517af081eab90ac))
- **coupons:** fix to limit
  ([5c309444](watch/commits/5c309444e050160b7d7852d3f03508acde862395))
- **critical-hammer:** add 40x40 shop icon
  ([7ace7b49](watch/commits/7ace7b49b10d62b373936ccfce58f795432ba2fe))
- **cron:**
  - plan check so it passes tests
  ([c72c8a94](watch/commits/c72c8a948f498218d06ffd651debf3e0c16f969a))
  - Move daily MP after Perfect Day
  ([676d90fd](watch/commits/676d90fda0c34107deb44231d57675455d71c0cb))
- **css:** gems alignment and remove unused code
  ([61047677](watch/commits/6104767711f3bf0be532e82a7b55a91a0392b390))
- **css spritesheet:** prevent duplication of css in customizer.css
  ([fb63ae25](watch/commits/fb63ae25f0d3bd1b5990c1f88c3b4da7e0285a49))
- **date:**
  - typo
  ([756fa834](watch/commits/756fa83418e470578b0b43975a7c4e3d2e244284))
  - add YYYY/MM/DD format
  ([cb13b5ac](watch/commits/cb13b5ac26c7bd43eb024679ca6083e328a2598c))
- **datepicker:** fixes #4273
  ([afbd2199](watch/commits/afbd2199e8608458d746f3a564cc231ce126b7e3))
- **db:** upgrade flags.recaptureEmailsPhase to new values
  ([eb1ca43c](watch/commits/eb1ca43c44788ee8bf45d2bfe4f7874b0b24a213))
- **delete account:** allow deleting account after they've canceled subscription, before it terminates
  ([97373242](watch/commits/973732421a048f701443cfc3b1ecc8a16ec4b3ca))
- **dilatory:**
  - add honey https://twitter.com/ogbajoj/status/489515513148497920
  ([b449387c](watch/commits/b449387cc0a4244747f321312c08128dfbb3bf45))
  - update rewards: 0gp, 0xp, food drops
  ([4cb79c6f](watch/commits/4cb79c6fffdf130fa76ab69e831f766f21cdcec0))
  - dont' modify original user.progress on world boss dmg, fixes #3737
  ([016d99a4](watch/commits/016d99a4a793222c1267e23dc2bf6e80f6b2bed3))
  - tmp fix to prevent high damage #3712
  ([860b3acc](watch/commits/860b3acc52eb122ca5dd266e219d57bfe9ab7f86))
  - update completion wording
  ([44af90ba](watch/commits/44af90bae7182e188ef22eb2297726af51591a75))
  - round boss hp/rage to bil/mil/thou, fixes #3667
  ([9c55bfb4](watch/commits/9c55bfb498e7c34b730bc9bfbd00f07a7018e478))
  - double-woops... rage/3
  ([6f615ad6](watch/commits/6f615ad634be9269d9f0e380ec1b67bc87f69f89))
  - typo
  ([de2ba362](watch/commits/de2ba362749cb7f2adc684e441c3f4ce0f0bd607))
  - woops, rage*3 (should cast it 3x during 30days)
  ([3900f520](watch/commits/3900f520263c82a55fcd36a942bec8cf38299db3))
  - update stats with real avgs from global usage
  ([893f04aa](watch/commits/893f04aaa2f2491d7db48c141a4058547780a63e))
  - misc chat fixes for better formatting of neglect strikes
  ([14c60192](watch/commits/14c60192582ec0516231804bae6b77454d32be85))
- **drops:**
  - Correct rarity tiers
  ([4d33d338](watch/commits/4d33d338687bf2ab77b7df639e768fc5b342131b),
   [#169](watch/issues/169))
  - Ratchet up base chance some more
  ([d232743f](watch/commits/d232743f2a9af9d1e30fd23b0e72a0c84b278f98))
  - Boost base drop chance
  ([734d5585](watch/commits/734d5585800870f50e91423f11b7a9310be570c2))
  - Further overhaul drop chance
  ([c32d91a3](watch/commits/c32d91a33184ac8bb1913d99c00cab6026903acf))
  - Increase base value, improve comments
  ([98d91a24](watch/commits/98d91a24ce2fba699e3d74115e30ffb31f0e0b7b))
  - Overhaul drops to a percentage multiplier system
  ([b7500018](watch/commits/b75000188f91b802554e58c28f853ab8bf11390b))
  - don't random-drop cakes, fixes #2700
  ([1b364250](watch/commits/1b36425099b7578bc9c2c7ec4e276439186f5d5d))
- **emails:**
  - parse json
  ([925bfe8a](watch/commits/925bfe8af44765ea05cef4a59a57b0eb88325c26))
  - remove unused variable
  ([739d8885](watch/commits/739d8885a36057bbf2198e350d507e92f87503d4))
  - try multiple attemps (delay not avalaible in api because in not yet released version)
  ([292d2455](watch/commits/292d2455ba2fb7c6f83903b4455879e27371af5c))
  - re-add emails for payments, @lefnire should be ok now I had used req.user but it did not exist. There is a way to test payments locally? Because even now I can not verify it is really ok
  ([900d8e7d](watch/commits/900d8e7dfab87707fe43e1c5b7606832130ffba6))
  - send only if email found
  ([3118508e](watch/commits/3118508e9c17993a2722b677e3ed9fde85da7231))
- **emoji:** move back to main jsemoji repo, fixes #4265
  ([89b1242e](watch/commits/89b1242e5310ff24fd975cf72a19c5da07922486))
- **errors:** ooo, and some other stray unecessary 500s
  ([2a202426](watch/commits/2a2024262b776ac634b0343105fda198ebc9b176))
- **event:**
  - Card notif display
  ([de21ec8c](watch/commits/de21ec8cf51c253a4eda21bf6fc70c64635d68f1))
  - Correct card notifs
  ([37ae50a7](watch/commits/37ae50a77af4ca176d42a44efb3ae9b8c2109645))
  - Line breakage II
  ([9a44ab76](watch/commits/9a44ab76ec3e093f093abee06475da998c8a23f0))
  - Line breakage II
  ([281e3fdb](watch/commits/281e3fdbb54a1d1adb6709ca295a546153d6703b))
  - Line breakage
  ([358b4213](watch/commits/358b42133080c897923043c899ad2ef4146fc8bd))
  - Localize poems
  ([9fddb08a](watch/commits/9fddb08aebfca32deb9287a43fcc49fe32b5538b))
  - Valentine's strings
  ([432eee75](watch/commits/432eee750f5bc31668a67b3b3b45b4f0fc3f5116))
  - Robes not for your head
  ([7e0d8104](watch/commits/7e0d8104632539468d547aa1b9b66936088ddc92))
  - Party robes
  ([51b2b9bd](watch/commits/51b2b9bda15b35eded359154888359396fb7f229))
  - Leave old achievement
  ([efd1333c](watch/commits/efd1333c06bb5572147a8d10b9dba6f5fb9d1c7c))
  - Correct achievement award
  ([a654d7ea](watch/commits/a654d7ea10748010885fdcf0f1845c63c985e6b9))
  - Robes shop icon
  ([0cc819cc](watch/commits/0cc819cc646960e003ba182096aeeaafb6aa6618))
  - Mystery sprite error
  ([37db763f](watch/commits/37db763fc28bc6db2b2dcb56eb2d18ede2f0c1b4))
  - Mystery typo
  ([6c8f9e39](watch/commits/6c8f9e39b63d4a4475458b7a010b137fcb3820b5))
  - Better quest text placement
  ([1b4843ff](watch/commits/1b4843ff586340abc51b3f45ccad0fe195fd6475))
  - quest syntax
  ([f4c582eb](watch/commits/f4c582eb2475e6f1bb846aba44b3ad690c4fc0b7))
  - Better shop flow
  ([1c908865](watch/commits/1c9088654881d91e3120dcc9729d6d0b2708db0b))
  - head, not helm
  ([e62cb74a](watch/commits/e62cb74ad01cf7395b81abd2c3764548291a6455))
  - grunt
  ([a4a94f79](watch/commits/a4a94f79734c136bdfd293d56c8a4dc473b93814))
  - Festify missed NPCs
  ([d37dd904](watch/commits/d37dd90484c83200dd513f6596a8b78a3dd41919))
- **event-gear:** Correct headgear costs
  ([424cf1a5](watch/commits/424cf1a5bf9b4bd02666a1bd3120303b531cabcd))
- **facebook:**
  - move from passport-facebook to Facebook JS SDK. Better security on FB login by validating accessToken. Create user from FB profile if none exists, allows 3rd-party apps to. Fixes #4221
  ([8651f0da](watch/commits/8651f0da25db33850f1dcd9c999da9245efbce5f))
  - try using facebook oauth route 2.1 #4221
  ([8ff971b1](watch/commits/8ff971b1ecacec854a77337118ab03da4e655429))
  - attempt using a callback buster to generate a new authorization code #4221
  ([1f72721e](watch/commits/1f72721e6a093c35d9a68d05fcdd39685df827d5))
- **fbAuth:** get user email @lefnire this should be all we need but not having the keys i can not test before going live
  ([63403126](watch/commits/634031269546376576d0d30af8f1ac6d83601bec))
- **feeding:**
  - "article" already includes a space
  ([28a74424](watch/commits/28a744248c5035b62810731e320cc994530ed5bc))
  - Even better phrasing
  ([be9ad4db](watch/commits/be9ad4db84cef2c57f168e413ca307b04a86de13))
- **filters:** use k not K for thousand
  ([a56b1eec](watch/commits/a56b1eec129114773e31ca4d57fb42bea8d36bfc))
- **filters.jade:** prevent duplication of new tags
  ([eedb1d14](watch/commits/eedb1d147cd2f3b0fee05ba6eb9dedf6575441b2))
- **flag-chat:** correct url for tavern flags
  ([4c785e84](watch/commits/4c785e84590c2fa6d69e697e6240020152599346))
- **flag-email:** correctly format date
  ([635ebf62](watch/commits/635ebf626bdbef17531cd945726a9837457d598c))
- **flag-message:** small refactor
  ([948d5762](watch/commits/948d5762cd2c73179a77835bd22bb7fae76458d6))
- **flags-emails:**
  - allow arrays in FLAG_REPORT_EMAIL
  ([9d22e65e](watch/commits/9d22e65e19ba63a5f91ae8cd03c2c1d3c655f552))
  - allow arrays in tnxEmails
  ([065227fa](watch/commits/065227fa8c347d6a1643378edd9f1c29c33ccd6c))
- **flower:** remove default on flower for now, #1529 @Alys
  ([33b2e8c4](watch/commits/33b2e8c4fedaa0bb899f4fee023169d0c6034454))
- **food:** popover-placement='top' in foodtray, fixes #4278
  ([d24ece97](watch/commits/d24ece973bf23161a9c21be14b41c4c6132c0147))
- **footer:** update github link
  ([020f2785](watch/commits/020f278577f4f3807321b0b7d1a0d8e385f3328d))
- **footerCtrl.js:** disable addThis hover
  ([45d30ffe](watch/commits/45d30ffef56cdec74849448195e9cca02af58d7d))
- **gear:** Typo correction
  ([b783f4ba](watch/commits/b783f4ba4c4fc7ceccb2027c6040e442fe084463))
- **gem-cap:** use customerId in gem purchase
  ([2018cc84](watch/commits/2018cc84ab9891d7ec32dd4dbae0cedfba7786b8))
- **gifts:**
  - $rootScope => Payments
  ([3423e985](watch/commits/3423e9857d6a00f8305e7906f01ee5760650d8dc))
  - allow gifting 0<gift<1 (cc @Alys @crookedneighbor)
  ([1a84d019](watch/commits/1a84d01933d5312c128fcfa93b98228d0233f558))
- **global-modules:** prevent labels from hiding tooltips
  ([d1a5ff0c](watch/commits/d1a5ff0cef4856d18f3850aa01af192104a3bd7e))
- **goldenknight:** add shop img for shield_special_goldenknight and fix translation issues, fixes https://github.com/HabitRPG/habitrpg/issues/4249
  ([d74f9d7a](watch/commits/d74f9d7a47c1829869c1b1bc7592ee09cacae5a2))
- **groupsServices:** allow for direct modification of data @lefnire it is necessary for mobile but does not break anything
  ([6db5b53c](watch/commits/6db5b53c81b48a78b01ff28b251989f1835e5410))
- **grunt:**
  - allow caching of spritesheets, fix #4542
  ([01d695ca](watch/commits/01d695cae5d820e2aeb567d4d9fa76da53bed7fc))
  - Push CSS
  ([61b82718](watch/commits/61b827183be2e5a8b956e485009fc31f1ddd746d))
  - remove unnecessary check
  ([f3c5d3f7](watch/commits/f3c5d3f73ac970162185454553610cc19fa2d823))
- **hair:**
  - Oldschool Winter
  ([223e87e6](watch/commits/223e87e6481ce1f2a20d81d8d83994d8519f5fcd))
  - Black 11-12
  ([970a0ed8](watch/commits/970a0ed831c8a5f2c5e662f5d3fbe8b64b353462))
- **hall:** remove global vars
  ([10fb931b](watch/commits/10fb931bf253eec96441da97109c46bef12841b7))
- **hedgehogs:** flip sprites, expand template to 81x99, position down & left. Fixes https://github.com/HabitRPG/habitrpg/issues/3000
  ([a741b744](watch/commits/a741b744b1f3f653daf8502398d3aa3787feb520))
- **i18n:**
  - language selection working on static pages
  ([42c0b443](watch/commits/42c0b443d7d81fab5260fed7252c5fc6f807a8a1))
  - remove duplicate strings cc @negue
  ([edbfc24b](watch/commits/edbfc24b0856765b668ae0f0013ea22b9aae493f))
  - fix english string
  ([17f9d4de](watch/commits/17f9d4de729bf1e4d22d6985631b3497f1df3259))
  - fallback for failing i18n compilation
  ([c484128a](watch/commits/c484128a2932705640066e74c44d125748792e9c))
  - "Cool" => "Tell Me Later" (people keep clicking cool, keeping bailey around forever)
  ([1d2902d5](watch/commits/1d2902d5e8d73e39c6339e60ec2672f4115754fe))
  - es_419 bug, use english translation for now (@paglias is this ok?)
  ([5e19663b](watch/commits/5e19663b71ebab0e9af3225b322f0b9dcc910b93))
  - add support for latin american spanish
  ([81b96b0f](watch/commits/81b96b0f7ee8b55729fbf4e3da3b6ef3601c9ee4))
  - add moment support for chinese
  ([15641b5f](watch/commits/15641b5f371bda0d71357e53b1fd951f83b0c1cf))
  - add strings
  ([8a822f65](watch/commits/8a822f653823c87fbae5896770e9cc2b70f3fbba))
  - remove static contrib list (see http://goo.gl/9XhIZ6 , #239)
  ([339b1c53](watch/commits/339b1c53546c5b6938ed0d4c0a4b67e27acdf167))
  - use string
  ([7e11d970](watch/commits/7e11d970a88bfba956c754aa88a2eeafaf95dfff))
  - stable
  ([57e1013a](watch/commits/57e1013ada7e7c80bc286085153f23a8b0f1aa16))
  - use strings
  ([74d206ab](watch/commits/74d206ab742af1c0b3acb7ff1cc183a60eaa1022))
  - use strings
  ([e7682a14](watch/commits/e7682a14f6a660b6f11a2b6bce7ead89693e2226))
  - use strings
  ([df8eb107](watch/commits/df8eb107cda3cd78f59735cd63547242fbb81620))
  - update broken code inside translations
  ([ff5bddff](watch/commits/ff5bddff2410de534f7021f03a8029d1dcdb472d))
  - another possible hotfix for wrong language, @lefnire this one works on my local computer but maybe it will not work on prod like the other one
  ([893164c5](watch/commits/893164c5359a4b211e7556e8bb6145fee03e8c3c))
  - super fast fix for i18n issues, REVISIT, cc @lefnire
  ([f1e1ea11](watch/commits/f1e1ea11eff011bb8832c6c8a3fc88ca981dd404))
  - fix /content api call
  ([01c9307c](watch/commits/01c9307cd137b40b31ab9413dd179b7e62c5a9fc))
  - fallback to english if locale not avalaible
  ([78589f9a](watch/commits/78589f9af4eeb716a62a3b65591ead514e1861c9))
  - signup, clone default tasks
  ([a38f2354](watch/commits/a38f2354f503fb4570d132220a013f6e091cb7d0))
  - callback => next
  ([50f28d44](watch/commits/50f28d4478ef27b16d461449335464e8fd2bb835))
  - fix #3461
  ([8c6564b0](watch/commits/8c6564b0f50e39c637a6c65716467173cca2cf91))
  - escaped quotes in npc.json
  ([d5409172](watch/commits/d5409172e3beeb281cab905bc9839cedbffacfc1))
  - mistery -> mystery
  ([f8912c85](watch/commits/f8912c8506e2a1a64b4900072c90ad09796b41e6))
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
  - two-handled
  ([190ad036](watch/commits/190ad036cc8d4abee35d26a6e938a90775eef163))
  - sync with develop
  ([1d2ae52d](watch/commits/1d2ae52d26d47cd5a3be6ba40e8aeef5508d6f6f))
  - typo
  ([583e546d](watch/commits/583e546ddf05007978acc38997ac3d60eb01b3b7))
  - typo
  ([30374eb9](watch/commits/30374eb9df7a593fa939f86e36543efd630c96d6))
  - Iphone -> iPhone
  ([c503b61e](watch/commits/c503b61e338cc74631aa4313402a5ca996046f55))
  - fix messages, pet and mount names and update locales
  ([a1c53ec2](watch/commits/a1c53ec2aa2cc981e2877e5469c7778c42b6977b))
  - remove wizard
  ([d077fe11](watch/commits/d077fe117aac05b84fa3d11ba6d39c9cad2fc495))
  - missing strings
  ([8060cac5](watch/commits/8060cac538c2a4362b92bfa601500ad7e64756be))
  - missing strings
  ([fcd33f32](watch/commits/fcd33f32eead81ab01fd6772d525fed06b87bd3f))
  - missing strings
  ([fd1de129](watch/commits/fd1de129dbccffe305422168926dc413e054ac08))
  - end tour
  ([cde6a209](watch/commits/cde6a209f2b5160d5364930f6f4489e053275a2f))
  - typo
  ([b526489a](watch/commits/b526489a18dc9f495072d7be63d7a7714c511b9e))
  - rebase, fix and compile
  ([17aaa137](watch/commits/17aaa13785d9676f5d3955aad875ba7900f9bcd0))
  - add new group name
  ([edb194bb](watch/commits/edb194bbf0eabfb00e354eb0f226ee34c277738e))
  - better items strings
  ([c1a55d94](watch/commits/c1a55d94b27d445f877448363160bbcbfa7bea5d))
  - use right syntax and add a few strings
  ([c57df7fb](watch/commits/c57df7fbc4d0a597cbfe8f21e3f1cfdb3a3edf33))
  - typo
  ([71793c31](watch/commits/71793c31dbf27e996395a373feb493458bf65253))
  - adjectivetive -> adjective
  ([eb655198](watch/commits/eb655198477fc1220d997e823c3b1f14673ec5e0))
  - ajective -> adjective
  ([29975c88](watch/commits/29975c8820bfb5c185f3e43a0389243a1eb6f4c3))
  - move mistery items to strings
  ([be3f4f69](watch/commits/be3f4f69d001ceeb97a7b68824706b9a045da454))
  - json syntax
  ([22f9d8c9](watch/commits/22f9d8c9eb7593fc4a67ab48249438872ce999bd))
  - remove duplicate strings
  ([2b0220ca](watch/commits/2b0220ca549ce1752058a12caf02dcb3c34628d9))
  - remove duplicate strings
  ([bddadc48](watch/commits/bddadc4827129da14cc5d33e419dbe049714c47f))
  - typo and update locales
  ([c9d880f5](watch/commits/c9d880f584f3112d15a2a403a3e85f0a68b6aa32))
  - do not translate DELETE when used to delete account and update locales
  ([58eaf4fe](watch/commits/58eaf4fea4a53a0f8535fc796ed4627db529a39a))
  - add string for new mistery item
  ([ebf62976](watch/commits/ebf629760d894a038915e10e87347b59b633fc53))
  - fix string saying donation remove ads
  ([4730081b](watch/commits/4730081bea250ba8f1f39ea9f43b6222dffc47ed))
  - add paypalText again
  ([ce518a66](watch/commits/ce518a660cc9d04c1e81c424e3a373a5eb1ce052))
  - add string and remove old one
  ([e999c940](watch/commits/e999c940f786d58eda02b65118e59bab3630230d))
- **iap:** iap verification fixes
  ([f9cc2add](watch/commits/f9cc2adda548a15b296cb9de2d8ced137752e4be))
- **inn:** see https://github.com/HabitRPG/habitrpg-shared/pull/231
  ([2822ce23](watch/commits/2822ce233fae8fbf422c064d46c1292b21e17220))
- **intive-friends:** only invite set invitation if user hasn't already been invited to a party
  ([0da391df](watch/commits/0da391df59afbda2a8c42376863a3ff522cfe321))
- **inventory:** disallow buying if !item.canOwn(user)
  ([8708207c](watch/commits/8708207c1cd8ada34a8310f04b4aceaea280d203))
- **invite-friend:** change variables
  ([02328fcf](watch/commits/02328fcf587cf5f36023a8598d92cbfba5f42460))
- **invite-friends:**
  - generate correct link on the client
  ([45845228](watch/commits/45845228d085131d1c6f7f4b75729d35e67c18d1))
  - canbuy->canBuy typo
  ([cbd436a8](watch/commits/cbd436a867e78d92ebfc493dc42e25dcae2c589d))
- **items:** fix mage ultimate per bonus #2880
  ([35f3eac6](watch/commits/35f3eac62600d1b442bd60106e726208f65cfd41))
- **jade:**
  - update api page to new doctype
  ([95e71c68](watch/commits/95e71c68de295abc81ea07c4abfaf495aad386b2))
  - fix warings
  ([4c8309c8](watch/commits/4c8309c8cce5ff610d34944c433da83888260059))
  - fix jade warning about "missing space before text for line..."
  ([e8779f21](watch/commits/e8779f21215fd67a44e54997d1059188e7289de8))
- **loading bar:** possible fix
  ([f5d0b795](watch/commits/f5d0b7957306370f18c42c1b37c296a7d03423de))
- **locales:** Remove spurious nbsp from English locale settings page
  ([af2bfa3e](watch/commits/af2bfa3efef5aa5bbe848805b992faccec6904d5))
- **loggly:**
  - do not pass apiKey
  ([b854663b](watch/commits/b854663b9255a8e303e0d398836a32caf11c417e))
  - send more infos about cron errors
  ([8b3c6f94](watch/commits/8b3c6f94bf85f99620765e959885c77d08b5809d))
  - enable only manually
  ([61ae5c74](watch/commits/61ae5c74209e7399a817b48d7f6d4afc4cbed4fc))
  - typo
  ([012e579c](watch/commits/012e579cfe2f5a2003bc0f50ce9421e2b5f51041))
  - typo and remove testing
  ([b10d4606](watch/commits/b10d4606f5bf728b02e65c2ba892669d0144bf93))
- **members:** add a callback so members modal doesn't popup until after member is fetched
  ([31fdc866](watch/commits/31fdc866c3682308447ff4ee1a4fb6d18e75f806))
- **memleak:**
  - possible improvements to leaked vars #4079
  ([57a5a62d](watch/commits/57a5a62d7c3266808bc72e8ca2de7888ff4bdf75))
  - add a "nullify" function to user wrapper. This is stupid, find a better way. See HabitRPG/habitrpg#4079
  ([e754ed48](watch/commits/e754ed48f7bbccfab245d6d7933a79901093239f))
  - temp, wonky fix to #4079 . Sets closure vars `user` to null in api.batchUpdate(). More will be needed
  ([ead42e7c](watch/commits/ead42e7cef968aa8ae82bf5ba1ee4e893abc2e4e))
- **mobile:**
  - start adapting boss to mobile
  ([0837f2c3](watch/commits/0837f2c39bad1562d8e9152e9aac0ecc80cb94d4))
  - export i18n for mobile so it can temporarily use en translations
  ([3edd37f5](watch/commits/3edd37f537b5c12f98ecc8757e67ec3362bc9609))
- **mods:** restricted projected fields for mods-listing. Also, static-bind for perf
  ([64fd6c02](watch/commits/64fd6c02f772886ac3c826399075d9ba69f77986))
- **modules:** load i18n
  ([c2aed860](watch/commits/c2aed860dbb68c537f9a3c16866d2a741b53345b))
- **moment:**
  - use new syntax, remove deprecation warning
  ([cd4626ec](watch/commits/cd4626ec06c44854477f2cc5a67c6face71b4999))
  - fix deprecated warnings, use updated moment syntax
  ([1e9c1295](watch/commits/1e9c1295e57a1c899d5e1199baf2fc1d4a363932))
  - fix deprecated warnings, use updated moment syntax
  ([2a812887](watch/commits/2a8128872d91c17eb6c07ebb0b2d0eb99570da3a))
- **mongo:** tmp fix to #3607 until https://github.com/LearnBoost/mongoose/issues/1920 fixed
  ([8d313761](watch/commits/8d31376165def21d4266971e868f33529b003645))
- **mounts:**
  - Correct one more bungle on Skeleton Gryphon
  ([9d2e00f4](watch/commits/9d2e00f408d8cbffc2ef2e0a0272da47a6754b3f))
  - Reposition gryphons, one more time
  ([6a0f4854](watch/commits/6a0f48540d487fa21628c466a4fbbfbd710cd9a9))
  - Offset gryphons by 5x, 5y
  ([f53a2a87](watch/commits/f53a2a87c308e5cbb2087bce1af7130017b611db))
  - Relocate wing to head layer
  ([f1bbd92c](watch/commits/f1bbd92ceb6a859ce0f0b70950c8f6549cb98817))
- **mystery:**
  - typo
  ([703451d4](watch/commits/703451d452330f15f47d16903da8b66b063ed202))
  - typo
  ([d6b41fd6](watch/commits/d6b41fd63f993e22eceddc4ff9ebdadeb5b9832f))
  - fix canOwn for mystery items, so they don't permenantly break. Fixes https://github.com/HabitRPG/habitrpg/issues/2999
  ([dfa4814a](watch/commits/dfa4814af3defae5078954b879c6cae633a83b37))
- **newMessages:** ad migration
  ([9d2723b4](watch/commits/9d2723b4186cd19a7b7f754f292f3c783d0c6ac4))
- **news:**
  - Prettify Bailey more
  ([47d14a1f](watch/commits/47d14a1f99276d4b9032b8ebff7f5c97b80f6427))
  - Left right left
  ([4fe4c01f](watch/commits/4fe4c01f3c2851130594e3d88d94b9ff44b8ab40))
  - Errant parenthesis
  ([ad08f1be](watch/commits/ad08f1be9a95743bddbb0429192b2fdabcd2fea3))
  - Improve accuracy
  ([8feffa54](watch/commits/8feffa54317dd1d16e4d46a9b42a00f85fea2474))
  - Improved plot
  ([09f827e9](watch/commits/09f827e9fef012576c9b3b6ca7fc0207b2105122))
  - correct link and awkward image
  ([dbe608bc](watch/commits/dbe608bc3aa06606cea20867bcdb63d40c516bc1))
- **notifications:** fix drop notifications
  ([a30ee436](watch/commits/a30ee4368a4f525284f4f9ece1472de21d542909))
- **npcs:** put ian.gif back in
  ([7b040242](watch/commits/7b040242bbf7f6ee7e73ce54b20b6efc03cc9954))
- **package.json:** relax and update bower version
  ([899581ee](watch/commits/899581ee560e7710b01d62b0003a63c5dc6272e3))
- **password:** case-insensitive emails in forgot-password
  ([327482f0](watch/commits/327482f0b0c628956d52638a2130094cd5d4a8cc))
- **payments:**
  - allow resubscription after unsubscribe
  ([f7f44735](watch/commits/f7f44735900c20b35b383e5e8b27429485969397))
  - revert unwanted change
  ([8da33857](watch/commits/8da33857e4c73d571a44f9be0f4199f22fbc3b7f))
  - revert payments.js to 5cc4c60, see #2454 cc @paglias
  ([ad146d6d](watch/commits/ad146d6d883ccd8a2b9eb91936506f12c678105d))
- **paypal:**
  - charge "immediately" for on subscription setup
  ([e1ff9610](watch/commits/e1ff9610d06144cf281a53972435efb7f43656ba))
  - don't crash server when no paypal plan.id (see #4246)
  ([7a121b42](watch/commits/7a121b4273969619b27bdc01ae54a6c52137727a))
  - move from classic paypal APIs to paypal REST SDK
  ([25a5bf92](watch/commits/25a5bf92a6fe7fa5e59ae319e30ab568f8027005))
- **perfect-day:** do not count non-active dailies when calculating perfect-day
  ([aafaee92](watch/commits/aafaee92e7b2c0997f9f6c8a9ad7db371ac742b9))
- **pets:**
  - if !Content.hatchingPotions[x], use string passed for displayname. Fixes #3575
  ([efc9a6e7](watch/commits/efc9a6e715842b7e3518c96a2803977d445fa8a5))
  - Saddle is not edible
  ([a88c96b6](watch/commits/a88c96b68b28663702aa0e0d2645f2cf3506a285))
  - 401 error when can't hatch a pet, not 500
  ([1331ff0f](watch/commits/1331ff0f1244843c5aaa349cd8e921ceec878dee))
- **phantom:** downgrade to node 0.10.22 due to CERT error, see https://github.com/Medium/phantomjs/issues/262 (cc @sabrecat)
  ([dc18569e](watch/commits/dc18569e78201dd5ee736483721a78ca3a9eb0e9))
- **plans:**
  - when gifting subscription, set plan.dateUpdated so it can roll gemCapExtra next month. Fixes #4480. Removes datedUpdated from previous version of fix.
  ([6a5210d3](watch/commits/6a5210d3ad728e5d06d8d61cdce372c15f2889ff))
  - when gifting subscription, set plan.dateUpdated so it can roll gemCapExtra next month. Fixes #4480
  ([0b28f6df](watch/commits/0b28f6df55f43792b8e4234f56473c86a921259d))
  - fix fields which are NaN
  ([3027ccff](watch/commits/3027ccff83c13400a18184361be3a857f910d975))
  - attempted fix for: Cast to number failed for value "NaN" at path "purchased.plan.consecutive.count", see https://github.com/HabitRPG/habitrpg/issues/4317
  ([3de86f35](watch/commits/3de86f35cb244e5c3526a38d4b1c81274e9662ee))
  - fix conversion cap
  ([6ac6f4d4](watch/commits/6ac6f4d476999737dad30c772bb5d2d4a462b6a5))
  - move plan reset up for people in inn
  ([9e64bc37](watch/commits/9e64bc37885f36a0d2031a7371ce16e88f3fe8a3))
  - possible safe-check of gemcapextra cc @Sabrecat
  ([9d3e6c71](watch/commits/9d3e6c71fee67ba020f22ebf02a6105a5a369c3e))
  - mystery 3014 promo
  ([cb8c1359](watch/commits/cb8c1359c469b1b9b566beb0fa1012b8da97360d))
  - various bug fixes
  ([d2e230db](watch/commits/d2e230db1fc66a98b02ea832d0c47647576f7ffb))
  - lots of bug fixes & cleanup
  ([30c1ac4b](watch/commits/30c1ac4b1e3899b6450588a736023ffc217c7d50))
- **pr:**
  - indentation and simplify
  ([4a37bec6](watch/commits/4a37bec652ba7bbc3460341b51deff9a16fc2429))
  - conflicts
  ([198d41d5](watch/commits/198d41d5e8c6fa3ab6919d32a22df1f68d2091d3))
- **private-messages:**
  - move PM buttons to bottom-left of modal
  ([5f654c4d](watch/commits/5f654c4dad658199ab02e06637a8df7b6c2d68f8))
  - glyphicon-ban-circle (@Alys @crookedneighbor)
  ([ecef457d](watch/commits/ecef457d2b9c092e3eee9576449a177eeda47c6d))
  - clear newMessages both when leaving and entering inbox
  ([1539c35d](watch/commits/1539c35d296d2f94f675d374b53e9bd0155b30fc))
  - blocker can't message blockee
  ([a429dce5](watch/commits/a429dce5dd962b0d88526e42fbd6f22b2d824e7b))
- **profile:** fix profile classes for mobile include
  ([311586e5](watch/commits/311586e5a370baac976be094744fbfa5e33d0823))
- **purchase:** add a check for user.balance
  ([6cf7160f](watch/commits/6cf7160f659bba239ead5dce370c121d9bb04463))
- **purchases:**
  - Correct hair path
  ([4ded747b](watch/commits/4ded747b8811d779d64f957bd937fd566add89b3))
  - Hide "2/locked" as appropriate
  ([4adf95fe](watch/commits/4adf95feb644e35eb2c55fe53d0cb2a0248b10bf))
- **pushTo:** only pushToBottom on todos
  ([dc359e7f](watch/commits/dc359e7f75653e720c308bdc6df086a2f7370c77))
- **quest:**
  - Dapper to perspicacious
  ([5cd6c02e](watch/commits/5cd6c02e8af8714381be180ddf81a7ba396cf72e))
  - Add penguin to shop
  ([dc034e4a](watch/commits/dc034e4ab5e0c694de7f8a2ff6447fb6c4eec2bb))
  - Penguin corrections
  ([7fd4cebb](watch/commits/7fd4cebbdc531b6875fb0fbb687b89b66362ee67))
  - HTML line breaks
  ([9e8947ca](watch/commits/9e8947ca75b6991be8570835ff07c4147472a448))
  - Rogue line breaks
  ([3ef40626](watch/commits/3ef40626a6e3c61a207424ddf0da10b8087d974f))
  - Not so smart quotes
  ([587aec18](watch/commits/587aec18363025be64290b670c7c5bedf38ea4aa))
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
  - Replace @ with bold
  ([a2afea35](watch/commits/a2afea351a722b4cbce0ea52ce0e8f6062a8960c))
  - Remove double chance for quest drops
  ([4178f0ba](watch/commits/4178f0ba32092c3da5f4196ac78545f8db2913d7))
  - Temporarily remove "booted" text
  ([34c594d3](watch/commits/34c594d3331046b58e1374fb0c7c7eb79449e553))
  - Make Gryphon and Hedgebeast drop 3 eggs
  ([fe8e42c5](watch/commits/fe8e42c5c3db5f571014c4e8e970026ee01d9d3c))
  - hedgehog fix alignments
  ([9f1bec79](watch/commits/9f1bec79f57a9b58ecf65ab6989ac518a068cfc7))
  - fix hedgehog drop text, fixes https://github.com/HabitRPG/habitrpg/issues/2979
  ([3c77f6e9](watch/commits/3c77f6e9c6e993178e32366d52b6bcda34e37bc5))
  - drop vice1 when lvl 30+, fixes https://github.com/HabitRPG/habitrpg/issues/2694
  ([4ff9a3de](watch/commits/4ff9a3de7d83fe066aebcd85b04eaef54a6a3eed))
  - don't drop canBuy:false items
  ([56cc5db9](watch/commits/56cc5db9b72ec06b0dcec8620b74b89fd069c1c5))
- **quick-reply:** only show quick-reply in inbox (cc @crookedneighbor)
  ([36ffd8a8](watch/commits/36ffd8a8b2ab02436c04f9b90742ef7ae2fdd7b2))
- **reset:** don't remove special gear on reset #3349
  ([5cd00391](watch/commits/5cd0039171c4a780d6b97a0e4f7dd26677464dcb))
- **reset-password:** use array for variables
  ([29382d18](watch/commits/29382d18f7a8bf37b9696ee0d8e5d4ecf55e6e73))
- **responseInterceptor:** update response interceptor to use latest angular API (prep for 1.3)
  ([19c0a6b9](watch/commits/19c0a6b9b0d40be43405b5e44c51879a6fa640bc))
- **seasonal:**
  - Leslie link
  ([8ff0a4a4](watch/commits/8ff0a4a4a435dd9c01af09d7accbe7eff19436a9))
  - Leslie link
  ([6e77392e](watch/commits/6e77392e7a9890cd6f120de7720153ec7fc4d8d8))
  - missing bang
  ([9f46e14c](watch/commits/9f46e14cd6ca5ca222d958548a3d794a41662c7a))
  - Add menu item
  ([867f50b5](watch/commits/867f50b514566e0140576bba75abb706ce156a6d))
  - Typo in string resource
  ([6dcbd329](watch/commits/6dcbd329a50fc6182a36f8a0c2c0c89cb8ae0261))
  - Corrections for Shop
  ([7988dfcf](watch/commits/7988dfcf824079bc9f6c5be32f13aa1cc58234ce))
- **share:** addthis in static pages
  ([50bc48f3](watch/commits/50bc48f325ca22026248cfd30d7426b1a58b6392))
- **shared:** use develop branch
  ([f29eaab7](watch/commits/f29eaab7190d07ab4c37da87644d430984b083b4))
- **sharing:**
  - add bucket to nconf
  ([de509c83](watch/commits/de509c83bec722bc514473fa19b7a68d8140558b))
  - add phantomjs buildpack to heroku (for pageres), proper use of nested nconf keys
  ([8f633e81](watch/commits/8f633e81db5aa7acd35f28d3cfb6a2eb798e31b8))
- **sortable:**
  - revert back to jqueryUI, fixes #3946
  ([f9812231](watch/commits/f981223153532035d72c35d42412628145c40385))
  - don't trigger sort when dragging in place, fixes #3926
  ([4ba860ea](watch/commits/4ba860ea8ca5d1102a2847721842152dd352ebdf))
- **spells:**
  - temp fix to #4067, for some reason _v is undefined after casting spells?
  ([562f593c](watch/commits/562f593c8f77fb14fff41eb4176ffb69affa8823))
  - Snowball is not an aura
  ([26163b89](watch/commits/26163b8930516a821e53526ea91ccebb1b381639))
  - Capitalization error
  ([3138c0ae](watch/commits/3138c0aee5b3efe03fa9c6f30cd098410c85b3f4))
- **spells fix:** I guess Snowball is an aura
  ([3f9daafb](watch/commits/3f9daafb8e6dff899ef0b962c738e880acb964f0))
- **spookDust:**
  - rename to spooky sparkles
  ([8e855816](watch/commits/8e855816791f63f170bb9bb29da4e65946ded20e))
  - rename to spooky sparkles
  ([3d638e41](watch/commits/3d638e4182d4a347588f4606ecfa6d2787c66b74))
  - user serverside method for spookdust as it's path-protected
  ([e666d2f8](watch/commits/e666d2f837608caa9e4cbee74d9df7382e8042a6))
  - user serverside method for spookdust as it's path-protected
  ([8cef9667](watch/commits/8cef9667139c945898e48227ef159923dd43a0f5))
- **spring:** 'mage' => 'wizard' class for spring-fling gear
  ([bfa7fbab](watch/commits/bfa7fbabd061a8e767a24dfb681c39a63aa281d3))
- **sprite:** Improved Nameless Helm
  ([009255bd](watch/commits/009255bdb5943ccfb34202425a076e029b323802))
- **sprites:**
  - Rooster recolors
  ([b8d9f047](watch/commits/b8d9f047b1fc65664b00310df5627ec11078d2d3))
  - Move penguins 3px
  ([c6d3d72e](watch/commits/c6d3d72e00f37020deff4974523bbf81582004eb))
- **spritesmith:**
  - split spritesheets in to multiple files to remove the blurry iOS issue. Fixes https://github.com/HabitRPG/habitrpg/issues/2510, see http://goo.gl/IwxdI4 . Note, this commit isn't smart/dynamic, there's commented-out code for handling dynamic splitting, but I couldn't get it working - static 4 sheets for now
  ([ec396344](watch/commits/ec396344587c6cc8fcbcc8f7ecdf939c53d0d35b))
  - add padding between sprites to avoid stray-pixels issue, fixes https://github.com/HabitRPG/habitrpg/issues/2938
  ([4010bb95](watch/commits/4010bb950c35abb3dd3fa716c814a5aadb530d33))
  - add background-size property to all sprites. Fixes https://github.com/HabitRPG/habitrpg/issues/2510 , see https://github.com/Ensighten/grunt-spritesmith/issues/67
  ([12232942](watch/commits/122329426784ac7ad80b8ce73283062f36104fc9))
  - upload spritesmith
  ([207d8875](watch/commits/207d88757d2df2437b396511525cf15161219bd9))
- **static:** fix static/api page, fixes #3636
  ([1fbf3a7e](watch/commits/1fbf3a7eba58c7de14e282b848b0e74a9fd71ac9))
- **strength:** Remove threat reduction, increase crit chance
  ([b0f574d5](watch/commits/b0f574d5981efd0545a17a5ae74d9d24a8bb73e3))
- **style:**
  - Pet key margins like sub gems
  ([d584e998](watch/commits/d584e998baed3ccb69ece26e3781322c691dd63a))
  - Make pet key a SPAN
  ([63ea851f](watch/commits/63ea851fdb9865a715a64ba7b64460863b5a7db7))
  - help emoji line up with task text
  ([c9b08984](watch/commits/c9b0898499b76884a62ba99269d9e1a927b5afbc))
  - Give room for badge
  ([ce8b6d29](watch/commits/ce8b6d29013cf5072eef22157d1c2f435a2c40c2))
  - Prettify Market Gem
  ([cc323694](watch/commits/cc32369497de034a73d81bea3e7083fb712b4def))
- **subscriptions:**
  - Fix to Gems badge
  ([b0176236](watch/commits/b01762362161f709bb1fac5f7c16581350475b84))
  - expose cancelSubscription on $rootScope (don't know why $scope doesn't work here). Fix UI bug
  ([0dadc86a](watch/commits/0dadc86a619075a03a302e677668f836a5472762))
- **swagger:**
  - rollback unwanted changes
  ([0efb74ea](watch/commits/0efb74eaed6ba16e58e1f86b2039a1fff1b3b53d))
  - correct API docs, fix #3679
  ([e72a6668](watch/commits/e72a6668fc2c7dbfda4e5431bd1b40a181797bb2))
- **sync:** fix for when data is null, ie. server offline
  ([4a22b1dc](watch/commits/4a22b1dc57d1167b24e225f2253d9272120daf63))
- **tags:** fix sortable tags by separating edit & !edit into diff <ul>s (cc @Fandekasp)
  ([50a34eb6](watch/commits/50a34eb6c70cd8f042731a4d6925c023803de4dd))
- **tasks:**
  - improve habit icon alignment
  ([dc5f9800](watch/commits/dc5f980083a16ac91ac3465f94c6f4e0f3c2cb25))
  - vertically align habit buttons
  ([2c88be85](watch/commits/2c88be85cf8dbb5d646121dec797eb604757baca))
  - improve UI consistency and layout
  ([118ba88d](watch/commits/118ba88d3ddfaadb4d72952c8f83263d7a48586c))
  - stop reward values overflowing
  ([073b338b](watch/commits/073b338bde267ee58dbc91452ebdad1d888aa6a6),
   [#1993](watch/issues/1993))
  - tmp fix for #4066, minimize:false on tasks so they have tags:{} default empty object
  ([a6631f5d](watch/commits/a6631f5d3681dc9424c9dc3cc2157b4c72250421))
- **tavern:** jade fix
  ([985171f8](watch/commits/985171f856c79c0ab3f595bb5b9d9a95baffcc80))
- **tests:**
  - snowball
  ([ef83c999](watch/commits/ef83c9999b5c7a34dd597a8f43faaaff5c0a42b1))
  - add in freeRebirth
  ([996e7b24](watch/commits/996e7b243be0b0c1bfed77d701159972f849dd46))
  - add in freeRebirth
  ([931525df](watch/commits/931525df0baeee88f367500a64a54f7dcd1523ee))
  - remove level 100 test
  ([8e2f0a08](watch/commits/8e2f0a08e9987e755b8830289c7f0a634c7d4890))
  - for i18n on quests
  ([ef06a2a9](watch/commits/ef06a2a9c66a0307b57a527a82208fd4f8c3589d))
  - FIXME temporarily remove stats.mp checks from cron
  ([6e94332b](watch/commits/6e94332b08ac02717f77525fc7ef2aef7058d6af))
  - temporary fix to some i18n issues in habitrpg-shared algo tests
  ([072b0ab0](watch/commits/072b0ab005154587373dc457ef4f59c30eb4f696))
  - Define contrib level for test user
  ([2d43314b](watch/commits/2d43314b834391baeccc25d0480d6ffb8f026ca0))
  - put honey last in food items def, seems to fix the mocked random function looking for honey. @djuretic any ideas?
  ([d721644f](watch/commits/d721644f151b2d7788f4f2af4fe1bb7d342aecf8))
- **text:**
  - The Potion that gives Health...
  ([36599387](watch/commits/365993870a9d47525f31f20f85dfa310df833bba))
  - Update descriptions for recent changes
  ([5da19267](watch/commits/5da192679de2c391fe66058a2aad106631f45e0f))
- **todos:** add dateCompleted to todos so they're archived 3 days after completion, not 3 days after creation. fixes https://github.com/HabitRPG/habitrpg/issues/2478
  ([587a660a](watch/commits/587a660ac1af149d727d69583b5f29ceda82ab30))
- **tour:**
  - don't restart tour on userUpdated, fixes #4632
  ([2d44783d](watch/commits/2d44783d807256a0a04e5e56d0fa1eafb4620fe5))
  - misc tour fixes. uses backdrop, next/prev (important we've found in user test vids), etc
  ([39163463](watch/commits/3916346308cc07f5c9fab11a2b0830c6c12a1385))
- **translations:**
  - move strings in limbo.json
  ([4c768d12](watch/commits/4c768d12776cd966b4a97b6e3c07a6778444475d))
  - revert constText to conText
  ([5df797bd](watch/commits/5df797bdf0d32302e5002af2ddec14a963b14f88))
  - split main.json, by @Sinza-
  ([cd584a98](watch/commits/cd584a983e18149cea0abe3395541d1983e7c9ce))
  - typo
  ([a369377a](watch/commits/a369377a066b07c2e3c1b8506beef5c1ebbe7f60))
  - merge pr
  ([0b21a089](watch/commits/0b21a089bef50fc90ee7fbc235bc30deb53b0586))
  - Remove more spurious NBSPs from English translation
  ([02311e85](watch/commits/02311e8500f13a4f10fd8f67f870591a1858e867))
- **typo:**
  - percepition to perception
  ([7161462f](watch/commits/7161462f2c2c16b5b66cac0914d73d07e46522e9))
  - active account to active subscription
  ([0807deb1](watch/commits/0807deb1207bb2865ad5bc3a3507cd95015c4ab7))
  - german locale typos
  ([0aa4d282](watch/commits/0aa4d2829eb42f19da8497f44ddbe1e16fb2563a))
- **ultimateGear:**
  - add last:true to the only back piece
  ([27da784c](watch/commits/27da784cf6e6d3ece8827037cb7a370e8462fd78))
  - fix bug where ultimateGear isn't awarded
  ([22830938](watch/commits/2283093845b04e24b3736ef8c86ad99979906b52))
- **userServices:** only crash client on 500
  ([2cd7959d](watch/commits/2cd7959d2e8e7e0f34235676fc48c59ba613ac8f))
- **vagrant:** explicitly call bower install
  ([bbd14bd4](watch/commits/bbd14bd47c91c82a9bcbc5e063b277e8cfaf90c3))
- **valentine:** what? cards aren't getting added to array first time, only 2nd+. Maybe an issue with markModified?
  ([a6b21919](watch/commits/a6b2191927de8e4c168093446721ca9fa312d2fe))
- **vice3:** allow re-purchase of broken "Stephen Weber's Shaft of the Dragon". Fixes https://github.com/HabitRPG/habitrpg/issues/3308
  ([b0c1b13a](watch/commits/b0c1b13af0f72ceae40378119ebd351c144399b1))
- **webhooks:**
  - don't send webhooks if not valid url (also if not enabled), fixes #4357
  ([cb9083d9](watch/commits/cb9083d9ba03854eabe4ff628f61ded809f7059d))
  - sort webhooks by created, use angular-filter for sorting object
  ([ebebcea3](watch/commits/ebebcea34b9948fa211fccaa112485b99334721b))
- **winter:** add specialClass to winter 2013 items
  ([5181b046](watch/commits/5181b046b44a18c8ea30e0842d36db06a9fefb88))
- **world-boss:**
  - simplify desperation stats
  ([da2d5973](watch/commits/da2d59734c14389d86a6b9fe61070e7ebab0e899))
  - Need markModified
  ([0137dd72](watch/commits/0137dd7209e2fb688c7d22d6a76cf3d2a493a255))
  - Desperation logic
  ([0a0a3f78](watch/commits/0a0a3f78cf5e2f4aeb01b4e7cc7294c4e91618e3))
  - Scale based on current HP
  ([4e50c43d](watch/commits/4e50c43da2f33d7d2cbc316bbbc6ae61ac678f51))
  - Scale based on current HP
  ([04ff8888](watch/commits/04ff888819e54a43ae1c19780238df489b0d3e4c))
  - Bit stronger healing
  ([a2be1bc4](watch/commits/a2be1bc4723c38fe958bb9793c7b0ea3b8a87131))
  - Justin not stressed yet
  ([689b13ec](watch/commits/689b13ecb636a20b91608c6e09a661ee5aac15a4))
  - Achievement badge
  ([41d073d1](watch/commits/41d073d1819ca26f42d8548e720af27ba1ec7ec6))


## Features

- **Bailey:** November subscription reminder
  ([2ee6f0ed](watch/commits/2ee6f0ed61ecd5b9f115a9054232cd9d4bed3917))
- **February:** Backgrounds
  ([ca702547](watch/commits/ca702547511e12bcb68ce9c27d7b2d9780cb941c))
- **Gems:** Add strings for Market gem
  ([6369934c](watch/commits/6369934ca31c3bbd1286ea2c48a098eef3dee47e))
- **NYE:**
  - Migrate hats
  ([1f1b4371](watch/commits/1f1b4371b7b75bf420d1e903f326fa80d8deb5e1))
  - Silly Party Hat
  ([dd3ec20e](watch/commits/dd3ec20e5e1232bf4bf8cf61d86f9883f8cd4d59))
  - New Year's cards
  ([dd137277](watch/commits/dd13727765bb0ae40ba3327f167c6ea573c54fc9))
  - New Year's cards
  ([51acc477](watch/commits/51acc477fe9ad58aba4c7aeede788d496441c3c6))
  - Image resources
  ([c14285db](watch/commits/c14285dbd92924ff55f0f69535cb30811928eec7))
- **accessories:**
  - add body accessory & better handling of gear sorting
  ([b93bf8be](watch/commits/b93bf8be7f38e028b97086dfe1a4133eabb4b4bf))
  - add head accessory
  ([74f62e7c](watch/commits/74f62e7c1cfc77497ebd31fdf4e5abf4a86c5d37))
  - add back accessory
  ([cdd59ada](watch/commits/cdd59adab93e3f959232d394e508656dcb81c00c))
- **admin:** allow admins to update user's items (restoring lost items, granting quest scrolls, etc). @deilann :)
  ([34236536](watch/commits/34236536df4038a2999d34aba7be9083fbd03958))
- **april-fools:** april-fools npcs & characters
  ([c091be30](watch/commits/c091be3064c2129444f6d524f3e58048a16a9e4f))
- **archive_todo:**
  - update to archive todos
  ([52ff5a7d](watch/commits/52ff5a7d5a3eb414c4884ede106de35edcb7d504))
  - add cron to archive todos
  ([17aed0a9](watch/commits/17aed0a9d7cf74327ef004af23ef579036522446))
- **attributes:** Add backfill button in flat and classbased allocation modes
  ([33222e0f](watch/commits/33222e0f1545afb1c51a68dc185631ce32a519ce))
- **audio:**
  - update audio locales for https://github.com/HabitRPG/habitrpg/commit/39911ef8e043cd3826d3c39a98126df8dad6a793
  ([f27e5477](watch/commits/f27e54774036a54148f2f9a64906450ff8c79ba3))
  - refactor user.preferences.{sound,soundTheme} into just user.preferences.sound. Fix audio dropdown bug by moving to list-items instead
  ([39911ef8](watch/commits/39911ef8e043cd3826d3c39a98126df8dad6a793))
  - update audio locales for https://github.com/HabitRPG/habitrpg/commit/39911ef8e043cd3826d3c39a98126df8dad6a793
  ([80a63575](watch/commits/80a63575c96510639db8a2aa556bcec56f71094b))
- **auth:**
  - move to hello.js for social auth, paves the way for multiple connectors. Prettier buttons via zocial
  ([6304dd2e](watch/commits/6304dd2e15e28bf80206dd30b777c68eb8d53313))
  - allow logging in with either username or email address
  ([772ea500](watch/commits/772ea500a37a7b6779cbc826f3e27889dba594e4))
- **backgrounds:**
  - January backgrounds
  ([0bfc5b37](watch/commits/0bfc5b37c007f8f5860810428434f0184075c4df))
  - December purchasables
  ([4d8a9c52](watch/commits/4d8a9c5287c8e24398cb93124a872fdd346d1c25))
  - add new backgrounds
  ([c53e6a23](watch/commits/c53e6a23cf38f103bb9d89c52762ad15944c8286))
  - replace spookyForest with pumpkinPatch
  ([5718fb18](watch/commits/5718fb183a3baa619c021ac3712ae608378c2542))
  - october backgrounds
  ([29262826](watch/commits/29262826e21d16dfc6bed5931d2575f5b71cd1d7))
  - september 2014 backgrounds
  ([60b93367](watch/commits/60b93367e55b709c348dd18cb99f64857b0348fe))
  - add august bgs set
  ([b73cc259](watch/commits/b73cc259b25953667249dbda936608658cfde5fb))
  - move backgrounds to mixin
  ([50d888e7](watch/commits/50d888e7f858d0f222cff6e58d5944b00afb2e1b))
  - add Set2 bgs
  ([6e46b767](watch/commits/6e46b7670cb054694549709079cf280088de7a5c))
  - bailey
  ([2aacf633](watch/commits/2aacf633080165a2b8166960b0d4e43b15b59b0e))
  - i18n for backgrounds
  ([e3aeaab6](watch/commits/e3aeaab64174832924da5033750c0e8f6ff64fc8))
  - i18n for backgrounds
  ([81108a00](watch/commits/81108a00390c3a0d666696b4106809daf9c374f6))
  - group bgs into sets in content.coffee, for easier "purchase set"
  ([1151576e](watch/commits/1151576e6cf0aee4b8faf3e5dc5628437deb4b43))
  - add backgrounds feature
  ([d95528a2](watch/commits/d95528a205666744c2a791c8190228026fe10025))
  - use nested backgrounds as {set:{bg1,bg2,bg3}} for easier "purchase set". Refactor twoGem()
  ([da4f51f0](watch/commits/da4f51f049e822f327e23fe7b915e77814525d3c))
  - add backgrounds feature
  ([c6232c2d](watch/commits/c6232c2d1ac8e8c7eda3b8cefff6af67da3edbb1))
- **block-user:** show "blocked" status in an alert, log the user out
  ([a4ae9332](watch/commits/a4ae9332bb693832b6089b30f08058a29956aa4f))
- **bosses:**
  - add limit-break for bosses
  ([850f67cd](watch/commits/850f67cd29a99d214bf43c1e245a6845a625c835))
  - add Octohulu quest
  ([9767c540](watch/commits/9767c540c3ebd466446e98552709af65f9a34dd8))
- **challenges:** optional checkbox on group create/edit: restrict challenge-creation to leader. Commented-out code for similar setup for member invites, shouldn't be hard
  ([e1ea1a24](watch/commits/e1ea1a24c80674ab0aea0c60b65383db38c0c02e))
- **change-email:**
  - remove blurb about changing email address
  ([b013c61b](watch/commits/b013c61b3be7176651b1f8c5725817125045dd7d))
  - allow changing email address
  ([23318403](watch/commits/2331840386b5a9e97ef86048347fd1238b71a89b))
  - allow changing email address
  ([8852ac6b](watch/commits/8852ac6b698ce0a5463f5cbfb4b18815245444ca))
- **chat:**
  - dynamic list of tavern mods (see http://goo.gl/9XhIZ6)
  ([e5c002bc](watch/commits/e5c002bcdb417d260a29afebbaaa22eb3ff6dbce))
  - allow banning problem users from chat rooms
  ([af74ff9d](watch/commits/af74ff9da0e94b8cf45c4a6da01829309c206d9f))
- **checklists:** Create expand/collapse string
  ([193dd46a](watch/commits/193dd46ad34f7aa1654ca590222da0f6b4a5b05a))
- **clearCompleted:** explain what clearCompleted does #3670
  ([c0ae0b35](watch/commits/c0ae0b35b61f581b69f83f59bb65b85c23e3ba10))
- **contribs:** start for #3801, update to new badge colors
  ([e10c04c9](watch/commits/e10c04c9bcf09e8f33fa7dfe4e9bbe88ec58b58a))
- **contributors:** small update to alys's script
  ([35308853](watch/commits/35308853a53590c38dac27e5707dfc9832598dab))
- **coupons:** update wording @veeeeeee
  ([439828d2](watch/commits/439828d2b1f005286dcd836691818d9bf714435d))
- **critical-hammer:** add Critical Hammer of Bug-Crushing
  ([6a5df319](watch/commits/6a5df319ed4ce11c9cc4cab3c27360b5b5fc23f9))
- **crits:** Make crit hits boost MP
  ([eb07a9c7](watch/commits/eb07a9c77a314c459387a01aff8b33db40f3463b))
- **debug:** debug buttons for NODE_ENV==test too
  ([3136b4cc](watch/commits/3136b4cc2cceaa9187545646b029a746cb6548a3))
- **deer:** add ghost-stag quest & deer pets + mounts.
  ([ca290692](watch/commits/ca290692dd996346f1e602448bbcdfb7278dbc97))
- **difficulty:** Add string for difficulty page
  ([5506a2b4](watch/commits/5506a2b4e4b49f990d2a598b08c463bd9993c94d))
- **dilatory:**
  - add dilatory achievement
  ([b9463381](watch/commits/b946338184d1ae392621ab09824405ff3c386c1a))
  - add dilatory achievement
  ([c96ef704](watch/commits/c96ef70428b3ab0933930fc3803446497ff39cda))
  - broken matt
  ([92fc8bd5](watch/commits/92fc8bd5cf48b0939f4259c51d0ddd3faac43ce5))
  - better strings for negelect strings & completion, + formatting
  ([de302ecf](watch/commits/de302ecf456fbdf9a98498933e8a7cd01ec20a94))
  - scene damage + boss def/str. bug fixes, tests
  ([9f1035c3](watch/commits/9f1035c3172baa7f4db1fa4774319a5340f0cf37))
  - load tavern boss on each cron, removing caching for now (was too buggy)
  ([79df201c](watch/commits/79df201c662739c75a627fe63ae868069583a4d3))
  - model updates for tavern bosses
  ([fad4e5bb](watch/commits/fad4e5bb02bbd8a90d8e3cf1777be69a4fb00581))
- **directives:**
  - move directive to be used in mobile to habitrpg-shared
  ([4f0b4fd1](watch/commits/4f0b4fd171d32c3c4f0b1ece43e8f43ecb80eb9a))
  - move directive to be used in mobile from habitrpg
  ([214facaa](watch/commits/214facaa9340eedd70acce0cca713ced542653d6))
- **discount:** google discount & use sub.key instead of sub.months
  ([edf66cbb](watch/commits/edf66cbb59c1246fadf5f452a919cdf0a3e83da1))
- **drops:** Tweak contrib bonuses
  ([f49ed543](watch/commits/f49ed5436c60d6b135909a3c8714347d99499701))
- **eggQuest:** add april egg quest
  ([bd8d2dcb](watch/commits/bd8d2dcbd007e11755c952cc43f7d259c29d2e8d))
- **email:** add new image for subscription email
  ([ce73a751](watch/commits/ce73a7513370567d48d218d7b11ffbcb96fe00a9))
- **email-notifications:** implement email notifications for events
  ([d211bc7f](watch/commits/d211bc7f861517a16d0d653f1be69b6e1d72ba92))
- **emails:**
  - allow variables to be passed to emails
  ([beea956d](watch/commits/beea956d778c571dfc242ad621329be36ec74bc9))
  - add recaptureEmailsPhase path to flags
  ([cfbb5648](watch/commits/cfbb564801c0de4549e50c989cd6f84e56106e5c))
  - add new images
  ([b1fc435c](watch/commits/b1fc435c9a22e515865f3f1f69dc2c9a829bfaa5))
  - add backoff to delay failed jobs
  ([1a15043c](watch/commits/1a15043cddcf3c1c2ac864b268e3b6e641d926f7))
  - add subscription cancelled email
  ([fda93773](watch/commits/fda93773c731506babf811da8d12c31d4dacfab8))
  - add emails on signup, subscription begin and donation
  ([fca45a3c](watch/commits/fca45a3c0b5b13a22b0fccd16402f812051551a1))
- **equipment:** remove base gear from equipment tabs. now clicking the same gear you have equipped will un-equip it
  ([50132f1a](watch/commits/50132f1a354692875bb40cdeaa9e58dca7869c99))
- **event:**
  - End Valentine's
  ([130261da](watch/commits/130261dacf376c1042775dc87e2b41ccbc5b6219))
  - Card notifs
  ([4bdace64](watch/commits/4bdace64fc0da75940ba3fa412c8c51713931ea5))
  - Card notifs
  ([a5052b1f](watch/commits/a5052b1f515d7f7046e32d12d37140843d2a59e9))
  - Valentine's cards
  ([8fb84a04](watch/commits/8fb84a0410e34e9cae6bb674fe0c51dfecce71dc))
  - Valentine's cards
  ([6a6a4a0e](watch/commits/6a6a4a0e57b7f814221bee7f050daeb6ece18e43))
  - Valentine's Day
  ([3a4d0004](watch/commits/3a4d0004fa00928a0cd1211c6638fc972596fdee))
  - Valentine's Day
  ([bf54bde2](watch/commits/bf54bde207c8f76fbd59feb345221e863b0eff86))
  - Habit Birthday 2015
  ([c8b9cf28](watch/commits/c8b9cf2873c43ccd327cdbd951adc0202fb0a72e))
  - Habit Birthday 2015
  ([4ebc2953](watch/commits/4ebc2953f5d00cb5b5e3fa8cc0565f8957414d85))
  - World Boss
  ([fde64b0b](watch/commits/fde64b0bdfefedf934c4a6dc393cc9663922b9d4))
  - World boss
  ([ee339fba](watch/commits/ee339fba4aac71de323a115403e2c9947530c014))
  - Quests and Bailey
  ([597793e3](watch/commits/597793e3cac21d0e1faec7762be33fd73ce273a9))
  - Mystery migration
  ([6d4d9451](watch/commits/6d4d9451a582360a0f27ac9aed1d6426ea406165))
  - 2014 Mystery Items
  ([94713937](watch/commits/9471393776f16986363ac2ee933f5387af6fb980))
  - Implement Seasonal Shop
  ([41f4ab7b](watch/commits/41f4ab7b8a1c8fbb0d8e0795dc0e1a9e074233cd))
  - Implement Seasonal Shop
  ([0e28f04c](watch/commits/0e28f04c909776037ab799c2bb3c44b10ac2c8bf))
  - Wintery Hair Colors
  ([bb89a103](watch/commits/bb89a103560147de71811a6630f4cb781c40bcdf))
  - Wintery Hair Colors
  ([d0a97fb2](watch/commits/d0a97fb20f244c86e13f91696164f37ecba715c8))
  - Winter Wonderland 2015 gear
  ([8ec9f791](watch/commits/8ec9f79188ab567037272f4a1e4e07aee381ce75))
  - Winter NPCs
  ([c8aadf29](watch/commits/c8aadf296e7b3fc36c030aa09ab75d7dc61ea0be))
  - Thanksgiving Bailey
  ([be3342cb](watch/commits/be3342cb261dc70cfb9ffe7ee644ed2c38523202))
  - Thanksgiving updates
  ([645327b9](watch/commits/645327b9b03d60c4a6e5cf1c57a05f36db2be742))
- **event-tracking:** track purchases
  ([1b2bcc46](watch/commits/1b2bcc4683bd755d9f700403b9da55396f0cb1ca))
- **facebook-to-local:**
  - allow users to move from facebook=>local
  ([5ec2c118](watch/commits/5ec2c118a5ab51b652915f1a9cfbe3c6ff98785d))
  - allow users to move from facebook=>local
  ([a4c2bf61](watch/commits/a4c2bf61b26011765443c54481c065f475f675e4))
- **fall:**
  - back to default npcs
  ([3fc49781](watch/commits/3fc4978176a6e17c9d3903710ffcc828ae2c289c))
  - disable candy drops
  ([1151002d](watch/commits/1151002dd6f2441a5f0723844f0911279d243cfe))
  - back to fall npcs
  ([3132bbcb](watch/commits/3132bbcb41736386786e2ce4dfa7b5a222d2fa64))
  - turn off fall hair, skins, spookySparkles
  ([89060c95](watch/commits/89060c956196b012518a279b07ba7eeea3b91d89))
  - bailey + free candy script
  ([f38db7b9](watch/commits/f38db7b964a5f3a7dbbeeaa242ac2909183b2f61))
  - npc-swap
  ([bf7f65e8](watch/commits/bf7f65e8c87f837556d9ee7199edb8100d75fa65))
  - special fall gear
  ([133634c2](watch/commits/133634c2478d29313ecffd36f353cd556af789aa))
  - Add candy drops. Add canDrop & canBuy to food, handled separately for this event and future events
  ([2790ee1b](watch/commits/2790ee1babc2654bbf940aca2485ad996fef76c8))
- **filters:** add button to hide tags and restyle
  ([1ff77932](watch/commits/1ff77932ff9c2ed227e7a700a6af4b43f78e975c))
- **flag-chat:**
  - fetch author and add some group variables
  ([2d4c5e7b](watch/commits/2d4c5e7b98152b215ac875acef919bc3ae3896de))
  - add some variables
  ([7aff280a](watch/commits/7aff280a71b85d81daf47491cb4466e0f7c68879))
  - start implemnting email
  ([652ce10e](watch/commits/652ce10e2246a7b7a9e699f9aa005999b40f69b4))
- **flag-message:**
  - add server methods
  ([e84880d3](watch/commits/e84880d3e872e85af3e29e0a0381a6a4ad8b4551))
  - add server methods
  ([ae6e0255](watch/commits/ae6e0255c69b4ecb60b0c3502840e875a9ff1085))
- **flower:** add flower customization option
  ([e53ef26d](watch/commits/e53ef26d4cd0011a1337c6d3c4245b1feebf8a99))
- **gaymerx:** gaymerx special gear
  ([3a83ca17](watch/commits/3a83ca1770b97dbf062c96307f880f5628ad41c0))
- **gear:** add broad & slim for armor_special_2
  ([1e441d6f](watch/commits/1e441d6fcd4fe5f512a2435d6f0929d5fdf5f4d2))
- **gifts:**
  - allow gifting subscriptions
  ([5b01fff7](watch/commits/5b01fff70038886f470f2769235759ff29d7fcf5))
  - allow gifting gems from paypal/stripe
  ([e8dbd5ca](watch/commits/e8dbd5ca1a89c45d1d63f2dfc714822bdc444a9d))
  - allow gifting from balance
  ([7e9b92fc](watch/commits/7e9b92fcad3d2ad43da5395b34f580b8d961d648))
- **google-discount:** add google discount
  ([5fc001e4](watch/commits/5fc001e4f6bac35020dbe63667d034c2957a47d0))
- **habitBirthday:** add habitrpg birthday event. includes cakes for all pets, absurd party robes, npc swap, badge, etc. @lemoness
  ([949386f4](watch/commits/949386f44f1b4b724eeefdc9222beaa3bc1b3399))
- **hair:** limited ed pastel hair
  ([a1eb1f8a](watch/commits/a1eb1f8a59a35770488e1d3045ba98074fa7c16f))
- **hall:** click hero name for modal. fixes #3478
  ([ef166a9a](watch/commits/ef166a9a1085b59ae35c981ae321c648e22ecb7d))
- **halloween:**
  - costume contest badges
  ([8120d69d](watch/commits/8120d69d059693f430012e7ab19ffa82777ef7c2))
  - halloween sprites
  ([6f3c855d](watch/commits/6f3c855db0b024d9ac1c96f8a268363dcb9d498c))
  - updated bailey @lemoness
  ([fb68f70a](watch/commits/fb68f70adf355a92f6d6850a68d19ac5be8de148))
  - jackolantern pet
  ([0a630d7d](watch/commits/0a630d7d9be8d207364812820cb42b8f72895e51))
  - add jackolantern pet
  ([76d4f684](watch/commits/76d4f684cf88213332506c018e949e0782f84526))
  - add seasonal i18n strings
  ([8cce88a5](watch/commits/8cce88a5add436620b43900c038aa01a0e93f5eb))
  - refactoring skin & hair to use the same mixins, add new halloween seasonal set
  ([3605b517](watch/commits/3605b517481de55b111295a8ade12ce330744fa8))
- **help:** add tour to help menu
  ([487f8afe](watch/commits/487f8afe30ec3f95e29203e9553e2c8cfc57c21c))
- **i18n:**
  - add strings
  ([09015370](watch/commits/09015370f0b9eef726ccf5dd3f695f2ea87d8f75))
  - add string
  ([ff9280de](watch/commits/ff9280deea2326987c67c627cd622bf0925ca62a))
  - add string
  ([bb855bf9](watch/commits/bb855bf9931dc127304e2c1e47394196fc25c937))
  - add change language button on front page, fix #3530
  ([1d92ddd6](watch/commits/1d92ddd645be4076a49ede74a56d76158aa04ae2))
  - add notices
  ([f2a10f8f](watch/commits/f2a10f8fc10bbd840a0c174d8cf46de93336dc53))
  - support british english
  ([f10b9cbf](watch/commits/f10b9cbfc6819b18e482507ff1f89cfd9731c0cd))
  - update to ads content
  ([54473b71](watch/commits/54473b713578e01fc3c860d01d2ba652e81ccc0b))
- **iap:** ignore keys/ directory. upload any keys/iap-sandbox iap-live etc on a private branch
  ([9d6caaa1](watch/commits/9d6caaa138d31d4c784737150ea313d68c69b745))
- **invite-friends:**
  - obfuscated invite
  ([cb3ebccb](watch/commits/cb3ebccbbfce492933510992b4e2394e3e57c731))
  - allow specifying inveter's name (#4238 @lemoness)
  ([5fab3881](watch/commits/5fab3881a209d6cf18bcd3583c3de0d785ef6593))
  - update wording on invitations. Add commented-out sample code on copy-link (it's not working)
  ([524e0514](watch/commits/524e0514a1560feef5b1e3d33b82df8e20791c6e))
  - add inviting friends via email. URL parsed, session holds invitation. If user joins party (new user or existing), the inviter is rewarded
  ([21663215](watch/commits/216632157258363b8c53a2fae471a98ca779d6e2))
  - add basilist quest
  ([9bb40d6a](watch/commits/9bb40d6a96238d041593718279a8667f1250d471))
- **item-store:** unlock item-store earlier (lvl 1), see #4134
  ([d843ff1a](watch/commits/d843ff1ae460db697335a962f226fe74ad9d420e))
- **jade:** split file to be used on mobile
  ([45ab2826](watch/commits/45ab28269a4abaabf9b5486ed7cd2e6b32ecb0a2))
- **jshint:** add initial config
  ([aa0ce6d8](watch/commits/aa0ce6d8664dd875087c0af8e82363582bd431dd))
- **loggly:**
  - change tag based on base_url, logs internal server errors
  ([dac2fc68](watch/commits/dac2fc682dfedbd9373b9d2695a857b1cf7afebb))
  - enable json loggin and start loggin errors during cron
  ([8935538b](watch/commits/8935538b5351d8da9b0aee454b1444b63480932c))
  - add test log, use only in production and add sample config
  ([af1ff6d7](watch/commits/af1ff6d74059e12683603ca89a55e5a12ff1a9e4))
  - add loggly
  ([7356e0ba](watch/commits/7356e0bafeb3843d6c457c654abc7a68f999cf44))
- **march:**
  - replace npcs with march versions (revert here when done)
  ([7b8e0dc0](watch/commits/7b8e0dc0a4812a262e5116b7f4ed0cca437ce83b))
  - march npcs
  ([60518f28](watch/commits/60518f283ec238925c8504fb95c8ae21845335f9))
- **marketing:** update frontpage tagline
  ([db364066](watch/commits/db36406680fb08cf13a4bd3b59ff9af4e2110079))
- **may:** may mystery box
  ([c091290f](watch/commits/c091290fd0b2f9c1be488e8ed80721896732b0bb))
- **members:** add options: $modal.open({size, windowClass}). Use those to make avatar modal wider, and "100% window height" (see code, it's kinda hacky)
  ([478cba9a](watch/commits/478cba9a5a3d578a1a3f0f19d765a08dd1314b37))
- **mobile:** adapt boss box to mobile
  ([6d251aeb](watch/commits/6d251aeb91bae435d22793acbb36c938f03b289c))
- **mystery:**
  - January subscriber set
  ([524761f1](watch/commits/524761f1cf4895b4a876ec696805c0f7c6998f21))
  - January subscriber set
  ([e2f47651](watch/commits/e2f47651a4facc79afec1edfd8c2c76bafee1ed7))
  - mystery 201411
  ([22cddb10](watch/commits/22cddb1086c2f65ed63d6ecdafd418d60092b238))
  - update box
  ([8932db4c](watch/commits/8932db4cc9503dd47c1de32935b12dbb44d09057))
  - mystery items 2014-10
  ([3c249725](watch/commits/3c249725af8a415e271b9b1eae907ad6745eaefc))
  - oct present art
  ([c6b56706](watch/commits/c6b56706fa161a9d7ccf376b290206d3b237ac67))
  - 201409
  ([ee39286c](watch/commits/ee39286c8dd9c0d3a5621b94560c712b3130d399))
  - 201409
  ([351e220b](watch/commits/351e220b83cd0586c0c2e4341e73470a68e70fec))
  - september box-swap
  ([d5c8045e](watch/commits/d5c8045ecf4169698af17b048b4237c3b14ebf3e))
  - august mystery
  ([2cc25114](watch/commits/2cc251149ce7020bfc981ee43e0f952e7036a935))
  - august mystery
  ([11f30559](watch/commits/11f305591325cd6d277fed94ec3eb8d2587d65f3))
  - july mystery items
  ([75eb8606](watch/commits/75eb860650614e2d5c317decc8df6dc197433d97))
  - mystery items 062014
  ([2bffa643](watch/commits/2bffa643a95a4e423fa701f655d46044970740ed))
  - mystery items 062014
  ([fd645fb6](watch/commits/fd645fb6a579c42a2f8896035fbe0e501921ff9a))
  - june gift box
  ([1b6bf433](watch/commits/1b6bf433674b66f3d1038d2ba3ffa2f3ef1a3274))
  - may 2014 mystery item
  ([29be5d6e](watch/commits/29be5d6e3ed53d2afe1001e58ab12b9b7adb00aa))
  - add 05/2014 mystery item
  ([cfd2c427](watch/commits/cfd2c427e8bee162d4ea0db25d612e0f2bd93323))
  - 0 GP mystery items @deilann
  ([25ce6449](watch/commits/25ce644915815e4293fdd6daff164d0b2b37728e))
  - april mystery items
  ([db95376b](watch/commits/db95376b52c8727f77b266c2af705ca4ad97b298))
  - march mystery set
  ([f8d5fad0](watch/commits/f8d5fad0867721966b0593c92ddfd1aa9a225eff))
  - add mystery items to spritesmith, so 3rd parties can use them too.
  ([bede329d](watch/commits/bede329d11d00132f3df6b7d2404a5cd57006837))
  - update mystery box
  ([75cd8c2e](watch/commits/75cd8c2ec3eb567df8687a2ccc8f90b155e398f4))
- **newStuff:** show newStuff modal on page load if present
  ([0b9c5271](watch/commits/0b9c5271bb6d58c9b6c5035edebfa472c17f93e5))
- **news:**
  - Promo images
  ([0ec9e5b1](watch/commits/0ec9e5b1e1edb86db3266e4cf633047d27d1dabf))
  - move old news to /static/old-news, better use of content space
  ([66b4dae0](watch/commits/66b4dae0d98853edd67a117cc4a196f7bdce69f7))
- **npcs:** return npcs back to normal (incl npc_ian as a gif)
  ([64fa6d9a](watch/commits/64fa6d9a535089b38c998792015cfc95aed5adf3))
- **perfect-day achievement:** here's one for the road @wc8 @sabrecat, if you perform a perfect day of dailies, you get an achievement PLUS lvl/2 buff to all stats for the next day
  ([8df7fe65](watch/commits/8df7fe65c524e0c43639d4faa00f7c2c1842c6d6))
- **plans:**
  - time traveler - by full sets
  ([bf7e1e66](watch/commits/bf7e1e66ed7ef4338d31807587ce6569eb06ef88))
  - add time traveler - buy individual mystery items
  ([d81badde](watch/commits/d81badde69e5cd3c3b7ef4babc82337aec87c006))
  - add consecutive-month benefits for subscribers
  ([76be625f](watch/commits/76be625f6dd86d82ad3a52fcf066c4670cd770ad))
  - cleanup plans' perks page, rename Time Trinket => Mystic Hourglass
  ([8c5842eb](watch/commits/8c5842eb527632d2ffa30d2f01eb87ec09cf6609))
  - time travelers tab, 1 trinket to buy 1 set
  ([0fffd665](watch/commits/0fffd66588e603513803967f1983797f530011a2))
  - allow block subscriptions from paypal/stripe
  ([7f2b6b5c](watch/commits/7f2b6b5cfbff94dc7339126308428ee93e23e1a5))
  - consectuive-month subscription perks (gifting)
  ([5fd805db](watch/commits/5fd805db881901df68b342fc66ec741bb85da581))
  - consecutive months & extra months (like a time-card)
  ([57bfee02](watch/commits/57bfee02cf34b9b44f662f90328d2615cc8f4ebe))
- **premium:**
  - add premium features
  ([a38c8761](watch/commits/a38c8761a2ce44b8c022f2b1150e2e01d93481da))
  - april mystery box
  ([c9b63a6a](watch/commits/c9b63a6a31273658a434b3199e7b863948aa6c37))
  - add mystery-item handling
  ([1a40a52a](watch/commits/1a40a52ab56e2e0b608157eea5d53fb0f850887b))
  - add mystery-item present box. Doesn't do anything yet, will add logic later this month
  ([63f691b0](watch/commits/63f691b00d8a004a8a326c69327b5d6db58951dd))
- **presskit:** add presskit page cc @lemoness
  ([cba232ef](watch/commits/cba232ef83fb15c3fd74ed8eb535b5dc3d317bad))
- **private-messages:**
  - add a "clear all" button
  ([743df194](watch/commits/743df194c7b7d93d0fd9dcda37942020f1fcce0f))
  - add a "clear all" fn
  ([03f47cd0](watch/commits/03f47cd0aab7f01ce645c41e0df0b4084734d2ba))
  - add features for private-messaging (deletePM, blockUser)
  ([1bca160e](watch/commits/1bca160eb6bf54c9a662f76804e17c1d0400fdd9))
  - start implementing private messaging (includes blocking). Start experimenting with reflists for PMs, instead of arrays
  ([f5415ac6](watch/commits/f5415ac6c529f529572e824f2e9ab6515444b484))
- **quest:**
  - T-Rex pet
  ([c260362d](watch/commits/c260362d96b629a47d0ce18bacfd7fcc9554b065))
  - T-Rex pet
  ([0b63e48c](watch/commits/0b63e48c6e10478e1717f0ce132ceb0ade4ccb4d))
  - Implement Penguin pet quest
  ([d25455fa](watch/commits/d25455fa5ad9f15815c3220f6bf292e868b57a00))
  - Implement Owl quest
  ([9ececc95](watch/commits/9ececc956523b20724f017df0c4b1496621ba21e))
  - add owl to egg types
  ([000eefc6](watch/commits/000eefc695914eb144453b94f7101931432af8b7))
  - Add owl to purchasable quest eggs
  ([bf8882e8](watch/commits/bf8882e8f5e25ece295679edc6b0c1e308cb1bb7))
  - Begin implementing owl
  ([1aa7f6ca](watch/commits/1aa7f6ca91a60594f07307a85a9bda7f23b61c04))
- **quests:**
  - Differentiated scrolls
  ([41241750](watch/commits/412417505f2d84d049572a9bfc73d78c3f63c344))
  - Differentiated scrolls
  ([2ca6636c](watch/commits/2ca6636c944c67f9e527d96cc41987dc83a718b2))
  - goldeknight auto-drops at 40
  ([97a9ecf1](watch/commits/97a9ecf1f4f9c2fed9654278d1b0d6e0d3872b6b))
  - golden knight chain
  ([73bdc0db](watch/commits/73bdc0dbaf78ec990a68745e93cac3bd2c702310))
  - add moonstone chain, lvl drop at 60
  ([d3ca101d](watch/commits/d3ca101dd8e393ce85f641c3399c7a89400853d7))
  - spider quest
  ([39ab4154](watch/commits/39ab41549a4512ca17e73e827454b4bf3ec22264))
  - spider quest
  ([11761f9e](watch/commits/11761f9ee2654d73532e8db3bc420ae12e61d0b2))
  - add rooster rampage quest
  ([94e1d485](watch/commits/94e1d48588354665135d314f26202270ccef4d00))
  - add rooster rampage quest
  ([fc73c084](watch/commits/fc73c0841f0f2a8507f48bc49cfaf3b0644b237b))
  - parrot quest
  ([a88fde98](watch/commits/a88fde98627d9302664ee03cc3081660d04d94c7))
  - Parrot quest
  ([475e4c0e](watch/commits/475e4c0e4e934d7a17b54c3f75159a112c66c532))
  - lvl 15 ATOM quest drop
  ([c2ac401c](watch/commits/c2ac401c767b95c12a439d4c436fc24470ae81e4))
  - lvl 15 ATOM quest drop
  ([d3520e48](watch/commits/d3520e48e4932a73eb9d0e871454e6970422a333))
  - seahorse quest
  ([c66c5ec8](watch/commits/c66c5ec83b6cbe78cc04ac711a15690b4ed058ea))
  - seahorse quest
  ([9e85a886](watch/commits/9e85a886ba323b6bcbd1cbf91b80ca386b920d6e))
  - add octopus quest
  ([f85d6b29](watch/commits/f85d6b29788e6236dd7a13f943b21af17c20f09d))
  - Added Hedgehog to pets list Conflicts: 	script/content.coffee
  ([32c12333](watch/commits/32c12333ccaf312e442414415fee5f46f7ff0426))
  - add hedgehog sprites
  ([29f6f8e1](watch/commits/29f6f8e140cb29b295ac3ccee8618b9da08ee86e))
  - Vice quest
  ([39285e2d](watch/commits/39285e2d0bd15740f3d667c759125043e2905172))
  - add the gryphon quest, mount, pet, egg. For the glory of @baconsaur!
  ([2ee93763](watch/commits/2ee93763fc333f1f32ace854c80fefd54f7b3c1b))
  - allow quests to drop multiple items
  ([051c3c89](watch/commits/051c3c89c87b883e06afe19723f6227de7eabc2c))
- **rainbow-hair:** add rainbow hair colors
  ([619d254c](watch/commits/619d254cc007d5ca58d559513beb2b4f5f688129))
- **rat:**
  - add rat quest
  ([8506db98](watch/commits/8506db984955a129b7d8ce0319fe78dcbc2dda86))
  - add rat quest
  ([86c51535](watch/commits/86c51535c51fc40a8f01516ff0afbd58597e2365))
- **readme:** dependencies badge
  ([0bd21f31](watch/commits/0bd21f318b1578587f5367bae82511e0f6d30b4f))
- **registration:** show some basic registration information on Settings > Site (if facebook, then "Registered with Facebook". If local, then username & email)
  ([592ffd98](watch/commits/592ffd9818f3dd605ced71bf1741c16b7888f0a2))
- **seasonal:**
  - Normal view
  ([48246d6a](watch/commits/48246d6a7239687f3b44ad82c56aed8f6e625f4e))
  - Normal view
  ([c9b81414](watch/commits/c9b81414a4079ee8a706d19971ac68e4aa26f856))
  - Implement Snowball
  ([53fff0db](watch/commits/53fff0dbc61c2bb11bf21f1575c487ab05016214))
  - Implement snowball
  ([f7d45c95](watch/commits/f7d45c951e24abf4cfe11804f8a53a85e31df573))
  - Seasonal Shop
  ([a98a6859](watch/commits/a98a68597127f385c7729f25ff6f9f282ea20d0a))
  - Seasonal shop
  ([c7ee171e](watch/commits/c7ee171ee415be5af0f090cffd8378f7890fea74))
- **sharing:**
  - screw it, social links + img + text aint working, just redirect to homepage + show member modal
  ([15f318cc](watch/commits/15f318ccc2b455856273d6ff33a1b0f42adc23ac))
  - add download link
  ([3a415a45](watch/commits/3a415a45a96b5260ca4bc25b56da117dd0432a98))
  - implement caching of avatar img. img as image/png instead of octet/stream
  ([3e21e1f4](watch/commits/3e21e1f4483ecbe516c8ba8db835dae49ad71da9))
  - move avatar-sharing to herobox, use addthis instead of custom solution. refactor from pages/* to export/*
  ([69da5850](watch/commits/69da58503a24c177b8c0f13360466384e27ba6e2))
  - directly stream avatar screenshot to aws
  ([18b350eb](watch/commits/18b350ebcce3ec7374f44af44ca2bca44e1e85d1))
  - add ability to share avatar. adds static page with avatar screen, and generates image from it
  ([e6a99f33](watch/commits/e6a99f33a9fe423689e36280cae3a0b18a696623))
- **sortable:** use angular-ui-sortable instead of jqueryui directly
  ([750135b6](watch/commits/750135b6734b8a3978885e97d83bc14fb423a3cb))
- **spookDust:**
  - add the spookDust special spell, like snowballs. Note: this is handled specially so spookDust can be bought with GP, is a WIP
  ([0841cafd](watch/commits/0841cafd1f68dd2217f27e0f9aeed4320b827f44))
  - add the spookDust special spell, like snowballs. Note: this is handled specially so spookDust can be bought with GP, is a WIP
  ([786f9a92](watch/commits/786f9a92df86c63d7b9f23f3a29fc951d50ab6ac))
- **spring:**
  - take egg hunt quest out of the market
  ([746ce6de](watch/commits/746ce6de4fe7506e87637f1e496e69e773e63ff7))
  - back to normal npcs
  ([b3042431](watch/commits/b3042431193bbd377068bac673ad79665f5d27fe))
  - put spring npcs back in (@lemoness)
  ([692a1f66](watch/commits/692a1f6639fd53b6edf1d38d5b5b31448dbfffab))
- **stPatties:** st. patties npc_daniel
  ([3927b141](watch/commits/3927b14119d986f75cc83f4bbe08748b38919128))
- **stats:** expos stats jade files to mobile
  ([e60cf01b](watch/commits/e60cf01b6f16a839497922edb6a523ea7688ade2))
- **subscription:** disable "update card" for paypal subscribers
  ([a1f2375b](watch/commits/a1f2375b9df6a6b6dcb61c0fd38e7b4dd2dcbd0b))
- **subscriptions:**
  - Show count of purchasable Gems
  ([62e526f8](watch/commits/62e526f8dc7b490b969a7ee9afa2ddc9c41956b2))
  - allow one month after sub start-date before it's terminated.
  ([d92a2eb8](watch/commits/d92a2eb86ee9f1d03334bb32bf664ac701874bf7))
- **summer:** summer event
  ([f939bdcb](watch/commits/f939bdcbcb07e35c87b984874e40ebc232cd0904))
- **thanksgiving:**
  - revert npcs back to normal
  ([eb27a767](watch/commits/eb27a767093905ab045196f58c07389bf76eaf81))
  - add migration for turkey mounts / pets
  ([a8cf1026](watch/commits/a8cf10261042a6925f4b4949313ba891a1ca5dd0))
- **todolist:** Push To Top Button
  ([76ac1039](watch/commits/76ac10395f5844b98438aa8233a2d6f6050dfbb0))
- **toolbar:** add button to hide/show toolbar
  ([2309184a](watch/commits/2309184ae3fdec65e1409eb99a34642b21a854ea))
- **valentine:**
  - remove valentine event
  ([b03c3772](watch/commits/b03c37729446201a57a5de0e9b07dbfb662612b2))
  - valentine event
  ([608b829d](watch/commits/608b829d7ebe5ebb175683a5d201ce60917191ba))
- **webhooks:**
  - move webhooks from array to object (everything should really be stored as objects). Add to API routes (see HabitRPG/habitrpg-shared#83a22b8). Note, sorting doesn't work. Meh.
  ([6ef838cf](watch/commits/6ef838cf1a7e6497446615d2674b949d6f48257f))
  - add webhooks operations
  ([83a22b81](watch/commits/83a22b8133c2d8906cf318d9c51d8e1e04b468a4))
- **winter:** remove WWE scrolls
  ([e090e043](watch/commits/e090e0430df93600291d79dbaf0f72e993bec134))
- **wondercon:** add wondercon gear
  ([bc5ff641](watch/commits/bc5ff6412afe25a54070413e52413b9a0510a645))
- **world-boss:**
  - Desperation move
  ([3ee965d8](watch/commits/3ee965d8d25e896b942d8e1bfda796e83a0b0540))
  - Desperation move
  ([7925935f](watch/commits/7925935ff5de77699df31da6369a74a78ef9bcfe))
  - Healing on rage
  ([480b4e27](watch/commits/480b4e276435c93fcef31248430dee4dc3d2d1c7))
  - Healing on rage
  ([ad7c02d5](watch/commits/ad7c02d50d5a62570b7ecf356c93930a9047fb15))


## Docs

- **rebirth:** Bullet point to reassure users that they can get their limited ed gear back after Rebirth

