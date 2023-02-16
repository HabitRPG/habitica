const { sortChallenges, compareObjects } = require('../../website/server/libs/items/utils');
const assert = require('assert');

let data =[
    {
      "tasksOrder": {
        "habits": [
          "6ed06f45-3fc0-4e75-ae06-695f22ebb8d9"
        ],
        "dailys": [
          "1e7e22d4-20af-47e0-8fbe-7339c73d04ff"
        ],
        "todos": [
          "e1605a54-a944-4fa3-b995-9ea0ec95a6d0",
          "27e4ace6-7d01-43a3-86eb-42ff6004417b",
          "daa065ab-9bb0-4aaf-98ca-59ee23bfbe1b"
        ],
        "rewards": []
      },
      "official": false,
      "memberCount": 2285,
      "prize": 10,
      "_id": "1d27d0ef-0dda-4bda-af3d-275e3a84ea10",
      "name": "It's Dangerous to Go Alone! (TAKE THIS Challenge - January 2023)",
      "summary": "Social connections are a valuable strength that can help us get through the tough times and make the good times even better. Your TakeThis.org challenge for this month is to build and/or strengthen your social networks!",
      "description": "The nitty gritty details:\n- The Challenge will Run from January 3, 2023 through February 1, 2023\n- The winner will receive 10 gems and 5 runners up will receive 2 gems each\n- Winner and runners up are chosen at random among participants who complete one or more Challenge tasks\n- All participants receive a piece of the [Take This armor set](https://habitica.fandom.com/wiki/Event_Item_Sequences#Take_This_Armor_Set)\n\n--------\n\nSocial connections are a valuable strength that can help us get through the tough times and make the good times even better. Your TakeThis.org challenge for this month is to build and/or strengthen your social networks! (And we don't mean your social media follow lists!)\n\n--------\n\n*This is a Challenge created in partnership with [Take This](http://www.takethis.org), a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness.*\n\n------\n\n**Other Challenges in this Series:**\n\n*[Playing the Long Con!](https:/habitica.com/challenges/ca428fe2-1e3d-4974-bbb2-21edd4f8bec1) - Staying healthy while at conventions*\n\n*[Check Your HP!](https:/habitica.com/challenges/ac35928b-16ad-4c10-9136-348183bd7955) - Tracking your mood*\n\n*[Cast of Characters!](https:/habitica.com/challenges/22db61a5-1022-4f1a-87f6-ad7552bf740e) - Visualizing emotions as figures in a story*\n\n*[I Am The Night!](https:/habitica.com/challenges/2b840b66-4d61-4b84-bb44-29f8829e251c) - Improving sleep hygiene*\n\n*[Test Thy Courage!](https:/habitica.com/challenges/2d59c9a4-24ab-4649-8ccb-041911ea9c66) - Braving social interactions*\n\n*[Keep Calm and Carry On!](https:/habitica.com/challenges/ef572c63-7541-49c3-a5ed-df1552958809) - Breathing techniques to calm anger or anxiety*\n\n*[Hero's Triumph!](https:/habitica.com/challenges/04d2d858-1afc-4c41-8693-47d4fb763a02) - Volunteering for worthy causes*\n\n*[Multi-Player Co-op Exercise!](https:/habitica.com/challenges/ed1a0476-10e5-4a20-8b3c-6dcd1842d545) - Partnering with others for fitness*\n\n*[Notice Me, Senpai!](https:/habitica.com/challenges/9935547a-838c-42e4-a6d6-5aa7b1778b11) - Reaching out for help in times of difficulty*\n\n*[Gaining Inspiration Points!](https:/habitica.com/challenges/fa05391a-de3b-4a1f-a9c9-750190c43f10) - Engaging your creative powers*\n\n*[+2 Intelligence Bonus!](https:/habitica.com/challenges/295d3919-f504-4c12-af1c-98dc85496438) - Researching topics of interest to expand your mind*\n\n*[This One Goes to 11!](https:/habitica.com/challenges/aee6b79d-fc76-4167-ada0-c54981ef448e) - Taking breaks to avoid getting overwhelmed*\n\n*[Don't Be a Completionist!](https:/habitica.com/challenges/9836deb1-181b-44fd-9571-3d5a9e50e091) - Prioritizing your to-do list*\n\n*[Feed Me, Seymour!](https:/habitica.com/challenges/93d951c4-2325-4cc2-8f8b-416481b5efa2) - Improving eating habits*\n\n*[Achievement Unlocked: Self-Care!](https:/habitica.com/challenges/765a7de4-c799-4a16-af5c-2e0627cd90ba) - Being gentle with yourself and taking time to do things you enjoy*\n\n*[Do One Thing Well!](https:/habitica.com/challenges/18b3634b-60a0-44b5-b0eb-b0941b6ad5d2) - Avoiding multitasking to sharpen focus*\n\n*[Harder, Faster, Stronger!](https:/habitica.com/challenges/5390fda0-3479-40d2-b2f0-739c020697f6) - Adding physical activity to your routine*\n\n*[Organize Your Inventory!](https:/habitica.com/challenges/17be7d46-c049-4ecd-b4b7-1fc72f92393b) - Straightening up cluttered spaces*\n\n*[You've Got a Friend in Me!](https:/habitica.com/challenges/02ec6294-8a5b-4eae-9c28-ec9b4fd6612f) - Thanking the people who improve our lives*\n\n*[Rolling a Natural 1!](https:/habitica.com/challenges/338c89e3-f9ac-40b6-aadd-0e0a5491648d) - Bouncing back on bad days*\n\n*[Enter Sandman!](https:/habitica.com/challenges/7384b78e-d883-4e30-8732-8c032bb024be) - Going to bed on time and without distractions*",
      "categories": [
        {
          "_id": "63b4ae1a61ce068194a2d7fc",
          "slug": "mental_health",
          "name": "mental_health"
        },
        {
          "_id": "63b4ae1a61ce06becba2d7fd",
          "slug": "habitica_official",
          "name": "habitica_official"
        }
      ],
      "group": {
        "privacy": "public",
        "_id": "00000000-0000-4000-A000-000000000000",
        "leader": "7bde7864-ebc5-4ee2-a4b7-1070d464cdb0",
        "name": "Tavern",
        "type": "guild",
        "categories": [],
        "summary": "Tavern",
        "id": "00000000-0000-4000-A000-000000000000"
      },
      "leader": {
        "auth": {
          "local": {
            "username": "heyeilatan"
          }
        },
        "contributor": {
          "admin": true,
          "level": 9,
          "text": "GigaMeow",
          "newsPoster": true,
          "priv": {
            "userSupport": true,
            "userSupportPlus": true
          },
          "contributions": "Petition to rename the Orange Cat Hat to Jorts Hat."
        },
        "flags": {
          "verifiedUsername": true
        },
        "profile": {
          "name": "natalie"
        },
        "_id": "f4e5c6da-0617-48bf-b3bd-9f97636774a8",
        "id": "f4e5c6da-0617-48bf-b3bd-9f97636774a8"
      },
      "shortName": "Don't Go Alone",
      "createdAt": "2023-01-03T22:37:14.254Z",
      "updatedAt": "2023-01-26T16:25:01.584Z",
      "id": "1d27d0ef-0dda-4bda-af3d-275e3a84ea10"
    },
    {
      "tasksOrder": {
        "habits": [
          "a0fe6716-aa30-4386-b0e5-8c0e755ceba6"
        ],
        "dailys": [
          "d317e436-3351-4f91-9d6e-8f76672b24d0"
        ],
        "todos": [
          "e308f17a-8f65-455e-9f29-3e1da294d4c6",
          "3f49b373-3623-44eb-8642-1c58fd5cce56",
          "68bec37a-5124-44fc-a90c-9d9f23ab59f1",
          "0bed2008-e2fd-46e6-8123-03fe3dc82f12",
          "187c9925-c505-45c5-92dc-411fb2284457",
          "f12d88f6-db6c-4667-af89-9a4da4d06345"
        ],
        "rewards": []
      },
      "official": true,
      "memberCount": 2987,
      "prize": 25,
      "_id": "c2d1df72-63cc-456b-9751-3ffb58affd2f",
      "name": "Official Habitica New Year's Resolution Challenge: January - Begin your Quest!",
      "summary": "Make 2023 the best year ever! Join this Challenge and the Official New Year's Resolution Guild for help, support, and a motivation boost as we help you choose and stick to your New Year's Resolution all year long!",
      "description": "Happy New Year, Habiticans! Make this your best year ever by setting new goals and sticking to them with the help of Habitica's gamified approach to habit-building and the support of our fantastic community. Each month, we'll be posting an exciting new Challenge designed to help keep you motivated and on-track as you tackle your New Year's Resolution!\n\n---\n\nAs the New Year approaches and January begins, we'll start by choosing our goals, doing any necessary research, and creating our initial routine of tasks to help get us started in the right direction on our journey. We hope this Challenge helps you take your first steps on a transformative adventure through 2023!\n\n---\n\nFive winners will receive their choice of a one-month gift subscription to Habitica or 25 gems. These winners will be chosen on Feb 1st from a random draw of all participants who complete **all the To-Do's**. *(The Dailies and Habit are a bonus to help with accountability and motivation!)*\n\n---\n\n**Note that the February through December New Year's Resolution Challenges will be hosted in the Official New Year's Resolution Guild: https://habitica.com/groups/guild/6e6a8bd3-9f5f-4351-9188-9f11fcd80a99 Join today!**\n\n---\n\nFor those who wish to participate but do not wish to complete the social media task, an alternative version of this Challenge can be found here: [https://habitica.com/challenges/65eb9198-bef2-4d90-93b7-1433e1100880](https://habitica.com/challenges/65eb9198-bef2-4d90-93b7-1433e1100880)",
      "categories": [
        {
          "_id": "63af17658cf1bddb02369747",
          "slug": "habitica_official",
          "name": "habitica_official"
        }
      ],
      "group": {
        "privacy": "public",
        "_id": "00000000-0000-4000-A000-000000000000",
        "leader": "7bde7864-ebc5-4ee2-a4b7-1070d464cdb0",
        "name": "Tavern",
        "type": "guild",
        "categories": [],
        "summary": "Tavern",
        "id": "00000000-0000-4000-A000-000000000000"
      },
      "leader": {
        "auth": {
          "local": {
            "username": "beffymaroo"
          }
        },
        "contributor": {
          "text": "Retro-mon",
          "level": 9,
          "contributions": "Super Empath!",
          "admin": true,
          "newsPoster": true,
          "priv": {
            "userSupport": true,
            "userSupportPlus": true
          }
        },
        "flags": {
          "verifiedUsername": true
        },
        "profile": {
          "name": "beffymaroo"
        },
        "_id": "9fe7183a-4b79-4c15-9629-a1aee3873390",
        "id": "9fe7183a-4b79-4c15-9629-a1aee3873390"
      },
      "shortName": "NYR Jan 2023",
      "createdAt": "2022-12-30T16:52:53.674Z",
      "updatedAt": "2023-01-26T16:44:55.442Z",
      "id": "c2d1df72-63cc-456b-9751-3ffb58affd2f"
    },
    {
      "tasksOrder": {
        "habits": [
          "4b53ffaf-83f8-4442-a901-dd5f2286abfc"
        ],
        "dailys": [
          "ca90a11a-932b-40be-84b9-4e96ff96a585"
        ],
        "todos": [
          "c79db5ff-0baa-4dfe-9f1d-d06a62b1b3b6",
          "17d20b40-4f8d-4b1b-941a-0c1837278f26",
          "e22776cb-66f3-4e3e-9dfd-964ace0c352e",
          "ea442ec3-8731-4f6d-b542-ba54474fdb1c"
        ],
        "rewards": [
          "18891583-4e61-43e1-b450-1a13c973d666"
        ]
      },
      "official": false,
      "memberCount": 67,
      "prize": 4,
      "_id": "e84ddde8-6156-40da-8786-0d37df712405",
      "name": "Finish Something: 2-Week Power-Through!",
      "summary": "Find the motivation to finally finish that thing in the next two weeks!! Starts January 28th!",
      "description": "Do you have something - maybe a project, a book, an assignment, or some other goal - that you've been sitting on? Are you close to finishing it, but not quite there, and can't ever quite find the time to just get it done? Join this challenge for some extra motivation to finally FINISH YOUR THING!\n\n**This challenge will last two weeks** - it starts on 1/28/23 and will close on 2/10/23 (or probably the following morning, for time zone fairness). Remember to be reasonable about what you can expect to finish in this time.\n\nThe winner will be randomly chosen from among those who FINISH THEIR THING!!! Other tasks don't directly factor into winning, but should hopefully help you finish the thing!",
      "categories": [
        {
          "_id": "63d1db279a88017fc1b48a33",
          "slug": "academics",
          "name": "academics"
        },
        {
          "_id": "63d1db279a88018950b48a34",
          "slug": "creativity",
          "name": "creativity"
        },
        {
          "_id": "63d1db279a8801f3f1b48a35",
          "slug": "getting_organized",
          "name": "getting_organized"
        },
        {
          "_id": "63d1db279a88018557b48a36",
          "slug": "self_improvement",
          "name": "self_improvement"
        },
        {
          "_id": "63d1db279a8801053fb48a37",
          "slug": "time_management",
          "name": "time_management"
        },
        {
          "_id": "63d1db279a880162beb48a38",
          "slug": "hobbies_occupations",
          "name": "hobbies_occupations"
        },
        {
          "_id": "63d1db279a8801e486b48a39",
          "slug": "mental_health",
          "name": "mental_health"
        },
        {
          "_id": "63d1db279a880159b8b48a3a",
          "slug": "health_fitness",
          "name": "health_fitness"
        },
        {
          "_id": "63d1db279a8801f3dbb48a3b",
          "slug": "finance",
          "name": "finance"
        }
      ],
      "group": {
        "privacy": "public",
        "_id": "00000000-0000-4000-A000-000000000000",
        "leader": "7bde7864-ebc5-4ee2-a4b7-1070d464cdb0",
        "name": "Tavern",
        "type": "guild",
        "categories": [],
        "summary": "Tavern",
        "id": "00000000-0000-4000-A000-000000000000"
      },
      "leader": {
        "auth": {
          "local": {
            "username": "AnariTekir27"
          }
        },
        "flags": {
          "verifiedUsername": true
        },
        "profile": {
          "name": "Anari"
        },
        "_id": "c7fd07f2-7878-47a3-a760-677ab10a5937",
        "id": "c7fd07f2-7878-47a3-a760-677ab10a5937"
      },
      "shortName": "Finish Something 2W",
      "createdAt": "2023-01-26T01:45:11.465Z",
      "updatedAt": "2023-01-26T16:50:30.072Z",
      "id": "e84ddde8-6156-40da-8786-0d37df712405"
    },
    {
      "tasksOrder": {
        "habits": [
          "4aa90366-54b5-4434-b394-24447f0e4c4f"
        ],
        "dailys": [
          "85a0231a-dfeb-4eef-88f1-ea8be90aafcd",
          "d6567635-498e-4814-934f-6317a20b4977"
        ],
        "todos": [
          "3484213d-e644-4ad1-8a55-59468efbf7e8",
          "ca2522e1-b7ab-45ad-96ed-b8045f375733",
          "23eb21f5-8988-4b89-b5b3-67ce5fc6cd05",
          "af38cc4d-78ae-4268-9eae-9b61a641e77c",
          "d3f1b2ae-e557-4742-b281-b541f72fa0e2",
          "10b123d1-cefe-4de5-afbb-92da619f1fa8",
          "76d5eb90-2efc-4cbf-a47c-1038729f3f69",
          "997e6629-f206-417a-a287-46141f190e38",
          "84a712a9-bf50-4d60-b25a-40eeac2bae9b",
          "6e183be1-0afb-422a-9c25-6b78aa60629a",
          "1ca59744-6d30-4525-83fb-036aff9d0814",
          "18afb82e-1f76-48aa-a7ac-a805f29acf18"
        ],
        "rewards": []
      },
      "official": false,
      "memberCount": 47,
      "prize": 10,
      "_id": "e602ed06-443e-4297-bb64-496275bdb251",
      "name": "12 Tasks in 12 Months Challenge: Official 2023 Edition",
      "summary": " Sequel to the 12 Tasks in 12 Months: 2022 Edition - but every challenge is an entry point!\n\nThis course is connected to the [365 Days Guild](https://habitica.com/groups/guild/64c827f8-9d04-408f-8513-0fc88ed34e4c).",
      "description": "This challenge is a series of 12 month-long challenges meant to encourage you to be more intentional with your life and habits over the next year. \n\nThe theme of 2023 is video game creation! The tasks for the month are loosely connected to the stages of game development, in order to get you to step outside your comfort zone and have a goal for how you want to live this month. As long as you are sticking to the theme or spirit of the task this month, it's okay if you substitute an example task with one more suitable to you or your lifestyle.\n\nThe prize will be randomly given to someone who has completed all of the tasks. If you want to know how others are doing in this challenge or check out the other challenges, visit the 400 Days / 365 Tasks Guild: https://habitica.com/groups/guild/64c827f8-9d04-408f-8513-0fc88ed34e4c",
      "categories": [
        {
          "_id": "63d1bde4aa2275e6a56f3f2d",
          "slug": "mental_health",
          "name": "mental_health"
        },
        {
          "_id": "63d1bde4aa227582526f3f2e",
          "slug": "self_improvement",
          "name": "self_improvement"
        },
        {
          "_id": "63d1bde4aa227553266f3f2f",
          "slug": "time_management",
          "name": "time_management"
        }
      ],
      "group": {
        "privacy": "public",
        "_id": "00000000-0000-4000-A000-000000000000",
        "leader": "7bde7864-ebc5-4ee2-a4b7-1070d464cdb0",
        "name": "Tavern",
        "type": "guild",
        "categories": [],
        "summary": "Tavern",
        "id": "00000000-0000-4000-A000-000000000000"
      },
      "leader": {
        "auth": {
          "local": {
            "username": "GaseousTalons"
          }
        },
        "flags": {
          "verifiedUsername": true
        },
        "profile": {
          "name": "Talons"
        },
        "_id": "bf1c6720-fcca-47b3-9a83-c718aaa32f23",
        "id": "bf1c6720-fcca-47b3-9a83-c718aaa32f23"
      },
      "shortName": "12 Months",
      "createdAt": "2023-01-25T23:40:20.503Z",
      "updatedAt": "2023-01-26T16:44:05.812Z",
      "id": "e602ed06-443e-4297-bb64-496275bdb251"
    },
    {
      "tasksOrder": {
        "habits": [],
        "dailys": [],
        "todos": [
          "06e9e813-1a30-49ce-bb61-4484fc0c8244",
          "855e0aa6-b21f-49e4-805d-039482811deb",
          "9d6b3cb8-1d37-4dca-b60c-d9cb5093fe1e",
          "72fa230a-18bc-49c7-bb3f-16ba659991f9",
          "2fad643d-409b-4924-9029-8a7737e6403b",
          "3b74a6e4-7166-4115-be75-7e66544f8b9a"
        ],
        "rewards": []
      },
      "official": false,
      "memberCount": 23,
      "prize": 1,
      "_id": "26867aeb-1483-4505-becc-4ba6fb2cb7ac",
      "name": "Daily Focus Finder 27th February",
      "summary": "Daily Focus Finder",
      "description": "## ***Have you got tasks you should be doing today?***\n## ***Are you lacking motivation or organisation today?!***\n## ***Look no further! The Daily Focus Finder Challenge is here to help!***\n\n## ※※※ ✅✅✅✅✅ ※※※ \n\n## **What Do I Do?**\n\n### You need to have at least 3 tasks in each to-do, but more than that is fine.\n\n## **How Do I Win?**\n\n### The winner is chosen by RNG out of the people who have completed both their Must Dos and Should Dos. I manually check to see that people have completed the To-Dos and will block people caught cheating to prevent them winning future challenges!\n\n*Special thanks to @Squeaky, @kippikoo, @mmha, @Kaylee Sea, @LaMama Fox, a secret sponsor, @khing blue, @seizazen and @Dewines who have all donated gems for the DFF challenges! :) And to @SuperSaraA for temporarily taking over the challenges when I was busy with exams!*\n\n![Conquerors of Betterment Logo](https://cdn.discordapp.com/attachments/845609540421812224/868880248844976168/cob_logo_discord_small.png)\n",
      "categories": [
        {
          "_id": "63d025df249ab6a57fcf7ffd",
          "slug": "self_improvement",
          "name": "self_improvement"
        },
        {
          "_id": "63d025df249ab63e0acf7ffe",
          "slug": "getting_organized",
          "name": "getting_organized"
        },
        {
          "_id": "63d025df249ab6502bcf7fff",
          "slug": "time_management",
          "name": "time_management"
        }
      ],
      "group": {
        "privacy": "public",
        "_id": "00000000-0000-4000-A000-000000000000",
        "leader": "7bde7864-ebc5-4ee2-a4b7-1070d464cdb0",
        "name": "Tavern",
        "type": "guild",
        "categories": [],
        "summary": "Tavern",
        "id": "00000000-0000-4000-A000-000000000000"
      },
      "leader": {
        "auth": {
          "local": {
            "username": "blakejones99"
          }
        },
        "contributor": {
          "admin": false,
          "contributions": "[creative permissions received 27-Mar-2020]\n1. Helpfully answering questions!\n2. Excellent Challenge-running\n3. Continued helpful presence.",
          "level": 3,
          "text": "Socialite, Challenger"
        },
        "flags": {
          "verifiedUsername": true
        },
        "profile": {
          "name": "Blake! (he/him) 💔 #Silenced"
        },
        "_id": "c21096c3-d133-46ea-9642-bf940c9c43f6",
        "id": "c21096c3-d133-46ea-9642-bf940c9c43f6"
      },
      "shortName": "DFF 27th",
      "createdAt": "2023-01-24T18:39:27.415Z",
      "updatedAt": "2023-01-26T15:36:48.823Z",
      "id": "26867aeb-1483-4505-becc-4ba6fb2cb7ac"
    },
    {
      "tasksOrder": {
        "habits": [],
        "dailys": [],
        "todos": [
          "b315affa-a5a9-4913-af14-d83910137ffa",
          "7465136f-c6a9-4128-8d7a-6b3b2f2af184",
          "697655d3-1ebd-4e7b-b027-322aa0245c1c",
          "ec4fe6a9-b916-41a5-bfa7-0aa24c0bb037",
          "77ced949-6873-490f-8c8f-41417e5114e5",
          "b24012e6-01c9-404d-b40a-f0b8dfdbd2ab"
        ],
        "rewards": []
      },
      "official": false,
      "memberCount": 11,
      "prize": 1,
      "_id": "2af1b6f9-1cba-4133-abc5-69405ddd698c",
      "name": "Daily Focus Finder 28th February",
      "summary": "Daily Focus Finder",
      "description": "## ***Have you got tasks you should be doing today?***\n## ***Are you lacking motivation or organisation today?!***\n## ***Look no further! The Daily Focus Finder Challenge is here to help!***\n\n## ※※※ ✅✅✅✅✅ ※※※ \n\n## **What Do I Do?**\n\n### You need to have at least 3 tasks in each to-do, but more than that is fine.\n\n## **How Do I Win?**\n\n### The winner is chosen by RNG out of the people who have completed both their Must Dos and Should Dos. I manually check to see that people have completed the To-Dos and will block people caught cheating to prevent them winning future challenges!\n\n*Special thanks to @Squeaky, @kippikoo, @mmha, @Kaylee Sea, @LaMama Fox, a secret sponsor, @khing blue, @seizazen and @Dewines who have all donated gems for the DFF challenges! :) And to @SuperSaraA for temporarily taking over the challenges when I was busy with exams!*\n\n![Conquerors of Betterment Logo](https://cdn.discordapp.com/attachments/845609540421812224/868880248844976168/cob_logo_discord_small.png)\n",
      "categories": [
        {
          "_id": "63d025ce7a138b3124a44aaf",
          "slug": "self_improvement",
          "name": "self_improvement"
        },
        {
          "_id": "63d025ce7a138b1562a44ab0",
          "slug": "getting_organized",
          "name": "getting_organized"
        },
        {
          "_id": "63d025ce7a138b7374a44ab1",
          "slug": "time_management",
          "name": "time_management"
        }
      ],
      "group": {
        "privacy": "public",
        "_id": "00000000-0000-4000-A000-000000000000",
        "leader": "7bde7864-ebc5-4ee2-a4b7-1070d464cdb0",
        "name": "Tavern",
        "type": "guild",
        "categories": [],
        "summary": "Tavern",
        "id": "00000000-0000-4000-A000-000000000000"
      },
      "leader": {
        "auth": {
          "local": {
            "username": "blakejones99"
          }
        },
        "contributor": {
          "admin": false,
          "contributions": "[creative permissions received 27-Mar-2020]\n1. Helpfully answering questions!\n2. Excellent Challenge-running\n3. Continued helpful presence.",
          "level": 3,
          "text": "Socialite, Challenger"
        },
        "flags": {
          "verifiedUsername": true
        },
        "profile": {
          "name": "Blake! (he/him) 💔 #Silenced"
        },
        "_id": "c21096c3-d133-46ea-9642-bf940c9c43f6",
        "id": "c21096c3-d133-46ea-9642-bf940c9c43f6"
      },
      "shortName": "DFF 28th",
      "createdAt": "2023-01-24T18:39:10.695Z",
      "updatedAt": "2023-01-26T15:14:42.942Z",
      "id": "2af1b6f9-1cba-4133-abc5-69405ddd698c"
    },
    {
      "tasksOrder": {
        "habits": [],
        "dailys": [],
        "todos": [
          "b082e933-f8f9-4659-a908-28f44aa39c49",
          "d1d28ad9-1ed3-4871-8694-8b45ef86324b",
          "96511ef7-0ce9-4973-abee-91344a4100ce",
          "6ef17a67-d73d-4e4f-9631-16407160913e",
          "f400a7cb-7fc6-4dbe-b1cf-708d137f955f",
          "b8c50d31-35d3-4f75-aecf-d80d74aa06e4"
        ],
        "rewards": []
      },
      "official": false,
      "memberCount": 7,
      "prize": 1,
      "_id": "5a7217e1-d8a7-4db9-ad9b-57c3ba898489",
      "name": "Daily Focus Finder 26th February",
      "summary": "Daily Focus Finder",
      "description": "## ***Have you got tasks you should be doing today?***\n## ***Are you lacking motivation or organisation today?!***\n## ***Look no further! The Daily Focus Finder Challenge is here to help!***\n\n## ※※※ ✅✅✅✅✅ ※※※ \n\n## **What Do I Do?**\n\n### You need to have at least 3 tasks in each to-do, but more than that is fine.\n\n## **How Do I Win?**\n\n### The winner is chosen by RNG out of the people who have completed both their Must Dos and Should Dos. I manually check to see that people have completed the To-Dos and will block people caught cheating to prevent them winning future challenges!\n\n*Special thanks to @Squeaky, @kippikoo, @mmha, @Kaylee Sea, @LaMama Fox, a secret sponsor, @khing blue, @seizazen and @Dewines who have all donated gems for the DFF challenges! :) And to @SuperSaraA for temporarily taking over the challenges when I was busy with exams!*\n\n![Conquerors of Betterment Logo](https://cdn.discordapp.com/attachments/845609540421812224/868880248844976168/cob_logo_discord_small.png)\n",
      "categories": [
        {
          "_id": "63d025bb534ec041b475f161",
          "slug": "self_improvement",
          "name": "self_improvement"
        },
        {
          "_id": "63d025bb534ec0321575f162",
          "slug": "getting_organized",
          "name": "getting_organized"
        },
        {
          "_id": "63d025bb534ec038b675f163",
          "slug": "time_management",
          "name": "time_management"
        }
      ],
      "group": {
        "privacy": "public",
        "_id": "00000000-0000-4000-A000-000000000000",
        "leader": "7bde7864-ebc5-4ee2-a4b7-1070d464cdb0",
        "name": "Tavern",
        "type": "guild",
        "categories": [],
        "summary": "Tavern",
        "id": "00000000-0000-4000-A000-000000000000"
      },
      "leader": {
        "auth": {
          "local": {
            "username": "blakejones99"
          }
        },
        "contributor": {
          "admin": false,
          "contributions": "[creative permissions received 27-Mar-2020]\n1. Helpfully answering questions!\n2. Excellent Challenge-running\n3. Continued helpful presence.",
          "level": 3,
          "text": "Socialite, Challenger"
        },
        "flags": {
          "verifiedUsername": true
        },
        "profile": {
          "name": "Blake! (he/him) 💔 #Silenced"
        },
        "_id": "c21096c3-d133-46ea-9642-bf940c9c43f6",
        "id": "c21096c3-d133-46ea-9642-bf940c9c43f6"
      },
      "shortName": "DFF 26th",
      "createdAt": "2023-01-24T18:38:51.745Z",
      "updatedAt": "2023-01-26T15:14:30.690Z",
      "id": "5a7217e1-d8a7-4db9-ad9b-57c3ba898489"
    },
    {
      "tasksOrder": {
        "habits": [],
        "dailys": [],
        "todos": [
          "f81952bb-55f0-4e2a-9cdd-2066723abda1",
          "f6f07c80-25da-4ecd-b1dc-194812c9973b",
          "c3e45f3a-6290-4113-a972-3eaa2be4a785",
          "bf4060da-adad-4dc7-9515-d972aa6aa41b",
          "6b4f2083-a708-4870-aa00-5ac198485676",
          "ce13509e-2b85-4be7-a703-12a5652e0759"
        ],
        "rewards": []
      },
      "official": false,
      "memberCount": 9,
      "prize": 1,
      "_id": "de0a55c9-ac3a-4fd6-b5ff-ef3500c17d1f",
      "name": "Daily Focus Finder 25th February",
      "summary": "Daily Focus Finder",
      "description": "## ***Have you got tasks you should be doing today?***\n## ***Are you lacking motivation or organisation today?!***\n## ***Look no further! The Daily Focus Finder Challenge is here to help!***\n\n## ※※※ ✅✅✅✅✅ ※※※ \n\n## **What Do I Do?**\n\n### You need to have at least 3 tasks in each to-do, but more than that is fine.\n\n## **How Do I Win?**\n\n### The winner is chosen by RNG out of the people who have completed both their Must Dos and Should Dos. I manually check to see that people have completed the To-Dos and will block people caught cheating to prevent them winning future challenges!\n\n*Special thanks to @Squeaky, @kippikoo, @mmha, @Kaylee Sea, @LaMama Fox, a secret sponsor, @khing blue, @seizazen and @Dewines who have all donated gems for the DFF challenges! :) And to @SuperSaraA for temporarily taking over the challenges when I was busy with exams!*\n\n![Conquerors of Betterment Logo](https://cdn.discordapp.com/attachments/845609540421812224/868880248844976168/cob_logo_discord_small.png)\n",
      "categories": [
        {
          "_id": "63d0257f6027ed384d81e6c8",
          "slug": "self_improvement",
          "name": "self_improvement"
        },
        {
          "_id": "63d0257f6027ed4ae081e6c9",
          "slug": "getting_organized",
          "name": "getting_organized"
        },
        {
          "_id": "63d0257f6027ed721481e6ca",
          "slug": "time_management",
          "name": "time_management"
        }
      ],
      "group": {
        "privacy": "public",
        "_id": "00000000-0000-4000-A000-000000000000",
        "leader": "7bde7864-ebc5-4ee2-a4b7-1070d464cdb0",
        "name": "Tavern",
        "type": "guild",
        "categories": [],
        "summary": "Tavern",
        "id": "00000000-0000-4000-A000-000000000000"
      },
      "leader": {
        "auth": {
          "local": {
            "username": "blakejones99"
          }
        },
        "contributor": {
          "admin": false,
          "contributions": "[creative permissions received 27-Mar-2020]\n1. Helpfully answering questions!\n2. Excellent Challenge-running\n3. Continued helpful presence.",
          "level": 3,
          "text": "Socialite, Challenger"
        },
        "flags": {
          "verifiedUsername": true
        },
        "profile": {
          "name": "Blake! (he/him) 💔 #Silenced"
        },
        "_id": "c21096c3-d133-46ea-9642-bf940c9c43f6",
        "id": "c21096c3-d133-46ea-9642-bf940c9c43f6"
      },
      "shortName": "DFF 25th",
      "createdAt": "2023-01-24T18:37:51.344Z",
      "updatedAt": "2023-01-26T15:14:38.024Z",
      "id": "de0a55c9-ac3a-4fd6-b5ff-ef3500c17d1f"
    },
    {
      "tasksOrder": {
        "habits": [],
        "dailys": [],
        "todos": [
          "dd8fda58-2473-4788-b6e2-c249777799f6",
          "39fa669c-4c4f-484d-85e1-cef14da6579a",
          "8f307fa4-06ec-482a-afce-9c5226b24b05",
          "8701980a-fd00-45b4-a1ed-45761eac39db",
          "0ac25f77-196c-4ff2-b41e-8bb9fb2d0cea",
          "5a8c4918-a6e9-44d6-bc89-b0cc932124da"
        ],
        "rewards": []
      },
      "official": false,
      "memberCount": 5,
      "prize": 1,
      "_id": "d99f8b00-b71d-4cf5-a139-f03dff76a989",
      "name": "Daily Focus Finder 24th February",
      "summary": "Daily Focus Finder",
      "description": "## ***Have you got tasks you should be doing today?***\n## ***Are you lacking motivation or organisation today?!***\n## ***Look no further! The Daily Focus Finder Challenge is here to help!***\n\n## ※※※ ✅✅✅✅✅ ※※※ \n\n## **What Do I Do?**\n\n### You need to have at least 3 tasks in each to-do, but more than that is fine.\n\n## **How Do I Win?**\n\n### The winner is chosen by RNG out of the people who have completed both their Must Dos and Should Dos. I manually check to see that people have completed the To-Dos and will block people caught cheating to prevent them winning future challenges!\n\n*Special thanks to @Squeaky, @kippikoo, @mmha, @Kaylee Sea, @LaMama Fox, a secret sponsor, @khing blue, @seizazen and @Dewines who have all donated gems for the DFF challenges! :) And to @SuperSaraA for temporarily taking over the challenges when I was busy with exams!*\n\n![Conquerors of Betterment Logo](https://cdn.discordapp.com/attachments/845609540421812224/868880248844976168/cob_logo_discord_small.png)\n",
      "categories": [
        {
          "_id": "63d0256adcefe82d734c2e7d",
          "slug": "self_improvement",
          "name": "self_improvement"
        },
        {
          "_id": "63d0256adcefe83aec4c2e7e",
          "slug": "getting_organized",
          "name": "getting_organized"
        },
        {
          "_id": "63d0256adcefe83db14c2e7f",
          "slug": "time_management",
          "name": "time_management"
        }
      ],
      "group": {
        "privacy": "public",
        "_id": "00000000-0000-4000-A000-000000000000",
        "leader": "7bde7864-ebc5-4ee2-a4b7-1070d464cdb0",
        "name": "Tavern",
        "type": "guild",
        "categories": [],
        "summary": "Tavern",
        "id": "00000000-0000-4000-A000-000000000000"
      },
      "leader": {
        "auth": {
          "local": {
            "username": "blakejones99"
          }
        },
        "contributor": {
          "admin": false,
          "contributions": "[creative permissions received 27-Mar-2020]\n1. Helpfully answering questions!\n2. Excellent Challenge-running\n3. Continued helpful presence.",
          "level": 3,
          "text": "Socialite, Challenger"
        },
        "flags": {
          "verifiedUsername": true
        },
        "profile": {
          "name": "Blake! (he/him) 💔 #Silenced"
        },
        "_id": "c21096c3-d133-46ea-9642-bf940c9c43f6",
        "id": "c21096c3-d133-46ea-9642-bf940c9c43f6"
      },
      "shortName": "DFF 24th",
      "createdAt": "2023-01-24T18:37:30.481Z",
      "updatedAt": "2023-01-26T16:02:23.807Z",
      "id": "d99f8b00-b71d-4cf5-a139-f03dff76a989"
    },
    {
      "tasksOrder": {
        "habits": [],
        "dailys": [],
        "todos": [
          "50e8ba5c-2a23-41d5-8e80-776be2352aee",
          "cb4d0888-3ce8-498b-ad76-b9a6b79f2543",
          "1a673606-0f4b-4183-a204-79ce36df2e3f",
          "cc056c59-9b0d-4d89-b0c1-cbcf8025c59f",
          "3887806d-b65f-46e6-be59-478794c9c5bb",
          "133d51e4-f803-4c0f-9fbf-69e16f1bb6d8"
        ],
        "rewards": []
      },
      "official": false,
      "memberCount": 4,
      "prize": 1,
      "_id": "a28eba02-b8a8-43dc-bbf1-ac0272a57492",
      "name": "Daily Focus Finder 23rd February",
      "summary": "Daily Focus Finder",
      "description": "## ***Have you got tasks you should be doing today?***\n## ***Are you lacking motivation or organisation today?!***\n## ***Look no further! The Daily Focus Finder Challenge is here to help!***\n\n## ※※※ ✅✅✅✅✅ ※※※ \n\n## **What Do I Do?**\n\n### You need to have at least 3 tasks in each to-do, but more than that is fine.\n\n## **How Do I Win?**\n\n### The winner is chosen by RNG out of the people who have completed both their Must Dos and Should Dos. I manually check to see that people have completed the To-Dos and will block people caught cheating to prevent them winning future challenges!\n\n*Special thanks to @Squeaky, @kippikoo, @mmha, @Kaylee Sea, @LaMama Fox, a secret sponsor, @khing blue, @seizazen and @Dewines who have all donated gems for the DFF challenges! :) And to @SuperSaraA for temporarily taking over the challenges when I was busy with exams!*\n\n![Conquerors of Betterment Logo](https://cdn.discordapp.com/attachments/845609540421812224/868880248844976168/cob_logo_discord_small.png)\n",
      "categories": [
        {
          "_id": "63d0250ad6e2358ac48c74bf",
          "slug": "self_improvement",
          "name": "self_improvement"
        },
        {
          "_id": "63d0250ad6e23550248c74c0",
          "slug": "getting_organized",
          "name": "getting_organized"
        },
        {
          "_id": "63d0250ad6e23511c88c74c1",
          "slug": "time_management",
          "name": "time_management"
        }
      ],
      "group": {
        "privacy": "public",
        "_id": "00000000-0000-4000-A000-000000000000",
        "leader": "7bde7864-ebc5-4ee2-a4b7-1070d464cdb0",
        "name": "Tavern",
        "type": "guild",
        "categories": [],
        "summary": "Tavern",
        "id": "00000000-0000-4000-A000-000000000000"
      },
      "leader": {
        "auth": {
          "local": {
            "username": "blakejones99"
          }
        },
        "contributor": {
          "admin": false,
          "contributions": "[creative permissions received 27-Mar-2020]\n1. Helpfully answering questions!\n2. Excellent Challenge-running\n3. Continued helpful presence.",
          "level": 3,
          "text": "Socialite, Challenger"
        },
        "flags": {
          "verifiedUsername": true
        },
        "profile": {
          "name": "Blake! (he/him) 💔 #Silenced"
        },
        "_id": "c21096c3-d133-46ea-9642-bf940c9c43f6",
        "id": "c21096c3-d133-46ea-9642-bf940c9c43f6"
      },
      "shortName": "DFF 23rd",
      "createdAt": "2023-01-24T18:35:54.873Z",
      "updatedAt": "2023-01-26T15:15:46.058Z",
      "id": "a28eba02-b8a8-43dc-bbf1-ac0272a57492"
    }
  ];

let copy = [...data];
  
describe('Test the challenge functions',  () => {
    it('Test case 1 - Test if two objects are equals', () => {
        assert.equal(compareObjects(copy,data),true);
    });

    it('Test case 2 - Test if the challenges list are ordered', () => {
        data = sortChallenges(data);
        assert.equal(compareObjects(copy,data),false);
    });

    it('Test case 3 - Test if two objects are equals', () => {
        assert.equal(compareObjects(copy,{}),false);
    });
    it('Test case 4 - Test if two objects are equals', () => {
        data = sortChallenges(data);
        assert.equal(compareObjects({},data),true);
    });
});