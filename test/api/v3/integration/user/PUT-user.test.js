import { each, get } from 'lodash';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { model as NewsPost } from '../../../../../website/server/models/newsPost';

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

    it('tags must be an array', async () => {
      await expect(user.put('/user', {
        tags: {
          tag: true,
        },
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'Tag list must be an array.',
      });
    });

    it('update tags', async () => {
      const userTags = user.tags;

      await user.put('/user', {
        tags: [...user.tags, {
          name: 'new tag',
        }],
      });

      await user.sync();

      expect(user.tags.length).to.be.eql(userTags.length + 1);
    });

    it('validates profile.name', async () => {
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
        message: t('invalidReqParams'),
      });

      await expect(user.put('/user', {
        'profile.name': 'this is a very long display name that will not be allowed due to length',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('displaynameIssueLength'),
      });

      await expect(user.put('/user', {
        'profile.name': 'TESTPLACEHOLDERSLURWORDHERE',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('bannedSlurUsedInProfile'),
      });

      await expect(user.put('/user', {
        'profile.name': 'TESTPLACEHOLDERSWEARWORDHERE',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('bannedWordUsedInProfile'),
      });

      await expect(user.put('/user', {
        'profile.name': 'namecontainsnewline\n',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('displaynameIssueNewline'),
      });
    });

    it('can set flags.newStuff to false', async () => {
      NewsPost.updateLastNewsPost({
        _id: '1234', publishDate: new Date(), title: 'Title', published: true,
      });

      await user.update({
        'flags.lastNewStuffRead': '123',
      });

      await user.put('/user', {
        'flags.newStuff': false,
      });

      await user.sync();

      expect(user.flags.lastNewStuffRead).to.eql('1234');
    });
  });

  context('Top Level Protected Operations', () => {
    const protectedOperations = {
      'gem balance': { balance: 100 },
      auth: { 'auth.blocked': true, 'auth.timestamps.created': new Date() },
      contributor: { 'contributor.level': 9, 'contributor.admin': true, 'contributor.text': 'some text' },
      permissions: { 'permissions.fullAccess': true, 'permissions.news': true, 'permissions.moderator': 'some text' },
      backer: { 'backer.tier': 10, 'backer.npc': 'Bilbo' },
      subscriptions: { 'purchased.plan.extraMonths': 500, 'purchased.plan.consecutive.trinkets': 1000 },
      'customization gem purchases': { 'purchased.background.tavern': true, 'purchased.skin.bear': true },
      notifications: [{ type: 123 }],
      webhooks: { webhooks: [{ url: 'https://foobar.com' }] },
      secret: { secret: { text: 'Some new text' } },
    };

    each(protectedOperations, (data, testName) => {
      it(`does not allow updating ${testName}`, async () => {
        const errorText = t('messageUserOperationProtected', { operation: Object.keys(data)[0] });

        await expect(user.put('/user', data)).to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: errorText,
        });
      });
    });
  });

  context('Sub-Level Protected Operations', () => {
    const protectedOperations = {
      'class stat': { 'stats.class': 'wizard' },
      'flags unless whitelisted': { 'flags.chatRevoked': true },
      webhooks: { 'preferences.webhooks': [1, 2, 3] },
      sleep: { 'preferences.sleep': true },
      'disable classes': { 'preferences.disableClasses': true },
      secret: { secret: { text: 'Some new text' } },
    };

    each(protectedOperations, (data, testName) => {
      it(`does not allow updating ${testName}`, async () => {
        const errorText = t('messageUserOperationProtected', { operation: Object.keys(data)[0] });

        await expect(user.put('/user', data)).to.eventually.be.rejected.and.eql({
          code: 401,
          error: 'NotAuthorized',
          message: errorText,
        });
      });
    });
  });

  context('Default Appearance Preferences', () => {
    const testCases = {
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
        const dbUpdate = {};
        dbUpdate[`purchased.${type}.${item}`] = true;
        await user.update(dbUpdate);

        // Sanity checks to make sure user is not already equipped with item
        expect(get(user.preferences, type)).to.not.eql(item);

        const updatedUser = await user.put('/user', update);

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

      const updatedUser = await user.put('/user', {
        'preferences.hair.beard': 0,
      });

      expect(updatedUser.preferences.hair.beard).to.eql(0);
    });

    it('can set mustache to default', async () => {
      await user.update({
        'purchased.hair.mustache': 2,
        'preferences.hair.mustache': 2,
      });

      const updatedUser = await user.put('/user', {
        'preferences.hair.mustache': 0,
      });

      expect(updatedUser.preferences.hair.mustache).to.eql(0);
    });
  });

  context('Purchasable Appearance Preferences', () => {
    const testCases = {
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
          message: t('mustPurchaseToSet', { val: item, key: `preferences.${type}` }),
        });
      });

      it(`updates user with ${type} user does own`, async () => {
        const dbUpdate = {};
        dbUpdate[`purchased.${type}.${item}`] = true;
        await user.update(dbUpdate);

        // Sanity check to make sure user is not already equipped with item
        expect(get(user.preferences, type)).to.not.eql(item);

        const updatedUser = await user.put('/user', update);

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
