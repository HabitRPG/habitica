import {
  generateUser,
} from '../helpers/common.helper';

import timeTravelers from '../../website/common/script/content/time-travelers';

describe('time-travelers store', () => {
  let user;
  beforeEach(() => {
    user = generateUser();
  });

  it('removes owned sets from the time travelers store', () => {
    user.items.gear.owned.head_mystery_201602 = true; // eslint-disable-line camelcase
    expect(timeTravelers.timeTravelerStore(user)['201602']).to.not.exist;
    expect(timeTravelers.timeTravelerStore(user)['201603']).to.exist;
  });

  it('removes unopened mystery item sets from the time travelers store', () => {
    user.purchased = {
      plan: {
        mysteryItems: ['head_mystery_201602'],
      },
    };
    expect(timeTravelers.timeTravelerStore(user)['201602']).to.not.exist;
    expect(timeTravelers.timeTravelerStore(user)['201603']).to.exist;
  });
});
