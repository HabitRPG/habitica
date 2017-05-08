import { gems as userGems } from 'client/store/getters/user';

describe('userGems getter', () => {
  it('returns the user\'s gems', () => {
    expect(userGems({
      state: {
        user: {
          data: {balance: 4.5},
        },
      },
    })).to.equal(18);
  });
});