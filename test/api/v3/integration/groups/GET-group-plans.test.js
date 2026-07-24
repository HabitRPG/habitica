import {
  createAndPopulateGroup,
} from '../../../../helpers/api-integration/v3';

describe('GET /group-plans', () => {
  let user;
  let groupPlan;

  before(async () => {
    ({ group: groupPlan, groupLeader: user } = await createAndPopulateGroup({
      groupDetails: {
        name: 'group plan - is member',
        type: 'guild',
        privacy: 'private',
      },
      upgradeToGroupPlan: true,
      leaderDetails: { balance: 4 },
    }));
  });

  it('returns group plans for the user', async () => {
    const groupPlans = await user.get('/group-plans');

    expect(groupPlans[0]._id).to.eql(groupPlan._id);
  });
});
