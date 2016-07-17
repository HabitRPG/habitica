import {
  generateUser,
} from '../../../helpers/api-integration/v2';

describe('POST /members/id/gift', () => {
  let userWithBalance, userWithoutBalance;

  beforeEach(async () => {
    userWithBalance = await generateUser({ balance: 10 });
    userWithoutBalance = await generateUser({ balance: 0 });
  });

  context('send gems from balance', () => {
    it('subtracts gems from sender\'s balance and adds it to recipient\'s balance', async () => {
      await userWithBalance.post(`/members/${userWithoutBalance._id}/gift`, {
        type: 'gems',
        gems: {
          amount: 1,
        },
      });

      await Promise.all([
        userWithoutBalance.sync(),
        userWithBalance.sync(),
      ]);

      expect(userWithBalance.balance).to.eql(9.75);
      expect(userWithoutBalance.balance).to.eql(0.25);
    });

    it('adds a message to sender\'s inbox', async () => {
      expect(userWithBalance.inbox.messages).to.be.empty;

      await userWithBalance.post(`/members/${userWithoutBalance._id}/gift`, {
        type: 'gems',
        gems: {
          amount: 1,
        },
      });

      await userWithBalance.sync();

      expect(userWithBalance.inbox.messages).to.not.be.empty;
    });

    it('adds a message to recipients\'s inbox', async () => {
      expect(userWithoutBalance.inbox.messages).to.be.empty;

      await userWithBalance.post(`/members/${userWithoutBalance._id}/gift`, {
        type: 'gems',
        gems: {
          amount: 1,
        },
      });

      await userWithoutBalance.sync();

      expect(userWithoutBalance.inbox.messages).to.not.be.empty;
    });
  });
});
