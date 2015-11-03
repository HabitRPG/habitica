import {
  generateUser,
  requester,
} from '../../../../helpers/api-integration.helper';
import { each } from 'lodash';

describe('GET /user/anonymized', () => {
  let api, user;

  before(() => {
    return generateUser({
      'inbox.messages' : {
        'the-message-id' : {
          sort : 214,
          user : 'Some user',
          backer : {},
          contributor : {
            text : 'Blacksmith',
            level : 2,
            contributions : 'Made some contributions',
            admin : false
          },
          uuid : 'some-users-uuid',
          flagCount : 0,
          flags : {},
          likes : {},
          timestamp : 1444154258699.0000000000000000,
          text : 'Lorem ipsum',
          id : 'the-messages-id',
          sent : true
        }
      }
    }).then((usr) => {
      api = requester(usr);
      return api.post('/user/tasks', {
        text: 'some private text',
        notes: 'some private notes',
        checklist: [
          {text: 'a private checklist'},
          {text: 'another private checklist'},
        ],
        type: 'daily',
      });
    }).then((result) => {
      return api.get('/user/anonymized');
    }).then((anonymizedUser) => {
      user = anonymizedUser;
    });
  });

  it('retains user id', () => {
    expect(user._id).to.exist;
  });

  it('removes credentials and financial information', () => {
    expect(user.apiToken).to.not.exist;
    expect(user.auth.local).to.not.exist;
    expect(user.auth.facebook).to.not.exist;
    expect(user.purchased.plan).to.not.exist;
  });

  it('removes profile information', () => {
    expect(user.profile).to.not.exist;
    expect(user.contributor).to.not.exist;
    expect(user.achievements.challenges).to.not.exist;
  });

  it('removes social information', () => {
    expect(user.newMessages).to.not.exist;
    expect(user.invitations).to.not.exist;
    expect(user.items.special.nyeReceived).to.not.exist;
    expect(user.items.special.valentineReceived).to.not.exist;

    each(user.inbox.messages, (msg) => {
      expect(msg.text).to.eql('inbox message text');
    });
  });

  it('anonymizes task info', () => {
    each(['habits', 'todos', 'dailys', 'rewards'], (tasks) => {
      each(user[tasks], (task) => {
        expect(task.text).to.eql('task text');
        expect(task.notes).to.eql('task notes');

        each(task.checklist, (box) => {
          expect(box.text).to.match(/item\d*/);
        });
      });
    });
  });

  it('anonymizes tags', () => {
    each(user.tags, (tag) => {
      expect(tag.name).to.eql('tag');
      expect(tag.challenge).to.eql('challenge');
    });
  });

  it('removes webhooks', () => {
    expect(user.webhooks).to.not.exist;
  });
});
