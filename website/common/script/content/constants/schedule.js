import moment from 'moment';

function backgroundMatcher(month, oddYear) {
    return function (background) {
        const key = background.set.key;
        const keyLength = key.length;
        return parseInt(key.substring(keyLength-6, keyLength-4)) === month && parseInt(key.subtring(keyLength-2, keyLength)) % 2 === oddYear;
    }
}

function timeTravelersMatcher(month1, month2) {
    return function (item) {
        console.log(item, month1, month2)
        return item;
    }
}

export const FIRST_RELEASE_DAY = 1;
export const SECOND_RELEASE_DAY = 7;
export const THIRD_RELEASE_DAY = 14;
export const FOURTH_RELEASE_DAY = 21;

export const MONTHLY_SCHEDULE = {
    0: {
        [FIRST_RELEASE_DAY]: [
            {
                "type": "timeTravelers",
                "matcher": timeTravelersMatcher(1, 7),
            }
        ],
        [SECOND_RELEASE_DAY]: [
        ], 
        [THIRD_RELEASE_DAY]: [
        ],
        [FOURTH_RELEASE_DAY]: [
        ],
    },
    1: {
        [FIRST_RELEASE_DAY]: [
            {
                "type": "timeTravelers",
                "matcher": timeTravelersMatcher(2, 8),
            }
        ],
        [SECOND_RELEASE_DAY]: [
        ], 
        [THIRD_RELEASE_DAY]: [
        ],
        [FOURTH_RELEASE_DAY]: [
        ],
    },
    2: {
        [FIRST_RELEASE_DAY]: [
            {
                "type": "timeTravelers",
                "matcher": timeTravelersMatcher(3, 9),
            }
        ],
        [SECOND_RELEASE_DAY]: [
        ], 
        [THIRD_RELEASE_DAY]: [
        ],
        [FOURTH_RELEASE_DAY]: [
        ],
    },
    3: {
        [FIRST_RELEASE_DAY]: [
            {
                "type": "timeTravelers",
                "matcher": timeTravelersMatcher(4, 10),
            }
        ],
        [SECOND_RELEASE_DAY]: [
        ], 
        [THIRD_RELEASE_DAY]: [
        ],
        [FOURTH_RELEASE_DAY]: [
        ],
    },
    4: {
        [FIRST_RELEASE_DAY]: [
            {
                "type": "timeTravelers",
                "matcher": timeTravelersMatcher(5, 11),
            }
        ],
        [SECOND_RELEASE_DAY]: [
        ], 
        [THIRD_RELEASE_DAY]: [
        ],
        [FOURTH_RELEASE_DAY]: [
        ],
    },
    5: {
        [FIRST_RELEASE_DAY]: [
            {
                "type": "timeTravelers",
                "matcher": timeTravelersMatcher(6, 12),
            }
        ],
        [SECOND_RELEASE_DAY]: [
        ], 
        [THIRD_RELEASE_DAY]: [
        ],
        [FOURTH_RELEASE_DAY]: [
        ],
    },
    6: {
        [FIRST_RELEASE_DAY]: [
            {
                "type": "timeTravelers",
                "matcher": timeTravelersMatcher(7, 1),
            }
        ],
        [SECOND_RELEASE_DAY]: [
        ], 
        [THIRD_RELEASE_DAY]: [
        ],
        [FOURTH_RELEASE_DAY]: [
        ],
    },
    7: {
        [FIRST_RELEASE_DAY]: [
            {
                "type": "timeTravelers",
                "matcher": timeTravelersMatcher(8, 2),
            }
        ],
        [SECOND_RELEASE_DAY]: [
        ], 
        [THIRD_RELEASE_DAY]: [
        ],
        [FOURTH_RELEASE_DAY]: [
        ],
    },
    8: {
        [FIRST_RELEASE_DAY]: [
            {
                "type": "timeTravelers",
                "matcher": timeTravelersMatcher(9, 3),
            }
        ],
        [SECOND_RELEASE_DAY]: [
        ], 
        [THIRD_RELEASE_DAY]: [
        ],
        [FOURTH_RELEASE_DAY]: [
        ],
    },
    9: {
        [FIRST_RELEASE_DAY]: [
            {
                "type": "timeTravelers",
                "matcher": timeTravelersMatcher(10, 4),
            }
        ],
        [SECOND_RELEASE_DAY]: [
        ], 
        [THIRD_RELEASE_DAY]: [
        ],
        [FOURTH_RELEASE_DAY]: [
        ],
    },
    10: {
        [FIRST_RELEASE_DAY]: [
            {
                "type": "timeTravelers",
                "matcher": timeTravelersMatcher(11, 5),
            }
        ],
        [SECOND_RELEASE_DAY]: [
        ], 
        [THIRD_RELEASE_DAY]: [
        ],
        [FOURTH_RELEASE_DAY]: [
        ],
    },
    11: {
        [FIRST_RELEASE_DAY]: [
            {
                "type": "timeTravelers",
                "matcher": timeTravelersMatcher(12, 6),
            }
        ],
        [SECOND_RELEASE_DAY]: [
        ], 
        [THIRD_RELEASE_DAY]: [
        ],
        [FOURTH_RELEASE_DAY]: [
        ],
    },
};

export const GALA_SWITCHOVER_DAY = 21;
export const GALA_SCHEDULE = {
    0: [],
    1: [],
    2: [],
    3: [],
};

export function assembleScheduledMatchers(date) {
    const items = [];
    const month = date instanceof moment ? date.month() : date.getMonth();
    const todayDay = date instanceof moment ? date.date() : date.getDate();
    const previousMonth = month === 0 ? 11 : month - 1;
    for (const [day, value] of Object.entries(MONTHLY_SCHEDULE[previousMonth])) {
        if (day > todayDay) {
            items.push(...value);
        }
    }
    for (const [day, value] of Object.entries(MONTHLY_SCHEDULE[month])) {
        if (day <= todayDay) {
            items.push(...value);
        }
    }
    let galaMonth = month;
    const galaCount = Object.keys(GALA_SCHEDULE).length;
    if (todayDay >= GALA_SWITCHOVER_DAY) {
        galaMonth += 1;
    }
    items.push(...GALA_SCHEDULE[parseInt((galaCount / 12) * galaMonth)]);
    return items;
}