// Specify guilds that the automatic swearword blocker does not apply to:
// - religious/atheist/philosophy guilds (legit use of words banned as oaths);
// - food/drink/lifestyle/perfume guilds (alcohol allowed);
// - guilds dealing with traumatic life events (must be allowed to describe them);
// - foreign language guilds using the Roman alphabet (avoid accidental banning of non-English words).
//
// This is for a short-term, partial solution to the need for swearword blocking in guilds.
// Later, it will be replaced with customised lists of disallowed words based on the guilds' tags.

let guildsAllowingBannedWords = {
  'f646bc11-e330-482c-982a-843cd018373c': true, // Abuse Victims and Survivors
  'b5843474-07e6-4af2-9bd0-b8a00fe7fe52': true, // Alcoholics Anonymous - One Day at a Time!
  'd3339c3d-6744-4c17-b9d3-a16bdcfb5d53': true, // Am Yisrael Chai
  '1da5ae22-6659-4600-9951-905f923c9373': true, // Anxiety Alliance
  '6dd4603a-d4d0-4d20-be5b-955bfbb857ad': true, // Arab Folks
  'c30e1c2f-8712-4d93-ae44-33071e8cf661': true, // Atheists, Feminists, and other No Good Commies
  'a760b1e4-23b6-4c75-8118-5da8346251a3': true, // Aulas de Guitarra
  '04e8a9e6-cf61-4f62-ade5-4165b3223f8c': true, // Basques of Habitica
  'e80237c1-74c9-4f29-91e0-1bb75495dc0e': true, // Belgi(que/en/um)
  '33d1d2e7-fe3b-4860-b089-c2416e3af990': true, // Bherwmer, Leseratten und Schreiberlinge
  '29645d2c-1716-42c2-918e-5e4b87d68f0d': true, // Bible Translation
  '3e116e70-ae93-4c62-a7a1-cff8c87a3df3': true, // Boulevard francophone
  '1efaf502-c024-4d36-b456-4acc3f02740a': true, // Brasil
  'ac9ff1fd-50fc-46a6-9791-e1833173dab3': true, // Brasil
  '223fc49c-4018-4d21-99be-f2a9b6b7bad2': true, // Brasil - Motive-se!
  '2e8f74af-2f16-4c24-82ea-f9f5f0b31797': true, // Brasileiros
  'f45da130-ebd1-4936-9c91-2717ca11e03c': true, // Brasileiros
  '1c506259-ee27-4c52-a068-cf3e749fb9c8': true, // Bulgaritica (Bulgaria)
  'f8216aa2-c80b-4f0a-a7a0-bebbc51d314d': true, // CPTSD
  '910d9499-26df-4aa6-85bb-b1125bbf36e0': true, // Candida & Yeast Free - No more sugar
  'baf485d6-1b00-4e2e-a854-a34ed0829fea': true, // Catholic Champions
  '7b7112db-34d6-4162-b804-0feca3a6ddbe': true, // Catholic geeks
  '12f4a55c-439d-4361-82d9-583383b90881': true, // Centro de Estudiantes de Habitica
  'df71c7e9-acbd-4333-81a7-699b34c7ef56': true, // Challenge Translation Guild
  '0f2c28ff-35db-47eb-a459-5466dcd7d958': true, // Chef's Special
  '3f88cb57-e491-471e-90a3-b5a6cdb6a3d4': true, // Classical Scholars
  'f8eb26cd-42ab-4485-bfa1-0bc59c10609e': true, // Cocktail Crusaders
  '15d9aeca-50d9-4564-b955-41333ce60d68': true, // Coffee Enthusiasts
  '22e83aae-6004-4513-b3c9-66e5ff738f66': true, // Coisas Boas
  '7732f64c-33ee-4cce-873c-fc28f147a6f7': true, // Commonwealth of i18n
  '92e125ca-029d-4b25-a5a1-6aa1a3a15f1a': true, // Community for Practicing Buddhists
  '612e5766-a171-4e0a-b02b-c55a9fe786e4': true, // Compulsive Overeaters
  '726058f7-4452-47a3-aa86-e995d1ac031c': true, // Conscientious Consumption
  'c59147bf-46c1-4ec8-a63f-9a8ebfcf9987': true, // Culinary Institute of Habitica
  '202ab416-92b7-4cbe-97d7-772776c8f911': true, // Danish Translators
  '6c6f4df6-8bc2-4a4c-a5a1-d4f1ef447989': true, // Dar al-Arqam
  'ad251001-c1c5-4227-b165-6549a5b9e267': true, // Das Planertarium
  '3c25685d-9cda-4059-8bab-d93190985948': true, // Debauchery Tea Party
  '6882eee5-dc9f-4357-be91-183df56adb5a': true, // Deutsch
  '34415243-8410-45b4-9ee8-eb91941b9869': true, // Die Nachtw-chter - Multigaming Gilde
  'fc327965-9eea-46d6-9af1-9c9e819508ce': true, // Disciples of Jesus
  'a5d75dd3-5ff9-4082-ab0f-fbadf4333440': true, // Dragons of the Valley / Dreigiau'r Cwm
  '22360759-fd87-444d-86bd-42724be07bd7': true, // Duolinguists of Habitica
  '14ec51d5-6ca4-428f-abab-6932f2ba8793': true, // Eastern Orthodoxy (Traditional)
  '955fdbb8-f1b3-40cb-b528-8d292b312a6a': true, // Egyptology Unearthed
  'a4cd281d-4683-4604-86f3-d2cc955e1544': true, // En espanol
  '4c366cdd-9ece-4ee1-9bc5-fa0d0c8df63f': true, // Essential Habits of a Christian
  '414381ad-08bf-4fe4-b767-c0e874660438': true, // FOCUS - Fellowship of Catholic University Students
  '1705f33f-9303-4b78-93ac-e21ed2d08df8': true, // Fitbit Guild
  '2ed36580-011f-4abb-94fc-e52022f38f6f': true, // Foodies
  '5acb02bd-d3ac-414e-89c3-f922fce99ce4': true, // Forensic Science
  'ad502658-af78-4d3e-95ee-44d4095afdfd': true, // ForgeCode (French guilde)
  'fe8db772-b6f2-401b-9077-308a9065f2c0': true, // French<>English Translation
  '06fa90ba-cec9-4bf5-a6da-ab6d73ebf77d': true, // GTD Brasil
  '845c62d9-318f-45eb-add8-f5f4dc1eaec3': true, // GTD RPG France - (French guilde - Langue: Francais)
  'f9e586cc-7c4e-4181-831b-e15788be2e6a': true, // Geek Women Sweden
  'fe22aa23-b532-480f-be8a-30ff54f7c747': true, // German Translators
  'a785457e-d21c-4594-b73a-4e62e7e2e529': true, // Glorious Glossopoeists
  '4db38830-10a9-482a-8674-41473fac1e50': true, // Gluten-Free Living
  '8f2a7328-be85-4aea-91d1-9847f08cd346': true, // Guilde des UTTiens
  '0a5309b9-28de-4792-a543-769b90a30ece': true, // Habitica Quebec
  'ad603e8c-5ab9-422a-abf4-e88213f947e2': true, // Habitica et handicap (French)
  '4ccefedb-45ec-47b0-987d-661805c13beb': true, // Habitican Herbal Apothocary
  '158772f9-573d-42a0-a633-fa8406d87f42': true, // Healthy Habits Happy Moms
  '87342423-0b70-43d1-a3eb-6374f65ab785': true, // Homebrew Crew
  '327df8cd-7edb-4991-99a8-f7df785aff18': true, // It's BuJo time / German - English speaking Guild
  '4866c797-d319-4d33-9cc7-95c3375db2b1': true, // Italia
  '3349b1e3-5b02-461a-9670-6fb06ec80baa': true, // Just For Today Don't Do Anything Really Stupid Guild
  '1f2dd48c-7153-417f-b084-6341329716fe': true, // KHOA (foreign lanuage)
  '45cdaed8-1a6f-4dad-9b52-bc6514344a09': true, // Keto guild
  '3848ce6d-5f7c-49e9-93f6-40116e96ba40': true, // Keto-ers
  '126027f5-b98d-4e40-8739-d15150e78506': true, // Knights of the Prayerful Rose
  '915570de-4da9-4cce-9ecb-3a5184843f61': true, // LGBTQ Christians
  '11892b37-3e4a-40ed-9702-906765becc84': true, // La Esperantistoj
  '8acf0984-79dd-4deb-b30e-65fb26e96bf4': true, // La Posada del PoniPisador (Spanish Player Vs Moustros)
  '1e7ee0b3-93a6-45ef-8f9e-11956f79e984': true, // La voix des francophones
  '283171a5-422c-4991-bc78-95b1b5b51629': true, // Language Hackers
  '3272dfab-2b42-4ccd-ab12-eeeb4aed63ad': true, // Learning French - Apprendre le francais
  'c197e7ea-093e-4463-bee2-d08c3a951247': true, // Learning Hungarian - Magyart tanulni
  '170f8a17-8ce0-425c-8c31-eeb7e5ae7493': true, // Legendary Book Club of Habitica
  'a65d65bf-c8f2-44ba-acf9-ec14bffe95ec': true, // Les Forgemots
  '694b15e1-19b0-4ea8-ac71-ce9f27031330': true, // Life Hackers
  '2f4ccbe5-daed-45ad-85a8-3c8afe028143': true, // Lose Weight/Get Healthy
  '731b9421-8fb1-44d2-9b2f-6ec72f673ddc': true, // Lovers of Language
  '1e3903cd-1051-49a3-a1ae-542375dd891a': true, // Low/No Sugar Guild
  '7ce853ae-ca8e-401d-a978-76a6e9bcff9b': true, // Marketing Digital Brasil
  '0cc9a8d7-a6e0-43f1-b1e4-106316f14dce': true, // Moslem Guilds
  '12c769df-f934-486d-a228-a4569432815c': true, // Muslim of Habitica
  'bf7a1d6e-a09e-4189-a5e4-e88eb2f3192d': true, // Native Americans of Habitica
  'f31a22e5-97a6-450b-b2e8-1b9fbb82ce3e': true, // Nederlands Vertalersgilde van Habitica
  '7dc5f455-9e0c-4ff7-bca5-9dd247bc4516': true, // Norwegian Translators
  '928d1fd7-fa38-42c1-bc38-098d2a3a1e6f': true, // Noun-Verb-Adjective Challenge Guild
  'fa440bb1-a7ea-4860-a2b3-328bd4c26249': true, // Occult
  'a9d77ea9-4e78-4330-b04a-d43f45088e6a': true, // Odins vasaller
  '84037e2f-ca65-4f85-8382-1326a44a884b': true, // Pagans for Justice Guild
  '53ecd71a-dd35-4cfd-b863-943463252c58': true, // Pagans of Habitica
  'fc99098c-7a95-45b4-bdba-1304011f2c8c': true, // Parlons Francais!
  'db4819dd-0efb-4290-989c-9f7625b59a3a': true, // Party Wanted International
  'eef221ad-d118-48b0-a6fe-98461e8a394a': true, // Perfume People
  '8e858862-255f-47b6-94b9-c2fac22befb7': true, // Petits Pas Anti-Procrastination
  'c4476c7b-2024-4881-8df8-9b038480ed34': true, // Philosophers
  '6a63eaf3-367d-450b-9022-7f284b8b9a1c': true, // Polish Translators
  '006c7f68-e07a-4a56-9dcf-fd64c90e3ef4': true, // Polska
  'cbb90784-a80f-413b-90a4-dbb1b18487b6': true, // Polytheists & Pagans
  '8dc268f5-5f6d-41a0-82ca-a248dfd240c4': true, // Portugal Fenomenal
  '77e13b13-e3ba-4e45-badf-9e448bb9be64': true, // Portuguese Translators
  '46bc163e-f34e-4216-b916-9062d30a141f': true, // Procurando Grupo Brasil (Pedir Convite)
  '00698a77-cda2-4f49-a59f-f32205078903': true, // Quit Soda Support Group
  '3584819a-a854-4768-ba49-8880fc0dda14': true, // Reiki Br
  '68d1ffa9-c4af-4c64-b943-3c6637d4b3ad': true, // Roni
  '8d44f1ab-2615-47dc-a143-3236c93c67b6': true, // Scandinavian Vikings
  'f065a669-9483-42d4-9562-7f8dd5b8adb7': true, // Seasonal Decoration Guild
  '18412f84-86ff-4c3d-a3ad-ff59b80e8db5': true, // Secular Humanists, Atheists, Agnostics, and Skeptics
  'aa8bafab-1328-4d41-a668-f316e0c138ca': true, // Slovenske
  '23f0748e-cf5f-4e48-ba71-498a60e91e1b': true, // Tea Room
  '78461f92-6fc3-4432-94c9-c45b189e0ae8': true, // Turkiye Turkey
  '42a0b13a-bc1c-4108-8580-870c70683d1a': true, // Urban Homesteader's Guild
  '1a7d0075-d590-4aaf-b671-52c5a514a8cf': true, // Vegetarians and Vegans
  'a6046d13-6540-4dba-99a4-adb66670c784': true, // Wedding Planning
  '2302b61c-a349-4b07-b185-03269760bc40': true, // Weight Loss/Maintenance
  '71d586e3-ce99-480d-8108-9b6dd95816e4': true, // Whole Foods Lifestyle
  '580b9c90-9e8f-4c54-9106-559c87534dab': true, // Wild Yeast Guild
  '9c5d923b-9698-483a-b885-a5eba2e4ec75': true, // Witches of Habitica
  '8e389264-ada0-4834-828c-ef65679e929c': true, // Witches, Pagans, and Diviners
  '0ff469a9-677f-4dcd-a091-2d2d3cebcaa8': true, // Writers of Ideas: Speculative Fiction Authors
  'f371368a-b3b0-4a81-a400-3bd59fc0a89d': true, // Youtube francophone
};

module.exports = guildsAllowingBannedWords;
