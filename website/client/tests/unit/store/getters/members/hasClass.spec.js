import { hasClass } from '@/store/getters/members';

describe('hasClass getter', () => {
  it('returns false if level < 10', () => {
    const member = {
      stats: {
        lvl: 5,
      },
      preferences: {
        disableClasses: false,
      },
      flags: {
        classSelected: true,
      },
    };
    expect(hasClass()(member)).to.equal(false);
  });

  it('returns false if member has disabled classes', () => {
    const member = {
      stats: {
        lvl: 10,
      },
      preferences: {
        disableClasses: true,
      },
      flags: {
        classSelected: true,
      },
    };
    expect(hasClass()(member)).to.equal(false);
  });

  it('returns false if member has not yet selected a class', () => {
    const member = {
      stats: {
        lvl: 10,
      },
      preferences: {
        disableClasses: false,
      },
      flags: {
        classSelected: false,
      },
    };
    expect(hasClass()(member)).to.equal(false);
  });

  it('returns true when all conditions are met', () => {
    const member = {
      stats: {
        lvl: 10,
      },
      preferences: {
        disableClasses: false,
      },
      flags: {
        classSelected: true,
      },
    };
    expect(hasClass()(member)).to.equal(true);
  });
});
