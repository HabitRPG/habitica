/* eslint-disable camelcase */
import {
  startOfWeek,
} from '../../common/script/cron';

let expect = require('expect.js'); // eslint-disable-line no-shadow
let moment = require('moment');
let shared = require('../../common/script/index.js');

shared.i18n.translations = require('../../website/src/libs/i18n.js').translations;

let repeatWithoutLastWeekday = () => { // eslint-disable-line no-unused-vars
  let repeat = {
    su: true,
    m: true,
    t: true,
    w: true,
    th: true,
    f: true,
    s: true,
  };

  if (startOfWeek(moment().zone(0)).isoWeekday() === 1) {
    repeat.su = false;
  } else {
    repeat.s = false;
  }
  return {
    repeat,
  };
};


/* Helper Functions */

import {
  generateUser,
} from '../helpers/common.helper';

let cron = (usr, missedDays = 1) => {
  usr.lastCron = moment().subtract(missedDays, 'days');
  usr.fns.cron();
};

describe('daily/weekly that repeats everyday (default)', () => {
  let user = null;
  let daily = null;
  let weekly = null;

  describe('when startDate is in the future', () => {
    beforeEach(() => {
      user = generateUser();
      user.dailys = [
        shared.taskDefaults({
          type: 'daily',
          startDate: moment().add(7, 'days'),
          frequency: 'daily',
        }), shared.taskDefaults({
          type: 'daily',
          startDate: moment().add(7, 'days'),
          frequency: 'weekly',
          repeat: {
            su: true,
            m: true,
            t: true,
            w: true,
            th: true,
            f: true,
            s: true,
          },
        }),
      ];
      daily = user.dailys[0];
      weekly = user.dailys[1];
    });

    it('does not damage user for not completing it', () => {
      cron(user);
      expect(user.stats.hp).to.be(50);
    });

    it('does not change value on cron if daily is incomplete', () => {
      cron(user);
      expect(daily.value).to.be(0);
      expect(weekly.value).to.be(0);
    });

    it('does not reset checklists if daily is not marked as complete', () => {
      let checklist = [
        {
          text: '1',
          id: 'checklist-one',
          completed: true,
        }, {
          text: '2',
          id: 'checklist-two',
          completed: true,
        }, {
          text: '3',
          id: 'checklist-three',
          completed: false,
        },
      ];

      daily.checklist = checklist;
      weekly.checklist = checklist;
      cron(user);
      expect(daily.checklist[0].completed).to.be(true);
      expect(daily.checklist[1].completed).to.be(true);
      expect(daily.checklist[2].completed).to.be(false);
      expect(weekly.checklist[0].completed).to.be(true);
      expect(weekly.checklist[1].completed).to.be(true);
      expect(weekly.checklist[2].completed).to.be(false);
    });

    it('resets checklists if daily is marked as complete', () => {
      let checklist = [
        {
          text: '1',
          id: 'checklist-one',
          completed: true,
        }, {
          text: '2',
          id: 'checklist-two',
          completed: true,
        }, {
          text: '3',
          id: 'checklist-three',
          completed: false,
        },
      ];

      daily.checklist = checklist;
      weekly.checklist = checklist;
      daily.completed = true;
      weekly.completed = true;
      cron(user);
      _.each(daily.checklist, (box) => {
        expect(box.completed).to.be(false);
      });
      _.each(weekly.checklist, (box) => {
        expect(box.completed).to.be(false);
      });
    });

    it('is due on startDate', () => {
      let daily_due_today = shared.shouldDo(moment(), daily);
      let daily_due_on_start_date = shared.shouldDo(moment().add(7, 'days'), daily);

      expect(daily_due_today).to.be(false);
      expect(daily_due_on_start_date).to.be(true);

      let weekly_due_today = shared.shouldDo(moment(), weekly);
      let weekly_due_on_start_date = shared.shouldDo(moment().add(7, 'days'), weekly);

      expect(weekly_due_today).to.be(false);
      expect(weekly_due_on_start_date).to.be(true);
    });
  });

  describe('when startDate is in the past', () => {
    beforeEach(() => {
      user = generateUser();
      user.dailys = [
        shared.taskDefaults({
          type: 'daily',
          startDate: moment().subtract(7, 'days'),
          frequency: 'daily',
        }), shared.taskDefaults({
          type: 'daily',
          startDate: moment().subtract(7, 'days'),
          frequency: 'weekly',
        }),
      ];
      daily = user.dailys[0];
      weekly = user.dailys[1];
    });

    it('does damage user for not completing it', () => {
      cron(user);
      expect(user.stats.hp).to.be.lessThan(50);
    });

    it('decreases value on cron if daily is incomplete', () => {
      cron(user, 1);
      expect(daily.value).to.be(-1);
      expect(weekly.value).to.be(-1);
    });

    it('decreases value on cron once only if daily is incomplete and multiple days are missed', () => {
      cron(user, 7);
      expect(daily.value).to.be(-1);
      expect(weekly.value).to.be(-1);
    });

    it('resets checklists if daily is not marked as complete', () => {
      let checklist;

      checklist = [
        {
          text: '1',
          id: 'checklist-one',
          completed: true,
        }, {
          text: '2',
          id: 'checklist-two',
          completed: true,
        }, {
          text: '3',
          id: 'checklist-three',
          completed: false,
        },
      ];
      daily.checklist = checklist;
      weekly.checklist = checklist;
      cron(user);
      _.each(daily.checklist, (box) => {
        expect(box.completed).to.be(false);
      });
      _.each(weekly.checklist, (box) => {
        expect(box.completed).to.be(false);
      });
    });

    it('resets checklists if daily is marked as complete', () => {
      let checklist = [
        {
          text: '1',
          id: 'checklist-one',
          completed: true,
        }, {
          text: '2',
          id: 'checklist-two',
          completed: true,
        }, {
          text: '3',
          id: 'checklist-three',
          completed: false,
        },
      ];

      daily.checklist = checklist;
      daily.completed = true;
      weekly.checklist = checklist;
      weekly.completed = true;
      cron(user);
      _.each(daily.checklist, (box) => {
        expect(box.completed).to.be(false);
      });
      _.each(weekly.checklist, (box) => {
        expect(box.completed).to.be(false);
      });
    });
  });

  describe('when startDate is today', () => {
    beforeEach(() => {
      user = generateUser();
      user.dailys = [
        shared.taskDefaults({
          type: 'daily',
          startDate: moment().subtract(1, 'days'),
          frequency: 'daily',
        }), shared.taskDefaults({
          type: 'daily',
          startDate: moment().subtract(1, 'days'),
          frequency: 'weekly',
        }),
      ];
      daily = user.dailys[0];
      weekly = user.dailys[1];
    });

    it('does damage user for not completing it', () => {
      cron(user);
      expect(user.stats.hp).to.be.lessThan(50);
    });

    it('decreases value on cron if daily is incomplete', () => {
      cron(user);
      expect(daily.value).to.be.lessThan(0);
      expect(weekly.value).to.be.lessThan(0);
    });

    it('resets checklists if daily is not marked as complete', () => {
      let checklist;

      checklist = [
        {
          text: '1',
          id: 'checklist-one',
          completed: true,
        }, {
          text: '2',
          id: 'checklist-two',
          completed: true,
        }, {
          text: '3',
          id: 'checklist-three',
          completed: false,
        },
      ];
      daily.checklist = checklist;
      weekly.checklist = checklist;
      cron(user);
      _.each(daily.checklist, (box) => {
        expect(box.completed).to.be(false);
      });
      _.each(weekly.checklist, (box) => {
        expect(box.completed).to.be(false);
      });
    });

    it('resets checklists if daily is marked as complete', () => {
      let checklist;

      checklist = [
        {
          text: '1',
          id: 'checklist-one',
          completed: true,
        }, {
          text: '2',
          id: 'checklist-two',
          completed: true,
        }, {
          text: '3',
          id: 'checklist-three',
          completed: false,
        },
      ];
      daily.checklist = checklist;
      daily.completed = true;
      weekly.checklist = checklist;
      weekly.completed = true;
      cron(user);
      _.each(daily.checklist, (box) => {
        expect(box.completed).to.be(false);
      });
      _.each(weekly.checklist, (box) => {
        expect(box.completed).to.be(false);
      });
    });
  });
});

