import {
  generateUser,
  generateHabit,
  generateDaily,
  generateReward,
} from '../../../../helpers/api-integration/v3';
import common from '../../../../../website/common';
import { v4 as generateUUID } from 'uuid';

describe('GET /user/anonymized', () => {
  let user;
  let endpoint = '/user/anonymized';

  before(async () => {
    user = await generateUser();
    await user.update({
      newMessages: ['some', 'new', 'messages'],
      'profile.name': 'profile',
      'purchased.plan': 'purchased plan',
      contributor: 'contributor',
      invitations: 'invitations',
      'items.special.nyeReceived': 'some',
      'items.special.valentineReceived': 'some',
      webhooks: [{url: 'https://somurl.com'}],
      'achievements.challenges': 'some',
      'inbox.messages': [{ text: 'some text' }],
      tags: [{ name: 'some name', challenge: 'some challenge' }],
    });

    await generateHabit({ userId: user._id });
    await generateHabit({ userId: user._id, text: generateUUID() });
    let daily = await generateDaily({ userId: user._id, checklist: [{ completed: false, text: 'this-text' }] });
    expect(daily.checklist[0].text.substr(0, 5)).to.not.eql('item ');
    await generateReward({ userId: user._id, text: 'some text 4' });

    expect(user.newMessages).to.exist;
    expect(user.profile).to.exist;
    expect(user.purchased.plan).to.exist;
    expect(user.contributor).to.exist;
    expect(user.invitations).to.exist;
    expect(user.items.special.nyeReceived).to.exist;
    expect(user.items.special.valentineReceived).to.exist;
    expect(user.webhooks).to.exist;
    expect(user.achievements.challenges).to.exist;
    expect(user.inbox.messages[0].text).to.exist;
    expect(user.inbox.messages[0].text).to.not.eql('inbox message text');
    expect(user.tags[0].name).to.exist;
    expect(user.tags[0].name).to.not.eql('tag');
    expect(user.tags[0].challenge).to.not.eql('challenge');
  });

  it('returns the authenticated user', async () => {
    let returnedUser = await user.get(endpoint);
    returnedUser = returnedUser.user;
    expect(returnedUser._id).to.equal(user._id);
  });

  it('does not return private paths (and apiToken)', async () => {
    let returnedUser = await user.get(endpoint);
    let tasks2 = returnedUser.tasks;
    returnedUser = returnedUser.user;
    expect(returnedUser.auth.local).to.not.exist;
    expect(returnedUser.apiToken).to.not.exist;
    expect(returnedUser.stats.maxHealth).to.eql(common.maxHealth);
    expect(returnedUser.stats.toNextLevel).to.eql(common.tnl(user.stats.lvl));
    expect(returnedUser.stats.maxMP).to.eql(30); // TODO why 30?
    expect(returnedUser.newMessages).to.not.exist;
    expect(returnedUser.profile).to.not.exist;
    expect(returnedUser.purchased.plan).to.not.exist;
    expect(returnedUser.contributor).to.not.exist;
    expect(returnedUser.invitations).to.not.exist;
    expect(returnedUser.items.special.nyeReceived).to.not.exist;
    expect(returnedUser.items.special.valentineReceived).to.not.exist;
    expect(returnedUser.webhooks).to.not.exist;
    expect(returnedUser.achievements.challenges).to.not.exist;
    _.forEach(returnedUser.inbox.messages, (msg) => {
      expect(msg.text).to.eql('inbox message text');
    });
    _.forEach(returnedUser.tags, (tag) => {
      expect(tag.name).to.eql('tag');
      expect(tag.challenge).to.eql('challenge');
    });
    // tasks
    expect(tasks2).to.exist;
    expect(tasks2.length).to.eql(5);
    expect(tasks2[0].checklist).to.exist;
    _.forEach(tasks2, (task) => {
      expect(task.text).to.eql('task text');
      expect(task.notes).to.eql('task notes');
      if (task.checklist) {
        _.forEach(task.checklist, (c) => {
          expect(c.text.substr(0, 5)).to.eql('item ');
        });
      }
    });
  });
});
