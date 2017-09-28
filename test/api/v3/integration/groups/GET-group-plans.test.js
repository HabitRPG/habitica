import {
  generateUser,
  generateGroup,
} from '../../../../helpers/api-v3-integration.helper';

describe('GET /group-plans', () => {
  let user;
  let groupPlan;

  before(async () => {
    user = await generateUser({balance: 4});
    groupPlan = await generateGroup(user,
      {
        name: 'public guild - is member',
        type: 'guild',
        privacy: 'public',
      },
      {
        purchased: {
          plan: {
            customerId: 'existings',
          },
        },
      });
  });

  it('returns group plans for the user', async () => {
    let groupPlans = await user.get('/group-plans');

    expect(groupPlans[0]._id).to.eql(groupPlan._id);
  });
});
