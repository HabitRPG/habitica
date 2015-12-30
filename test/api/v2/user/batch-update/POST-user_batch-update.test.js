import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

import { each } from 'lodash';

describe('POST /user/batch-update', () => {
  let user;

  beforeEach(() => {
    return generateUser().then((usr) => {
      user = usr;
    });
  });

  context('allowed operations', () => {
    it('makes batch operations', () => {
      let task;

      return user.get('/user/tasks').then((tasks) => {
        task = tasks[0];

        return user.post('/user/batch-update', [
          {op: 'update', body: {'stats.hp': 30}},
          {op: 'update', body: {'profile.name': 'Samwise'}},
          {op: 'score', params: { direction: 'up', id: task.id }},
        ]);
      }).then((updatedUser) => {
        expect(updatedUser.stats.hp).to.eql(30);
        expect(updatedUser.profile.name).to.eql('Samwise');

        return user.get(`/user/tasks/${task.id}`);
      }).then((task) => {
        expect(task.value).to.be.greaterThan(0);
      });
    });
  });

  context('development only operations', () => { // These tests will fail if your NODE_ENV is set to 'development' instead of 'testing'
    let protectedOperations = {
      'Add Ten Gems': 'addTenGems',
      'Add Hourglass': 'addHourglass',
    };

    each(protectedOperations, (operation, description) => {

      it(`it sends back a 500 error for ${description} operation`, () => {
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
    it('sends back a 500 error', () => {
      return expect(user.post('/user/batch-update', [
        {op: 'aNotRealOperation'},
      ])).to.eventually.be.rejected.and.eql({
          code: 500,
          text: t('messageUserOperationNotFound', { operation: 'aNotRealOperation' }),
        });
    });
  });
});
