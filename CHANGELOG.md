<a name="">My app - Changelog</a>
#  (2015-03-24)


## Bug Fixes

- **.task-filter:** force long words to wrap
  ([9c2c08c0](watch/commits/9c2c08c03d8449db5e8b4474a4663e8011f3a6fd),
   [#4308](watch/issues/4308))
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
- **analytics:** remove testing code
  ([5de42b03](watch/commits/5de42b03c9b6500c26354e556c463becd58e2a93))
- **auth:**
  - upgrade facebook to Graph API 2, fixes #4832
  ([0c63f6cb](watch/commits/0c63f6cb7dbe741ffdbaef53a947c1ffb1138b0a))
  - search case-insensitive usernames when registering
  ([c3bb42b1](watch/commits/c3bb42b1086fccfa955d87e9d37801eb979204da))
- **avatar:**
  - prevent avatar from obscuring name
  ([8cf3cd66](watch/commits/8cf3cd66ccd35cf0171a08a696ff67b5243d4235))
  - Correct "Facial Hair" text
  ([e4df3435](watch/commits/e4df3435e13690288c920236c039b70988bc24cf))
- **avatar-sharing:**
  - screw it, 1.3.3 backwards compat isn't working at the router level anyway. Besides, avatar sharing hasn't worked via addthis for a while, so we don't need this
  ([a44e0f7c](watch/commits/a44e0f7c31dbb7f70c0a024a961ae10b7d5554e6))
  - angular@1.3.9 upgrade fixed the /#?memberId=x bug. Also, anon wasn't able to view avatar shares!
  ([a053486f](watch/commits/a053486fcde200fb212e9863ffefe60f3a562600))
- **avatar.styl:** improve label layout
  ([0943a229](watch/commits/0943a229ec5cbb976e204ec7ec4641b138aea39b),
   [#4349](watch/issues/4349))
- **backgrounds:** Frigid, not Snowy, Peak
  ([285ff622](watch/commits/285ff6228cd2b2b5d82a0f887b6ac3fc8530c1db))
- **bailey:** mystery 3014 promo
  ([bd5f8d79](watch/commits/bd5f8d79eaddcbcc42957f92c2e059da8b44979e))
- **billing:** script to fix current_period_end, see #4420
  ([ca2d4511](watch/commits/ca2d45113c7f0d9ad5b59ac919355bb0d93737ef))
- **cds:** max hour is 23 not 24
  ([193b92c1](watch/commits/193b92c16ba4a312d97194e7f2eba31a33acfd81))
- **console:** remove console.log
  ([c301bd3e](watch/commits/c301bd3e89e4fb0b02bc62b5b16356cf327f46c0))
- **content:** Cannot call 'toString' of undefined
  ([d5eb5bbf](watch/commits/d5eb5bbfe0416fbfa7270f371edc956c8c166c6b))
- **date:**
  - typo
  ([756fa834](watch/commits/756fa83418e470578b0b43975a7c4e3d2e244284))
  - add YYYY/MM/DD format
  ([cb13b5ac](watch/commits/cb13b5ac26c7bd43eb024679ca6083e328a2598c))
- **db:** upgrade flags.recaptureEmailsPhase to new values
  ([eb1ca43c](watch/commits/eb1ca43c44788ee8bf45d2bfe4f7874b0b24a213))
- **emails:**
  - send emails to new fb users
  ([92a6af72](watch/commits/92a6af72cff29536985da2f3ef3f207d74842abb))
  - parse json
  ([925bfe8a](watch/commits/925bfe8af44765ea05cef4a59a57b0eb88325c26))
  - remove unused variable
  ([739d8885](watch/commits/739d8885a36057bbf2198e350d507e92f87503d4))
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
- **footerCtrl.js:** disable addThis hover
  ([45d30ffe](watch/commits/45d30ffef56cdec74849448195e9cca02af58d7d))
- **gem-cap:** use customerId in gem purchase
  ([2018cc84](watch/commits/2018cc84ab9891d7ec32dd4dbae0cedfba7786b8))
- **gifts:**
  - $rootScope => Payments
  ([3423e985](watch/commits/3423e9857d6a00f8305e7906f01ee5760650d8dc))
  - allow gifting 0<gift<1 (cc @Alys @crookedneighbor)
  ([1a84d019](watch/commits/1a84d01933d5312c128fcfa93b98228d0233f558))
- **grunt:**
  - allow caching of spritesheets, fix #4542
  ([01d695ca](watch/commits/01d695cae5d820e2aeb567d4d9fa76da53bed7fc))
  - Push CSS
  ([61b82718](watch/commits/61b827183be2e5a8b956e485009fc31f1ddd746d))
- **hair:**
  - Oldschool Winter
  ([223e87e6](watch/commits/223e87e6481ce1f2a20d81d8d83994d8519f5fcd))
  - Black 11-12
  ([970a0ed8](watch/commits/970a0ed831c8a5f2c5e662f5d3fbe8b64b353462))
- **i18n:**
  - remove empty strings as they break transifex
  ([0be58eb4](watch/commits/0be58eb4037c6439f26646c2983db03a6dfde40a))
  - language selection working on static pages
  ([42c0b443](watch/commits/42c0b443d7d81fab5260fed7252c5fc6f807a8a1))
  - remove duplicate strings cc @negue
  ([edbfc24b](watch/commits/edbfc24b0856765b668ae0f0013ea22b9aae493f))
  - fix english string
  ([17f9d4de](watch/commits/17f9d4de729bf1e4d22d6985631b3497f1df3259))
- **iap:** iap verification fixes
  ([f9cc2add](watch/commits/f9cc2adda548a15b296cb9de2d8ced137752e4be))
- **inn:** see https://github.com/HabitRPG/habitrpg-shared/pull/231
  ([2822ce23](watch/commits/2822ce233fae8fbf422c064d46c1292b21e17220))
- **interactive-tour:**
  - remove old unused strings
  ([9d5889c4](watch/commits/9d5889c428034d607d20300543e78abaf0b3af5c))
  - "Buy the Training Sword"
  ([16e996c9](watch/commits/16e996c971fd0792e9e36f8d049836b522c40f4a))
  - small updates per https://github.com/HabitRPG/habitrpg/issues/4726#issuecomment-77643235
  ([63a6af6e](watch/commits/63a6af6e0a644e1727f2d601e1eac53849c03b30))
  - just set everyone to "off" for tour on initial migration
  ([aee1a3cd](watch/commits/aee1a3cd6fddad3b917b8c40f2c7b04318eee282))
  - "hide" on the left, nav on the right
  ([98f50374](watch/commits/98f50374c900b1a0a8b52d6fb30176fe40dbdb1d))
  - cleanup steps when navigating chapters, don't use tour.restart()
  ([a7232b5a](watch/commits/a7232b5abe31e0f1368437e864d1941bf1b976c2))
  - don't automatically show guide when on mobile devices
  ([232224c4](watch/commits/232224c49730e6421ec111beab5e17c980b3c509))
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
- **mouse:** Missing ears
  ([f065feb6](watch/commits/f065feb6cbce43445c08c9179c99dd1856fab1dc))
- **mystery:**
  - Last missing sprite
  ([7d943d90](watch/commits/7d943d9007c2c7aabecf49dd196b006d7aafdd99))
  - Missing sprites
  ([f5f21718](watch/commits/f5f21718ae3c0f7dfd38aee990b7f38588f95a91))
  - typo
  ([703451d4](watch/commits/703451d452330f15f47d16903da8b66b063ed202))
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
- **purchases:**
  - Correct hair path
  ([4ded747b](watch/commits/4ded747b8811d779d64f957bd937fd566add89b3))
  - Hide "2/locked" as appropriate
  ([4adf95fe](watch/commits/4adf95feb644e35eb2c55fe53d0cb2a0248b10bf))
- **quest:**
  - Typo
  ([607286af](watch/commits/607286afa57b51423c3243ab2ce30a98c0a6c43d))
  - Different string format
  ([efdf591e](watch/commits/efdf591eae12e8b2c651072b1f4e84e899b0228e))
  - Correct unlock string
  ([7422fe38](watch/commits/7422fe3865d3ea6a2a89fb6a0c4517dd08054156))
  - Dapper to perspicacious
  ([5cd6c02e](watch/commits/5cd6c02e8af8714381be180ddf81a7ba396cf72e))
  - Add penguin to shop
  ([dc034e4a](watch/commits/dc034e4ab5e0c694de7f8a2ff6447fb6c4eec2bb))
  - Penguin corrections
  ([7fd4cebb](watch/commits/7fd4cebbdc531b6875fb0fbb687b89b66362ee67))
- **quests:**
  - Reference string correctly
  ([c8db070b](watch/commits/c8db070b129939758dca3485be0637948e244d36))
  - Alternate unlock strings
  ([4c5f4377](watch/commits/4c5f4377ff335923c7bcabd491aa7bcceca8be5c))
- **reset-password:** use array for variables
  ([29382d18](watch/commits/29382d18f7a8bf37b9696ee0d8e5d4ecf55e6e73))
- **robots:** fix robots.txt per http://stackoverflow.com/a/7609187/362790 #4746
  ([f993a586](watch/commits/f993a5868f6d13be6d9ffd62ed8e32471e81154a))
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
- **shop:**
  - Enable head accessories
  ([ae25af7c](watch/commits/ae25af7c022f9ed88d74c84993519687b6c4b159))
  - Open Shop
  ([dac29211](watch/commits/dac292114ccd583a6570000489bff362d612fa1e))
  - Remove br
  ([bd0d4c8b](watch/commits/bd0d4c8b214713842e399e05bd6d0e5c9129e6dd))
  - Indent +1
  ([621e5ba7](watch/commits/621e5ba7d776ba9d21099032a64efa98fe275ae1))
- **spring:** Tweaks
  ([e2b10830](watch/commits/e2b108308857926594b9f55110e1f8f7f231baed))
- **sprite:**
  - Added correctly sized image for iron knight. Closes #4824
  ([60a62a28](watch/commits/60a62a282e44cf8ccc5258203fdbd90e70ea7f65))
  - Improved Nameless Helm
  ([009255bd](watch/commits/009255bdb5943ccfb34202425a076e029b323802))
- **sprites:**
  - Rooster recolors
  ([b8d9f047](watch/commits/b8d9f047b1fc65664b00310df5627ec11078d2d3))
  - Move penguins 3px
  ([c6d3d72e](watch/commits/c6d3d72e00f37020deff4974523bbf81582004eb))
- **string:** Missing comma
  ([b118d45b](watch/commits/b118d45bb3eb2c9a9014139c777d9543674f121a))
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
- **subscriptions:** Fix to Gems badge
  ([b0176236](watch/commits/b01762362161f709bb1fac5f7c16581350475b84))
- **surveys:**
  - Visibility tweaks
  ([3a9e2a51](watch/commits/3a9e2a512387c6dbdfa028d28df1db493a7d7569))
  - Fix malformed Angular
  ([53df85e0](watch/commits/53df85e01bd83a2c5ce60806334ae86889b29f6a))
- **sync:** fix for when data is null, ie. server offline
  ([4a22b1dc](watch/commits/4a22b1dc57d1167b24e225f2253d9272120daf63))
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
- **tavern:** jade fix
  ([985171f8](watch/commits/985171f856c79c0ab3f595bb5b9d9a95baffcc80))
- **tour:**
  - Try k
  ([3f4bddc5](watch/commits/3f4bddc57db4520ef4f04edbcbb6ebd86d7bc613))
  - don't restart tour on userUpdated, fixes #4632
  ([2d44783d](watch/commits/2d44783d807256a0a04e5e56d0fa1eafb4620fe5))
  - misc tour fixes. uses backdrop, next/prev (important we've found in user test vids), etc
  ([39163463](watch/commits/3916346308cc07f5c9fab11a2b0830c6c12a1385))
- **webhooks:** don't send webhooks if not valid url (also if not enabled), fixes #4357
  ([cb9083d9](watch/commits/cb9083d9ba03854eabe4ff628f61ded809f7059d))
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
- **ads:** remove ads completely
  ([84a77695](watch/commits/84a77695eaad9045774c4fedee5d378edfd21efe))
- **analytics:** add A/B testing on play button using GA's Experiments API. Revert this after the experiment
  ([009b582f](watch/commits/009b582f2530d2d13f08c74cc419a70fc4071a02))
- **auth:**
  - temporarily back to nodemailer #4789 (cc @paglias)
  ([2cf98dae](watch/commits/2cf98daec4ae9eb2b7107279d54e8cc3f9e474cc))
  - update manual_password_reset so can pull creds from config.json, and email from CLI. Much easier when updating en-masse
  ([8b04773b](watch/commits/8b04773b2ec203b223a6cdfd3a99a7ba4b071d22))
  - add manual_password_reset migration
  ([6ed0ff28](watch/commits/6ed0ff289f31e310137c3aba231c1cf03bbfb699))
  - 404 on "can't find email"
  ([1687d9ae](watch/commits/1687d9aedae0a27375ad1848b7785c6849018507))
- **backgrounds:**
  - March BGs
  ([21fd8061](watch/commits/21fd8061cf3ac088831da764cb518cbc438fdb25))
  - January backgrounds
  ([0bfc5b37](watch/commits/0bfc5b37c007f8f5860810428434f0184075c4df))
  - December purchasables
  ([4d8a9c52](watch/commits/4d8a9c5287c8e24398cb93124a872fdd346d1c25))
- **challenges:** optional checkbox on group create/edit: restrict challenge-creation to leader. Commented-out code for similar setup for member invites, shouldn't be hard
  ([e1ea1a24](watch/commits/e1ea1a24c80674ab0aea0c60b65383db38c0c02e))
- **change-email:**
  - remove blurb about changing email address
  ([b013c61b](watch/commits/b013c61b3be7176651b1f8c5725817125045dd7d))
  - allow changing email address
  ([23318403](watch/commits/2331840386b5a9e97ef86048347fd1238b71a89b))
  - allow changing email address
  ([8852ac6b](watch/commits/8852ac6b698ce0a5463f5cbfb4b18815245444ca))
- **discount:** google discount & use sub.key instead of sub.months
  ([edf66cbb](watch/commits/edf66cbb59c1246fadf5f452a919cdf0a3e83da1))
- **email:** add new image for subscription email
  ([ce73a751](watch/commits/ce73a7513370567d48d218d7b11ffbcb96fe00a9))
- **email-notifications:** implement email notifications for events
  ([d211bc7f](watch/commits/d211bc7f861517a16d0d653f1be69b6e1d72ba92))
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
- **facebook-to-local:**
  - allow users to move from facebook=>local
  ([5ec2c118](watch/commits/5ec2c118a5ab51b652915f1a9cfbe3c6ff98785d))
  - allow users to move from facebook=>local
  ([a4c2bf61](watch/commits/a4c2bf61b26011765443c54481c065f475f675e4))
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
- **gifts:**
  - allow gifting subscriptions
  ([5b01fff7](watch/commits/5b01fff70038886f470f2769235759ff29d7fcf5))
  - allow gifting gems from paypal/stripe
  ([e8dbd5ca](watch/commits/e8dbd5ca1a89c45d1d63f2dfc714822bdc444a9d))
  - allow gifting from balance
  ([7e9b92fc](watch/commits/7e9b92fcad3d2ad43da5395b34f580b8d961d648))
- **google-discount:** add google discount
  ([5fc001e4](watch/commits/5fc001e4f6bac35020dbe63667d034c2957a47d0))
- **i18n:**
  - add strings
  ([09015370](watch/commits/09015370f0b9eef726ccf5dd3f695f2ea87d8f75))
  - add string
  ([ff9280de](watch/commits/ff9280deea2326987c67c627cd622bf0925ca62a))
  - add string
  ([bb855bf9](watch/commits/bb855bf9931dc127304e2c1e47394196fc25c937))
- **iap:** ignore keys/ directory. upload any keys/iap-sandbox iap-live etc on a private branch
  ([9d6caaa1](watch/commits/9d6caaa138d31d4c784737150ea313d68c69b745))
- **interactive-tour:** disable ads till lvl 2
  ([d84549e2](watch/commits/d84549e2395046c4d94475778cf421eab0f720e5))
- **loggly:**
  - change tag based on base_url, logs internal server errors
  ([dac2fc68](watch/commits/dac2fc682dfedbd9373b9d2695a857b1cf7afebb))
  - enable json loggin and start loggin errors during cron
  ([8935538b](watch/commits/8935538b5351d8da9b0aee454b1444b63480932c))
  - add test log, use only in production and add sample config
  ([af1ff6d7](watch/commits/af1ff6d74059e12683603ca89a55e5a12ff1a9e4))
  - add loggly
  ([7356e0ba](watch/commits/7356e0bafeb3843d6c457c654abc7a68f999cf44))
- **mystery:**
  - Migration
  ([55066480](watch/commits/55066480fb3685ae54ff637bfe470e1e257cdfa6))
  - February 2015
  ([d4f8acd0](watch/commits/d4f8acd0ef0879f0a0f459c0a79225b8e791313c))
  - January subscriber set
  ([524761f1](watch/commits/524761f1cf4895b4a876ec696805c0f7c6998f21))
  - January subscriber set
  ([e2f47651](watch/commits/e2f47651a4facc79afec1edfd8c2c76bafee1ed7))
- **mystery items:** March subscriber sprites added
  ([e918aa15](watch/commits/e918aa158d9d7835efcde86239919c7b830cda27))
- **news:**
  - Promo images
  ([0ec9e5b1](watch/commits/0ec9e5b1e1edb86db3266e4cf633047d27d1dabf))
  - move old news to /static/old-news, better use of content space
  ([66b4dae0](watch/commits/66b4dae0d98853edd67a117cc4a196f7bdce69f7))
- **pie:** Add pie
  ([1120d334](watch/commits/1120d334c31c8f3836d4a88b4e1a0a31cd2e48d1))
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
- **presskit:** add presskit page cc @lemoness
  ([cba232ef](watch/commits/cba232ef83fb15c3fd74ed8eb535b5dc3d317bad))
- **quest:**
  - Bunny quest
  ([4cb67835](watch/commits/4cb6783544b483865d008990e7e6f243e8339e52))
  - Pet Rocks
  ([0608ac5c](watch/commits/0608ac5caa8e753ba4e9c3a92b5fb3c7424f4f30))
  - T-Rex pet
  ([c260362d](watch/commits/c260362d96b629a47d0ce18bacfd7fcc9554b065))
  - T-Rex pet
  ([0b63e48c](watch/commits/0b63e48c6e10478e1717f0ce132ceb0ade4ccb4d))
  - Implement Penguin pet quest
  ([d25455fa](watch/commits/d25455fa5ad9f15815c3220f6bf292e868b57a00))
- **quests:**
  - Differentiated scrolls
  ([41241750](watch/commits/412417505f2d84d049572a9bfc73d78c3f63c344))
  - Differentiated scrolls
  ([2ca6636c](watch/commits/2ca6636c944c67f9e527d96cc41987dc83a718b2))
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
- **spring:** Fling
  ([f3f5669a](watch/commits/f3f5669ab28e944e7c65deef256ac8248f98e4e5))
- **subscriptions:** Show count of purchasable Gems
  ([62e526f8](watch/commits/62e526f8dc7b490b969a7ee9afa2ddc9c41956b2))
- **surveys:**
  - Close out survey
  ([7065b400](watch/commits/7065b400bc6c221641a57b8129f5ade5f9aded4c))
  - Survey achievement
  ([9cfa27f0](watch/commits/9cfa27f08948a2b6b8773d6fa0d4d1bf0c36f9df))
- **thanksgiving:**
  - revert npcs back to normal
  ([eb27a767](watch/commits/eb27a767093905ab045196f58c07389bf76eaf81))
  - add migration for turkey mounts / pets
  ([a8cf1026](watch/commits/a8cf10261042a6925f4b4949313ba891a1ca5dd0))
- **tour:**
  - Early quit classes tour
  ([18649144](watch/commits/18649144a8b47ac6822d19c40243b32566ceb573))
  - add the other tour entries @lemoness
  ([1e8265a9](watch/commits/1e8265a9f13c364c7f2cdca1124cf2767c714926))
  - ESC to perma-close #4886 @lemoness @alys
  ([cca2d81b](watch/commits/cca2d81bc3deb757d74c3ac3283ca45c52643034))
  - update habits step wording @lemoness
  ([152853a8](watch/commits/152853a877afd1d59eb6e2c03f4a7c560f9a6283))
  - Refactor the Justin Guide to be much more streamlined and interactive. Backdrop focuses user on present task. Chapterized guides
  ([812493fe](watch/commits/812493fec5c5a15db3c2411df0ad64b30c8ceba1))
- **world-boss:**
  - Desperation move
  ([3ee965d8](watch/commits/3ee965d8d25e896b942d8e1bfda796e83a0b0540))
  - Desperation move
  ([7925935f](watch/commits/7925935ff5de77699df31da6369a74a78ef9bcfe))
  - Healing on rage
  ([480b4e27](watch/commits/480b4e276435c93fcef31248430dee4dc3d2d1c7))
  - Healing on rage
  ([ad7c02d5](watch/commits/ad7c02d50d5a62570b7ecf356c93930a9047fb15))

