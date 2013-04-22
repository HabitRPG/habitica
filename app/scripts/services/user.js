'use strict';

var user = {
    "stats":{
        "gp":0,
        "exp":0,
        "lvl":1,
        "hp":50
    },
    "party":{
        "current":null,
        "invitation":null
    },
    "items":{
        "weapon":0,
        "armor":0,
        "head":0,
        "shield":0
    },
    "preferences":{
        "gender":"m",
        "skin":"white",
        "hair":"blond",
        "armorSet":"v1",
        "dayStart":0,
        "showHelm":true
    },
    "apiToken":"ab6f087f-d901-4627-b3f5-4f444ce9e2a3",
    "lastCron":1366497491466,
    "balance":0,
    "habits": [
        {
            "type":"habit",
            "text":"1h Productive Work",
            "notes":"-- Habits: Constantly Track --\nFor some habits, it only makes sense to *gain* points (like this one).",
            "value":0,
            "up":true,
            "down":false,
            "id":"8bce6f3f-655c-46ff-bc91-1edf7f2cd661"
        },
        {
            "type":"habit",
            "text":"Eat Junk Food",
            "notes":"For others, it only makes sense to *lose* points",
            "value":0,
            "up":false,
            "down":true,
            "id":"f35f02ed-1662-45e6-bb50-13bc1978509e"
        },
        {
            "type":"habit",
            "text":"Take The Stairs",
            "notes":"For the rest, both + and - make sense (stairs = gain, elevator = lose)",
            "value":0,
            "up":true,
            "down":true,
            "id":"875e3bdb-52ec-407b-bbff-e59813e5b81a"
        }
    ],
    "dailys": [
        {
            "type":"daily",
            "text":"1h Personal Project",
            "notes":"-- Dailies: Complete Once a Day --\nAt the end of each day, non-completed Dailies dock you points.",
            "value":0,
            "completed":false,
            "repeat":{
                "m":true,
                "t":true,
                "w":true,
                "th":true,
                "f":true,
                "s":true,
                "su":true
            },
            "id":"7fcca8fe-2f22-46dd-98b3-f8832108607b"
        },
        {
            "type":"daily",
            "text":"Exercise",
            "notes":"If you are doing well, they turn green and are less valuable (experience, gold) and less damaging (HP). This means you can ease up on them for a bit.",
            "value":3,
            "completed":false,
            "repeat":{
                "m":true,
                "t":true,
                "w":true,
                "th":true,
                "f":true,
                "s":true,
                "su":true
            },
            "id":"e5a02e0e-ee03-4e5a-9db9-c97d3aa4416d"
        },
        {
            "type":"daily",
            "text":"45m Reading",
            "notes":"But if you are doing poorly, they turn red. The worse you do, the more valuable (exp, gold) and more damaging (HP) these goals become. This encourages you to focus on your shortcomings, the reds.",
            "value":-10,
            "completed":false,
            "repeat":{
                "m":true,
                "t":true,
                "w":true,
                "th":true,
                "f":true,
                "s":true,
                "su":true
            },
            "id":"77ba6e72-b1a6-4cfb-8d2b-667df9779985"
        }
    ],
    "todos": [
        {
            "type":"todo",
            "text":"Call Mom",
            "notes":"-- Todos: Complete Eventually --\nNon-completed Todos won't hurt you, but they will become more valuable over time. This will encourage you to wrap up stale Todos.",
            "value":-3,
            "completed":false,
            "id":"3526bf2b-9e14-4bcc-b865-808e8d8d587e"
        }
    ],
    "rewards": [
        {
            "type":"reward",
            "text":"1 Episode of Game of Thrones",
            "notes":"-- Rewards: Treat Yourself! --\nAs you complete goals, you earn gold to buy rewards. Buy them liberally - rewards are integral in forming good habits.",
            "value":20,
            "id":"c979cb81-78df-4006-9da5-125453b72633"
        },
        {
            "type":"reward",
            "text":"Cake",
            "notes":"But only buy if you have enough gold - you lose HP otherwise.",
            "value":10,
            "id":"12b8f39b-9d56-479e-a479-c25fab6d5b15"
        }
    ],
    "flags":{
        "partyEnabled":false,
        "itemsEnabled":true
    },
    "auth":{
        "local": {username: "lefnire"}
    },
    "id":"5b38917d-a674-4288-ab54-a6045f4a7828"
};

angular.module('habitRPG')
  .factory('User', function () {
    // Service logic
    // ...

    // Public API here
    return {
      get: function () {
        return user;
      }
    }

  });
