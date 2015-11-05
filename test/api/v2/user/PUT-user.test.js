import {
  generateUser,
  requester,
  translate as t,
} from '../../../helpers/api-integration.helper';

import { each } from 'lodash';

describe('PUT /user', () => {
  let api, user;

  beforeEach(() => {
    return generateUser().then((usr) => {
      user = usr;
      api = requester(user);
    });
  });

  context('allowed operations', () => {
    it('updates the user', () => {
      return api.put('/user', {
        'profile.name' : 'Frodo',
        'preferences.costume': true,
        'stats.hp': 14,
      }).then((updatedUser) => {
        expect(updatedUser.profile.name).to.eql('Frodo');
        expect(updatedUser.preferences.costume).to.eql(true);
        expect(updatedUser.stats.hp).to.eql(14);
      });
    });
  });

  context('top level protected operations', () => {
    let protectedOperations = {
      'gem balance': {balance: 100},
      'auth': {'auth.blocked': true, 'auth.timestamps.created': new Date()},
      'contributor': {'contributor.level': 9, 'contributor.admin': true, 'contributor.text': 'some text'},
      'backer': {'backer.tier': 10, 'backer.npc': 'Bilbo'},
      'subscriptions': {'purchased.plan.extraMonths': 500, 'purchased.plan.consecutive.trinkets': 1000},
      'customization gem purchases': {'purchased.background.tavern': true, 'purchased.skin.bear': true},
      'tasks': {todos: [], habits: [], dailys: [], rewards: []},
    };

    each(protectedOperations, (data, testName) => {
      it(`does not allow updating ${testName}`, () => {
        let errorText = [];
        each(data, (value, operation) => {
          errorText.push(t('messageUserOperationProtected', { operation: operation }));
        });
        return expect(api.put('/user', data)).to.eventually.be.rejected.and.eql({
          code: 401,
          text: errorText,
        });
      });
    });
  });

  context('sub-level protected operations', () => {
    let protectedOperations = {
      'class stat': {'stats.class': 'wizard'},
    };

    each(protectedOperations, (data, testName) => {
      it(`does not allow updating ${testName}`, () => {
        let errorText = [];
        each(data, (value, operation) => {
          errorText.push(t('messageUserOperationProtected', { operation: operation }));
        });
        return expect(api.put('/user', data)).to.eventually.be.rejected.and.eql({
          code: 401,
          text: errorText,
        });
      });
    });
  });
});
