import { describe, expect, test } from 'vitest';
import {
  data, gems, buffs, preferences, tasksOrder,
} from '@/store/getters/user';

describe('user getters', () => {
  describe('data', () => {
    test('returns the user\'s data', () => {
      expect(data({
        state: {
          user: {
            data: {
              lvl: 1,
            },
          },
        },
      }).lvl).to.equal(1);
    });
  });

  describe('gems', () => {
    test('returns the user\'s gems', () => {
      expect(gems({
        state: {
          user: {
            data: { balance: 4.5 },
          },
        },
      })).to.equal(18);
    });
  });

  describe('buffs', () => {
    test('returns the user\'s buffs', () => {
      expect(buffs({
        state: {
          user: {
            data: {
              stats: {
                buffs: [1],
              },
            },
          },
        },
      })(0)).to.equal(1);
    });
  });

  describe('preferences', () => {
    test('returns the user\'s preferences', () => {
      expect(preferences({
        state: {
          user: {
            data: {
              preferences: 1,
            },
          },
        },
      })).to.equal(1);
    });
  });

  describe('tasksOrder', () => {
    test('returns the user\'s tasksOrder', () => {
      expect(tasksOrder({
        state: {
          user: {
            tasksOrder: {
              masters: 1,
            },
          },
        },
      })('master')).to.equal(1);

      expect(tasksOrder()).to.not.equal('null');
      expect(tasksOrder()).to.not.equal('undefined');
    });
  });
});
