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

describe('xml marshaller marshalls user data (with purchases)', () => {
  const minimumUser = {
    pinnedItems: [],
    unpinnedItems: [],
    inbox: {},
  };

  function userDataWith (fields) {
    return { ...minimumUser, ...fields };
  }

  it('maps the purchases field with data that begins with a number', () => {
    const userData = userDataWith({
      purchased: {
        ads: false,
        txnCount: 0,
        skin: {
          eb052b: true,
          '0ff591': true,
          '2b43f6': true,
          d7a9f7: true,
          '800ed0': true,
          rainbow: true,
        },
      },
    });

    const xml = xmlMarshaller.marshallUserData(userData);

    expect(xml).to.equal(`<user>
    <inbox/>
    <purchased>
        <ads>false</ads>
        <txnCount>0</txnCount>
        <skin>eb052b</skin>
        <skin>0ff591</skin>
        <skin>2b43f6</skin>
        <skin>d7a9f7</skin>
        <skin>800ed0</skin>
        <skin>rainbow</skin>
    </purchased>
</user>`);
  });
});

describe('xml marshaller marshalls user data (with purchases nested)', () => {
  const minimumUser = {
    pinnedItems: [],
    unpinnedItems: [],
    inbox: {},
  };

  function userDataWith (fields) {
    return { ...minimumUser, ...fields };
  }

  it('maps the purchases field with data that begins with a number and nested objects', () => {
    const userData = userDataWith({
      purchased: {
        ads: false,
        txnCount: 0,
        skin: {
          eb052b: true,
          '0ff591': true,
          '2b43f6': true,
          d7a9f7: true,
          '800ed0': true,
          rainbow: true,
        },
        plan: {
          consecutive: {
            count: 0,
            offset: 0,
            gemCapExtra: 0,
            trinkets: 0,
          },
        },
      },
    });

    const xml = xmlMarshaller.marshallUserData(userData);

    expect(xml).to.equal(`<user>
    <inbox/>
    <purchased>
        <ads>false</ads>
        <txnCount>0</txnCount>
        <skin>eb052b</skin>
        <skin>0ff591</skin>
        <skin>2b43f6</skin>
        <skin>d7a9f7</skin>
        <skin>800ed0</skin>
        <skin>rainbow</skin>
        <plan>
            <item>
                <count>0</count>
                <offset>0</offset>
                <gemCapExtra>0</gemCapExtra>
                <trinkets>0</trinkets>
            </item>
        </plan>
    </purchased>
</user>`);
  });
});
