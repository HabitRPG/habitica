import dataexport from '../../../../website/server/controllers/top-level/dataexport';

import * as Tasks from '../../../../website/server/models/task';
import * as inboxLib from '../../../../website/server/libs/inbox';

describe('xml export', async () => {
  let exported;

  const user = {
    toJSON () {
      return {
        newMessages: {
          '283171a5-422c-4991-bc78-95b1b5b51629': {
            name: 'The Language Hackers',
            value: true,
          },
          '283171a6-422c-4991-bc78-95b1b5b51629': {
            name: 'The Bug Hackers',
            value: false,
          },
        },
        inbox: {},
        pinnedItems: [],
        unpinnedItems: [],
      };
    },
  };

  const response = {
    locals: { user },
    set () {},
    status: () => ({
      send: data => {
        exported = data;
      },
    }),
  };

  beforeEach(() => {
    const tasks = [{
      toJSON: () => ({ a: 'b', type: 'c' }),
    }];
    const messages = [{ flags: { content: 'message' } }];

    sinon.stub(Tasks.Task, 'find').returns({ exec: async () => tasks });
    sinon.stub(inboxLib, 'getUserInbox').resolves(messages);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('maps the newMessages field to have id as a value in a list.', async () => {
    await dataexport.exportUserDataXml.handler({}, response);
    expect(exported).to.equal(`<user>
    <newMessages>
        <id>283171a5-422c-4991-bc78-95b1b5b51629</id>
        <name>The Language Hackers</name>
        <value>true</value>
    </newMessages>
    <newMessages>
        <id>283171a6-422c-4991-bc78-95b1b5b51629</id>
        <name>The Bug Hackers</name>
        <value>false</value>
    </newMessages>
    <inbox>
        <messages>
            <flags>content</flags>
        </messages>
    </inbox>
    <tasks>
        <cs>
            <a>b</a>
            <type>c</type>
        </cs>
    </tasks>
</user>`);
  });
});
