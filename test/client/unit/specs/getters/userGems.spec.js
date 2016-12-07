import { userGems } from 'client/store/getters';

describe('userGems getter', () => {
  it('returns the user\'s gems', () => {
    expect(userGems({
      state: {
        user: {
          balance: 4.5,
        },
      },
    })).to.equal(18);
  });
});