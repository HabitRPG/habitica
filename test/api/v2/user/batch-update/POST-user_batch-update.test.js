import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

import { each } from 'lodash';

describe('POST /user/batch-update', () => {
  let api, user;

  beforeEach(() => {
    return generateUser().then((usr) => {
      user = usr;
      api = requester(user);
    });
  });

  context('allowed operations', () => {
    it('makes batch operations', () => {
      let task;

      return api.get('/user/tasks').then((tasks) => {
        task = tasks[0];
        return api.post('/user/batch-update', [
          {op: 'update', body: {'stats.hp': 30}},
          {op: 'update', body: {'profile.name': 'Samwise'}},
          {op: 'score', params: { direction: 'up', id: task.id }},
        ]);
      }).then((user) => {
        expect(user.stats.hp).to.eql(30);
        expect(user.profile.name).to.eql('Samwise');
        return api.get(`/user/tasks/${task.id}`);
      }).then((task) => {
        expect(task.value).to.be.greaterThan(0);
      });
    });
  });

  context('development only operations', () => {
    let protectedOperations = {
      'Add Ten Gems': 'addTenGems',
      'Add Hourglass': 'addHourglass',
    };

    each(protectedOperations, (operation, description) => {

      it(`it sends back a 500 error for ${description} operation`, () => {
        return expect(api.post('/user/batch-update', [
          {op: operation},
        ])).to.eventually.be.rejected.and.eql({
            code: 500,
            text: t('messageUserOperationNotFound', { operation: operation}),
          });
      });
    });
  });

  context('unknown operations', () => {
    it('sends back a 500 error', () => {
      return expect(api.post('/user/batch-update', [
        {op: 'aNotRealOperation'},
      ])).to.eventually.be.rejected.and.eql({
          code: 500,
          text: t('messageUserOperationNotFound', { operation: 'aNotRealOperation' }),
        });
    });
  });
});
