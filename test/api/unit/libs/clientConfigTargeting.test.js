import {
  coerceConditionValue,
  compileSegment,
  getSegmentUserFields,
  isValidCondition,
} from '../../../../website/server/libs/clientConfigTargeting';

describe('clientConfigTargeting', () => {
  const user = {
    _id: 'user-id',
    auth: { timestamps: { created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } },
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
          { attribute: 'accountAgeDays', operator: 'lt', value: 7 },
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
          { attribute: 'staff', operator: 'eq', value: true },
        ],
      });
      expect(test(user)).to.be.false;
    });

    it('never matches invalid conditions', () => {
      const test = compileSegment({
        _id: 'segment',
        conditions: [{ attribute: 'apiToken', operator: 'eq', value: 'x' }],
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
