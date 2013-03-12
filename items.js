exports.items = {
    weapon: [
        {
            index: 0,
            text: "Training Sword",
            classes: "weapon_0",
            notes: 'Training weapon.',
            strength: 0,
            value: 0
        }, {
            index: 1,
            text: "Sword",
            classes: 'weapon_1',
            notes: 'Increases experience gain by 3%.',
            strength: 3,
            value: 20
        }, {
            index: 2,
            text: "Axe",
            classes: 'weapon_2',
            notes: 'Increases experience gain by 6%.',
            strength: 6,
            value: 30
        }, {
            index: 3,
            text: "Morningstar",
            classes: 'weapon_3',
            notes: 'Increases experience gain by 9%.',
            strength: 9,
            value: 45
        }, {
            index: 4,
            text: "Blue Sword",
            classes: 'weapon_4',
            notes: 'Increases experience gain by 12%.',
            strength: 12,
            value: 65
        }, {
            index: 5,
            text: "Red Sword",
            classes: 'weapon_5',
            notes: 'Increases experience gain by 15%.',
            strength: 15,
            value: 90
        }, {
            index: 6,
            text: "Golden Sword",
            classes: 'weapon_6',
            notes: 'Increases experience gain by 18%.',
            strength: 18,
            value: 120
        }
    ],
    armor: [
        {
            index: 0,
            text: "Cloth Armor",
            classes: 'armor_0',
            notes: 'Training armor.',
            defense: 0,
            value: 0
        }, {
            index: 1,
            text: "Leather Armor",
            classes: 'armor_1',
            notes: 'Decreases HP loss by 4%.',
            defense: 4,
            value: 30
        }, {
            index: 2,
            text: "Chain Mail",
            classes: 'armor_2',
            notes: 'Decreases HP loss by 6%.',
            defense: 6,
            value: 45
        }, {
            index: 3,
            text: "Plate Mail",
            classes: 'armor_3',
            notes: 'Decreases HP loss by 7%.',
            defense: 7,
            value: 65
        }, {
            index: 4,
            text: "Red Armor",
            classes: 'armor_4',
            notes: 'Decreases HP loss by 8%.',
            defense: 8,
            value: 90
        }, {
            index: 5,
            text: "Golden Armor",
            classes: 'armor_5',
            notes: 'Decreases HP loss by 10%.',
            defense: 10,
            value: 120
        }
    ],
    head: [
        {
            index: 0,
            text: "No Helm",
            classes: 'head_0',
            notes: 'Training helm.',
            defense: 0,
            value: 0
        }, {
            index: 1,
            text: "Leather Helm",
            classes: 'head_1',
            notes: 'Decreases HP loss by 2%.',
            defense: 2,
            value: 15
        }, {
            index: 2,
            text: "Chain Coif",
            classes: 'head_2',
            notes: 'Decreases HP loss by 3%.',
            defense: 3,
            value: 25
        }, {
            index: 3,
            text: "Plate Helm",
            classes: 'head_3',
            notes: 'Decreases HP loss by 4%.',
            defense: 4,
            value: 45
        }, {
            index: 4,
            text: "Red Helm",
            classes: 'head_4',
            notes: 'Decreases HP loss by 5%.',
            defense: 5,
            value: 60
        }, {
            index: 5,
            text: "Golden Helm",
            classes: 'head_5',
            notes: 'Decreases HP loss by 6%.',
            defense: 6,
            value: 80
        }
    ],
    shield: [
        {
            index: 0,
            text: "No Shield",
            classes: 'shield_0',
            notes: 'No Shield.',
            defense: 0,
            value: 0
        }, {
            index: 1,
            text: "Wooden Shield",
            classes: 'shield_1',
            notes: 'Decreases HP loss by 3%',
            defense: 3,
            value: 20
        }, {
            index: 2,
            text: "Buckler",
            classes: 'shield_2',
            notes: 'Decreases HP loss by 4%.',
            defense: 4,
            value: 35
        }, {
            index: 3,
            text: "Enforced Shield",
            classes: 'shield_3',
            notes: 'Decreases HP loss by 5%.',
            defense: 5,
            value: 55
        }, {
            index: 4,
            text: "Red Shield",
            classes: 'shield_4',
            notes: 'Decreases HP loss by 7%.',
            defense: 7,
            value: 70
        }, {
            index: 5,
            text: "Golden Shield",
            classes: 'shield_5',
            notes: 'Decreases HP loss by 8%.',
            defense: 8,
            value: 90
        }
    ],
    potion: {
        type: 'potion',
        text: "Potion",
        notes: "Recover 15 HP",
        value: 25,
        classes: 'potion'
    },
    reroll: {
        type: 'reroll',
        text: "Re-Roll",
        classes: 'reroll',
        notes: "Resets your tasks. When you're struggling and everything's red, use for a clean slate.",
        value: 0
    },
    pets: [
        {
            index: 0,
            text: 'Bear Cub',
            name: 'bearcub',
            icon: 'Pet-BearCub-Base.png',
            value: 3
        }, {
            index: 1,
            text: 'Cactus',
            name: 'cactus',
            icon: 'Pet-Cactus-Base.png',
            value: 3
        }, {
            index: 2,
            text: 'Drake',
            name: 'dragon',
            icon: 'Pet-Dragon-Base.png',
            value: 3
        }, {
            index: 3,
            text: 'Flying Pig',
            name: 'flyingpig',
            icon: 'Pet-FlyingPig-Base.png',
            value: 3
        }, {
            index: 4,
            text: 'Fox',
            name: 'fox',
            icon: 'Pet-Fox-Base.png',
            value: 3
        }, {
            index: 5,
            text: 'Lion Cub',
            name: 'lioncub',
            icon: 'Pet-LionCub-Base.png',
            value: 3
        }, {
            index: 6,
            text: 'Panda Cub',
            name: 'pandacub',
            icon: 'Pet-PandaCub-Base.png',
            value: 3
        }, {
            index: 7,
            text: 'Tiger Cub',
            name: 'tigercub',
            icon: 'Pet-TigerCub-Base.png',
            value: 3
        }, {
            index: 8,
            text: 'Desert Wolf',
            name: 'wolfDesert',
            icon: 'Pet-Wolf-Desert.png',
            value: 3
        }, {
            index: 9,
            text: 'Golden Wolf',
            name: 'wolfGolden',
            icon: 'Pet-Wolf-Golden.png',
            value: 3
        }, {
            index: 10,
            text: 'Red Wolf',
            name: 'wolfRed',
            icon: 'Pet-Wolf-Red.png',
            value: 3
        }, {
            index: 11,
            text: 'Shade Wolf',
            name: 'wolfShade',
            icon: 'Pet-Wolf-Shade.png',
            value: 3
        }, {
            index: 12,
            text: 'Skeleton Wolf',
            name: 'wolfSkeleton',
            icon: 'Pet-Wolf-Skeleton.png',
            value: 3
        }, {
            index: 13,
            text: 'Veteran Wolf',
            name: 'wolfVeteran',
            icon: 'Pet-Wolf-Veteran.png',
            value: 3
        }, {
            index: 14,
            text: 'White Wolf',
            name: 'wolfWhite',
            icon: 'Pet-Wolf-White.png',
            value: 3
        }, {
            index: 15,
            text: 'Zombie Wolf',
            name: 'wolfZombie',
            icon: 'Pet-Wolf-Zombie.png',
            value: 3
        }, {
            index: 16,
            text: 'Wolf',
            name: 'wolfBorder',
            icon: 'wolf_border.png',
            value: 3
        }
    ]
};