import {
  generateUser,
} from '../../../../helpers/api-integration/v2';
import { each } from 'lodash';

describe('GET /user/anonymized', () => {
  let user, anonymizedUser;

  before(async () => {
    user = await generateUser({
      'inbox.messages': {
        'the-message-id': {
          sort: 214,
          user: 'Some user',
          backer: {},
          contributor: {
            text: 'Blacksmith',
            level: 2,
            contributions: 'Made some contributions',
            admin: false,
          },
          uuid: 'some-users-uuid',
          flagCount: 0,
          flags: {},
          likes: {},
          timestamp: 1444154258699.0000000000000000,
          text: 'Lorem ipsum',
          id: 'the-messages-id',
          sent: true,
        },
      },
    });

    await user.post('/user/tasks', {
      text: 'some private text',
      notes: 'some private notes',
      checklist: [
        {text: 'a private checklist'},
        {text: 'another private checklist'},
      ],
      type: 'daily',
    });

    anonymizedUser = await user.get('/user/anonymized');
  });

  it('retains user id', async () => {
    expect(anonymizedUser._id).to.eql(user._id);
  });

  it('removes credentials and financial information', async () => {
    expect(anonymizedUser.apiToken).to.not.exist;
    expect(anonymizedUser.auth.local).to.not.exist;
    expect(anonymizedUser.auth.facebook).to.not.exist;
    expect(anonymizedUser.purchased.plan).to.not.exist;
  });

  it('removes profile information', async () => {
    expect(anonymizedUser.profile).to.not.exist;
    expect(anonymizedUser.contributor).to.not.exist;
    expect(anonymizedUser.achievements.challenges).to.not.exist;
  });

  it('removes social information', async () => {
    expect(anonymizedUser.newMessages).to.not.exist;
    expect(anonymizedUser.invitations).to.not.exist;
    expect(anonymizedUser.items.special.nyeReceived).to.not.exist;
    expect(anonymizedUser.items.special.valentineReceived).to.not.exist;

    each(anonymizedUser.inbox.messages, (msg) => {
      expect(msg.text).to.eql('inbox message text');
    });
  });

  it('anonymizes task info', async () => {
    each(['habits', 'todos', 'dailys', 'rewards'], (tasks) => {
      each(anonymizedUser[tasks], (task) => {
        expect(task.text).to.eql('task text');
        expect(task.notes).to.eql('task notes');

        each(task.checklist, (box) => {
          expect(box.text).to.match(/item\d*/);
        });
      });
    });
  });

  it('anonymizes tags', async () => {
    each(anonymizedUser.tags, (tag) => {
      expect(tag.name).to.eql('tag');
      expect(tag.challenge).to.eql('challenge');
    });
  });

  it('removes webhooks', async () => {
    expect(anonymizedUser.webhooks).to.not.exist;
  });
});
