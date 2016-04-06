import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v2';

import { each } from 'lodash';

describe('POST /user/batch-update', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  context('allowed operations', () => {
    it('makes batch operations', async () => {
      let task = (await user.get('/user/tasks'))[0];

      let updatedUser = await user.post('/user/batch-update', [
        {op: 'update', body: {'stats.hp': 30}},
        {op: 'update', body: {'profile.name': 'Samwise'}},
        {op: 'score', params: { direction: 'up', id: task.id }},
      ]);

      expect(updatedUser.stats.hp).to.eql(30);
      expect(updatedUser.profile.name).to.eql('Samwise');

      let fetchedTask = await user.get(`/user/tasks/${task.id}`);

      expect(fetchedTask.value).to.be.greaterThan(task.value);
    });
  });

  context('development only operations', () => { // These tests will fail if your NODE_ENV is set to 'development' instead of 'testing'
    let protectedOperations = {
      'Add Ten Gems': 'addTenGems',
      'Add Hourglass': 'addHourglass',
    };

    each(protectedOperations, (operation, description) => {
      it(`it sends back a 500 error for ${description} operation`, async () => {
        return expect(user.post('/user/batch-update', [
          { op: operation },
        ])).to.eventually.be.rejected.and.eql({
          code: 500,
          text: t('messageUserOperationNotFound', { operation }),
        });
      });
    });
  });

  context('unknown operations', () => {
    it('sends back a 500 error', async () => {
      return expect(user.post('/user/batch-update', [
        {op: 'aNotRealOperation'},
      ])).to.eventually.be.rejected.and.eql({
        code: 500,
        text: t('messageUserOperationNotFound', { operation: 'aNotRealOperation' }),
      });
    });
  });
});