describe('daily that repeats every x days', () => {
  let user = null;
  let daily = null;

  beforeEach(() => {
    user = generateUser();
    user.dailys = [
      shared.taskDefaults({
        type: 'daily',
        startDate: moment(),
        frequency: 'daily',
      }),
    ];
    daily = user.dailys[0];
  });
  _.times(11, (due) => {
    it(`where x equals ${due}`, () => {
      daily.everyX = due;
      _.times(30, (day) => {
        let isDue;

        isDue = shared.shouldDo(moment().add(day, 'days'), daily);
        if (day % due === 0) {
          expect(isDue).to.be(true);
        }
        if (day % due !== 0) {
          expect(isDue).to.be(false);
        }
      });
    });
  });
});

describe('daily that repeats every X days when multiple days are missed', () => {
  let everyX = 3;
  let startDateDaysAgo = everyX * 3;
  let user = null;
  let daily = null;

  describe('including missing a due date', () => {
    let missedDays = everyX * 2 + 1;

    beforeEach(() => {
      user = generateUser();
      user.dailys = [
        shared.taskDefaults({
          type: 'daily',
          startDate: moment().subtract(startDateDaysAgo, 'days'),
          frequency: 'daily',
          everyX,
        }),
      ];
      daily = user.dailys[0];
    });

    it('decreases value on cron once only if daily is incomplete', () => {
      cron(user, missedDays);
      expect(daily.value).to.be(-1);
    });

    it('resets checklists if daily is incomplete', () => {
      let checklist = [
        {
          text: '1',
          id: 'checklist-one',
          completed: true,
        },
      ];

      daily.checklist = checklist;
      cron(user, missedDays);
      _.each(daily.checklist, (box) => {
        expect(box.completed).to.be(false);
      });
    });

    it('resets checklists if daily is marked as complete', () => {
      let checklist;

      checklist = [
        {
          text: '1',
          id: 'checklist-one',
          completed: true,
        },
      ];
      daily.checklist = checklist;
      daily.completed = true;
      cron(user, missedDays);
      _.each(daily.checklist, (box) => {
        expect(box.completed).to.be(false);
      });
    });
  });

  describe('but not missing a due date', () => {
    let missedDays;

    missedDays = everyX - 1;
    beforeEach(() => {
      user = generateUser();
      user.dailys = [
        shared.taskDefaults({
          type: 'daily',
          startDate: moment().subtract(startDateDaysAgo, 'days'),
          frequency: 'daily',
          everyX,
        }),
      ];
      daily = user.dailys[0];
    });

    it('does not decrease value on cron', () => {
      cron(user, missedDays);
      expect(daily.value).to.be(0);
    });

    it('does not reset checklists if daily is incomplete', () => {
      let checklist;

      checklist = [
        {
          text: '1',
          id: 'checklist-one',
          completed: true,
        },
      ];
      daily.checklist = checklist;
      cron(user, missedDays);
      _.each(daily.checklist, (box) => {
        expect(box.completed).to.be(true);
      });
    });

    it('resets checklists if daily is marked as complete', () => {
      let checklist;

      checklist = [
        {
          text: 1,
          id: 'checklist-one',
          completed: true,
        },
      ];
      daily.checklist = checklist;
      daily.completed = true;
      cron(user, missedDays);
      _.each(daily.checklist, (box) => {
        expect(box.completed).to.be(false);
      });
    });
  });
});
