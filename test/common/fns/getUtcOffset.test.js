import getUtcOffset from '../../../website/common/script/fns/getUtcOffset';

describe('getUtcOffset', () => {
  let user;

  beforeEach(() => {
    user = { preferences: {} };
  });

  it('returns 0 when user.timezoneOffset is not set', () => {
    expect(getUtcOffset(user)).to.equal(0);
  });

  it('returns 0 when user.timezoneOffset is zero', () => {
    user.preferences.timezoneOffset = 0;

    expect(getUtcOffset(user)).to.equal(0);
  });

  it('returns the opposite of user.timezoneOffset', () => {
    user.preferences.timezoneOffset = -10;

    expect(getUtcOffset(user)).to.eql(10);
  });
});
