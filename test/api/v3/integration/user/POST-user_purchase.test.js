import {
  generateUser,
  createAndPopulateGroup,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/purchase/:type/:key', () => {
  let user;
  let type = 'hatchingPotions';
  let key = 'Base';

  beforeEach(async () => {
    user = await generateUser({
      balance: 40,
    });
  });

  // More tests in common code unit tests

  it('returns an error when key is not provided', async () => {
    await expect(user.post('/user/purchase/gems/gem'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('mustSubscribeToPurchaseGems'),
      });
  });

  it('purchases a gem item', async () => {
    await user.post(`/user/purchase/${type}/${key}`);
    await user.sync();

    expect(user.items[type][key]).to.equal(1);
  });

  it('can convert gold to gems if subscribed', async () => {
    let oldBalance = user.balance;
    await user.update({
      'purchased.plan.customerId': 'group-plan',
      'stats.gp': 1000,
    });
    await user.post('/user/purchase/gems/gem');
    await user.sync();
    expect(user.balance).to.equal(oldBalance + 0.25);
  });

  it('leader can convert gold to gems even if the group plan prevents it', async () => {
    let { group, groupLeader } = await createAndPopulateGroup({
      groupDetails: {
        name: 'test',
        type: 'guild',
        privacy: 'private',
      },
    });
    await group.update({
      'leaderOnly.getGems': true,
      'purchased.plan.customerId': 123,
    });
    await groupLeader.sync();
    let oldBalance = groupLeader.balance;

    await groupLeader.update({
      'purchased.plan.customerId': 'group-plan',
      'stats.gp': 1000,
    });
    await groupLeader.post('/user/purchase/gems/gem');

    await groupLeader.sync();
    expect(groupLeader.balance).to.equal(oldBalance + 0.25);
  });

  it('cannot convert gold to gems if the group plan prevents it', async () => {
    let { group, members } = await createAndPopulateGroup({
      groupDetails: {
        name: 'test',
        type: 'guild',
        privacy: 'private',
      },
      members: 1,
    });
    await group.update({
      'leaderOnly.getGems': true,
      'purchased.plan.customerId': 123,
    });
    let oldBalance = members[0].balance;

    await members[0].update({
      'purchased.plan.customerId': 'group-plan',
      'stats.gp': 1000,
    });
    await expect(members[0].post('/user/purchase/gems/gem'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('groupPolicyCannotGetGems'),
      });

    await members[0].sync();
    expect(members[0].balance).to.equal(oldBalance);
  });

  describe('bulk purchasing', () => {
    it('purchases a gem item', async () => {
      await user.post(`/user/purchase/${type}/${key}`, {quantity: 2});
      await user.sync();

      expect(user.items[type][key]).to.equal(2);
    });

    it('can convert gold to gems if subscribed', async () => {
      let oldBalance = user.balance;
      await user.update({
        'purchased.plan.customerId': 'group-plan',
        'stats.gp': 1000,
      });
      await user.post('/user/purchase/gems/gem', {quantity: 2});
      await user.sync();
      expect(user.balance).to.equal(oldBalance + 0.50);
    });
  });
});
