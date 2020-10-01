import * as xmlMarshaller from '../../../../website/server/libs/xmlMarshaller';

describe('xml marshaller marshalls user data', () => {
  const minimumUser = {
    pinnedItems: [],
    unpinnedItems: [],
    inbox: {},
  };

  function userDataWith (fields) {
    return { ...minimumUser, ...fields };
  }

  it('maps the newMessages field to have id as a value in a list.', () => {
    const userData = userDataWith({
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
    });

    const xml = xmlMarshaller.marshallUserData(userData);

    expect(xml).to.equal(`<user>
    <inbox/>
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
</user>`);
  });
});
