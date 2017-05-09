import moment from 'moment';
import {
  generateUser,
} from '../../../../helpers/api-integration/v3';

describe('POST /tasks/age-dailies', () => {
  let user, daily;

  beforeEach(async () => {
    user = await generateUser({
      'stats.gp': 100,
    });

    daily = await user.post('/tasks/user', {
      text: 'test daily',
      type: 'daily',
      startDate: moment(new Date()).subtract({days: 1}),
    });


    await user.update({
      yesterDailies: [daily._id],
    });
  });


  it('ages all dailies in the yesterDailies array', async () => {
    await user.sync();
    let hpBefore = user.stats.hp;
    expect(user.yesterDailies.length).to.eql(1);

    await user.post('/tasks/age-dailies');
    await user.sync();

    expect(user.yesterDailies.length).to.eql(0);
    expect(user.stats.hp).to.be.lessThan(hpBefore);
  });
});
