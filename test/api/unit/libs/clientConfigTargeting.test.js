import {
  coerceConditionValue,
  compileSegment,
  getSegmentUserFields,
  isValidCondition,
} from '../../../../website/server/libs/clientConfigTargeting';

describe('clientConfigTargeting', () => {
  const user = {
    _id: 'user-id',
    auth: { local: { username: 'tester' } },
    loginIncentives: 3,
    stats: { lvl: 15 },
    preferences: { language: 'de' },
    purchased: { plan: { customerId: 'customer' } },
    party: {},
    permissions: {},
  };

  describe('coerceConditionValue', () => {
    it('coerces values to the attribute type', () => {
      expect(coerceConditionValue('level', 'gte', '10')).to.equal(10);
      expect(coerceConditionValue('level', 'gte', 'abc')).to.be.undefined;
      expect(coerceConditionValue('subscriber', 'eq', 'true')).to.equal(true);
      expect(coerceConditionValue('language', 'in', 'de, en,')).to.eql(['de', 'en']);
      expect(coerceConditionValue('unknown', 'eq', 'x')).to.be.undefined;
    });

    it('does not turn blank number values into 0', () => {
      // Number('') and Number(null) are 0, which would match almost every user
      expect(coerceConditionValue('level', 'gte', '')).to.be.undefined;
      expect(coerceConditionValue('level', 'gte', null)).to.be.undefined;
      expect(coerceConditionValue('level', 'gte', undefined)).to.be.undefined;
      expect(coerceConditionValue('level', 'gte', '0')).to.equal(0);
    });

    it('drops blank entries from lists', () => {
      expect(coerceConditionValue('language', 'in', ' , ')).to.eql([]);
      expect(coerceConditionValue('language', 'nin', ['de', ' ', 1])).to.eql(['de', '1']);
    });
  });

  describe('isValidCondition', () => {
    it('only accepts known attributes and operators for their type', () => {
      expect(isValidCondition({ attribute: 'level', operator: 'gte', value: 10 })).to.be.true;
      expect(isValidCondition({ attribute: 'level', operator: 'in', value: [10] })).to.be.false;
      expect(isValidCondition({ attribute: 'level', operator: 'gte', value: '10' })).to.be.false;
      expect(isValidCondition({ attribute: 'apiToken', operator: 'eq', value: 'x' })).to.be.false;
    });
  });

  describe('compileSegment', () => {
    it('matches when all conditions match', () => {
      const test = compileSegment({
        _id: 'segment',
        conditions: [
          { attribute: 'level', operator: 'gte', value: 10 },
          { attribute: 'loginIncentives', operator: 'lt', value: 7 },
          { attribute: 'username', operator: 'contains', value: 'test' },
          { attribute: 'language', operator: 'in', value: ['de', 'fr'] },
          { attribute: 'subscriber', operator: 'eq', value: true },
          { attribute: 'inParty', operator: 'eq', value: false },
        ],
      });
      expect(test(user)).to.be.true;
    });

    it('does not match when a condition fails', () => {
      const test = compileSegment({
        _id: 'segment',
        conditions: [
          { attribute: 'level', operator: 'gte', value: 10 },
          { attribute: 'inParty', operator: 'eq', value: true },
        ],
      });
      expect(test(user)).to.be.false;
    });

    it('does not throw for contains on a missing value', () => {
      const test = compileSegment({
        _id: 'segment',
        conditions: [{ attribute: 'language', operator: 'contains', value: 'de' }],
      });
      expect(test({ _id: 'user-id' })).to.be.false;
    });

    it('matches non-subscribers with "subscriber eq false"', () => {
      const test = compileSegment({
        _id: 'segment',
        conditions: [{ attribute: 'subscriber', operator: 'eq', value: false }],
      });
      expect(test({ ...user, purchased: { plan: {} } })).to.be.true;
      expect(test({ ...user, purchased: { plan: { customerId: 'c', dateTerminated: new Date(0) } } })).to.be.true;
      expect(test(user)).to.be.false;
    });

    it('does not throw when the user has no purchased field', () => {
      const test = compileSegment({
        _id: 'segment',
        conditions: [{ attribute: 'subscriber', operator: 'eq', value: false }],
      });
      expect(test({ _id: 'user-id' })).to.be.true;
    });

    it('treats a missing value as not in the list', () => {
      const test = compileSegment({
        _id: 'segment',
        conditions: [{ attribute: 'language', operator: 'nin', value: ['de'] }],
      });
      expect(test({ _id: 'user-id' })).to.be.true;
    });

    it('matches every user when it has no conditions', () => {
      expect(compileSegment({ _id: 'segment', conditions: [] })({ _id: 'user-id' })).to.be.true;
    });

    it('never matches invalid conditions', () => {
      const test = compileSegment({
        _id: 'segment',
        conditions: [{ attribute: 'apiToken', operator: 'eq', value: 'x' }],
      });
      expect(test(user)).to.be.false;
    });

    it('never matches a condition whose value has the wrong type', () => {
      const test = compileSegment({
        _id: 'segment',
        conditions: [{ attribute: 'level', operator: 'gte', value: '10' }],
      });
      expect(test(user)).to.be.false;
    });
  });

  describe('getSegmentUserFields', () => {
    it('returns the fields needed by the conditions', () => {
      expect(getSegmentUserFields({
        conditions: [{ attribute: 'level' }, { attribute: 'subscriber' }],
      })).to.eql(['_id', 'stats.lvl', 'purchased.plan']);
    });
  });
});
