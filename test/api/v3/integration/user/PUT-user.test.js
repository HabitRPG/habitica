import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

import { each, get } from 'lodash';

describe('PUT /user', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  context('Allowed Operations', () => {
    it('updates the user', async () => {
      await user.put('/user', {
        'profile.name': 'Frodo',
        'preferences.costume': true,
        'stats.hp': 14,
      });

      await user.sync();

      expect(user.profile.name).to.eql('Frodo');
      expect(user.preferences.costume).to.eql(true);
      expect(user.stats.hp).to.eql(14);
    });

    it('profile.name cannot be an empty string or null', async () => {
      await expect(user.put('/user', {
        'profile.name': ' ', // string should be trimmed
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'User validation failed',
      });

      await expect(user.put('/user', {
        'profile.name': '',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'User validation failed',
      });

      await expect(user.put('/user', {
        'profile.name': null,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'User validation failed',
      });
    });
  });

  context('Top Level Protected Operations', () => {
    let protectedOperations = {
      'gem balance': {balance: 100},
      auth: {'auth.blocked': true, 'auth.timestamps.created': new Date()},
      contributor: {'contributor.level': 9, 'contributor.admin': true, 'contributor.text': 'some text'},
      backer: {'backer.tier': 10, 'backer.npc': 'Bilbo'},
      subscriptions: {'purchased.plan.extraMonths': 500, 'purchased.plan.consecutive.trinkets': 1000},
      'customization gem purchases': {'purchased.background.tavern': true, 'purchased.skin.bear': true},
      notifications: [{type: 123}],
      webhooks: {webhooks: [{url: 'https://foobar.com'}]},
    };

    each(protectedOperations, (data, testName) => {
      it(`does not allow updating ${testName}`, async () => {
        let errorText = t('messageUserOperationProtected', { operation: Object.keys(data)[0] });

        await expect(user.put('/user', data)).to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: errorText,
        });
      });
    });
  });

  context('Sub-Level Protected Operations', () => {
    let protectedOperations = {
      'class stat': {'stats.class': 'wizard'},
      'flags unless whitelisted': {'flags.dropsEnabled': true},
      webhooks: {'preferences.webhooks': [1, 2, 3]},
      sleep: {'preferences.sleep': true},
      'disable classes': {'preferences.disableClasses': true},
    };

    each(protectedOperations, (data, testName) => {
      it(`does not allow updating ${testName}`, async () => {
        let errorText = t('messageUserOperationProtected', { operation: Object.keys(data)[0] });

        await expect(user.put('/user', data)).to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: errorText,
        });
      });
    });
  });

  context('Default Appearance Preferences', () => {
    let testCases = {
      shirt: 'yellow',
      skin: 'ddc994',
      'hair.color': 'blond',
      'hair.bangs': 2,
      'hair.base': 1,
      'hair.flower': 4,
      size: 'broad',
    };

    each(testCases, (item, type) => {
      const update = {};
      update[`preferences.${type}`] = item;

      it(`updates user with ${type} that is a default`, async () => {
        let dbUpdate = {};
        dbUpdate[`purchased.${type}.${item}`] = true;
        await user.update(dbUpdate);

        // Sanity checks to make sure user is not already equipped with item
        expect(get(user.preferences, type)).to.not.eql(item);

        let updatedUser = await user.put('/user', update);

        expect(get(updatedUser.preferences, type)).to.eql(item);
      });
    });

    it('returns an error if user tries to update body size with invalid type', async () => {
      await expect(user.put('/user', {
        'preferences.size': 'round',
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('mustPurchaseToSet', { val: 'round', key: 'preferences.size' }),
      });
    });

    it('can set beard to default', async () => {
      await user.update({
        'purchased.hair.beard': 3,
        'preferences.hair.beard': 3,
      });

      let updatedUser = await user.put('/user', {
        'preferences.hair.beard': 0,
      });

      expect(updatedUser.preferences.hair.beard).to.eql(0);
    });

    it('can set mustache to default', async () => {
      await user.update({
        'purchased.hair.mustache': 2,
        'preferences.hair.mustache': 2,
      });

      let updatedUser = await user.put('/user', {
        'preferences.hair.mustache': 0,
      });

      expect(updatedUser.preferences.hair.mustache).to.eql(0);
    });
  });

  context('Purchasable Appearance Preferences', () => {
    let testCases = {
      background: 'volcano',
      shirt: 'convict',
      skin: 'cactus',
      'hair.base': 7,
      'hair.beard': 2,
      'hair.color': 'rainbow',
      'hair.mustache': 2,
    };

    each(testCases, (item, type) => {
      const update = {};
      update[`preferences.${type}`] = item;

      it(`returns an error if user tries to update ${type} with ${type} the user does not own`, async () => {
        await expect(user.put('/user', update)).to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: t('mustPurchaseToSet', {val: item, key: `preferences.${type}`}),
        });
      });

      it(`updates user with ${type} user does own`, async () => {
        let dbUpdate = {};
        dbUpdate[`purchased.${type}.${item}`] = true;
        await user.update(dbUpdate);

        // Sanity check to make sure user is not already equipped with item
        expect(get(user.preferences, type)).to.not.eql(item);

        let updatedUser = await user.put('/user', update);

        expect(get(updatedUser.preferences, type)).to.eql(item);
      });
    });
  });

  context('Improvement Categories', () => {
    it('sets valid categories', async () => {
      await user.put('/user', {
        'preferences.improvementCategories': ['work', 'school'],
      });

      await user.sync();

      expect(user.preferences.improvementCategories).to.eql(['work', 'school']);
    });

    it('discards invalid categories', async () => {
      await expect(user.put('/user', {
        'preferences.improvementCategories': ['work', 'procrastination', 'school'],
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'User validation failed',
      });
    });
  });
});
