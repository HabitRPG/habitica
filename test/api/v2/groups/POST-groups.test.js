import {
  generateGroup,
  generateUser,
  requester,
  translate as t,
} from '../../../helpers/api-integration.helper';

describe('POST /groups', () => {

  context('All groups', () => {
    let api, leader;

    beforeEach(() => {
      return generateUser().then((user) => {
        leader = user;
        api = requester(user);
      });
    });

    xit('returns defaults? (TODO: it\'s possible to create a group without a type. Should the group default to party? Should we require type to be set?', () => {
      return api.post('/groups').then((group) => {
        expect(group._id).to.exist;
        expect(group.name).to.eql(`${leader.profile.name}'s group`);
        expect(group.type).to.eql('party');
        expect(group.privacy).to.eql('private');
      });
    });

    it('returns a group object', () => {
      let group = {
        name: 'Test Group',
        type: 'party',
        leaderOnly: { challenges: true },
        description: 'Test Group Description',
        leaderMessage: 'Test Group Message',
      };

      return api.post('/groups', group).then((createdGroup) => {
        expect(createdGroup._id).to.exist;
        expect(createdGroup.leader).to.eql(leader._id);
        expect(createdGroup.name).to.eql(group.name);
        expect(createdGroup.description).to.eql(group.description);
        expect(createdGroup.leaderMessage).to.eql(group.leaderMessage);
        expect(createdGroup.leaderOnly).to.eql(group.leaderOnly);
        expect(createdGroup.memberCount).to.eql(1);
      });
    });

    it('returns a populated members array', () => {
      return api.post('/groups', {
        type: 'party',
      }).then((party) => {
        let member = party.members[0];
        expect(member._id).to.eql(leader._id);
        expect(member.profile).to.eql(leader.profile);
        expect(member.contributor).to.eql(leader.contributor);
      });
    });
  });

  context('Parties', () => {
    let api, leader;

    beforeEach(() => {
      return generateUser().then((user) => {
        leader = user;
        api = requester(user);
      });
    });

    it('allows party creation without gems', () => {
      return expect(api.post('/groups', {
        type: 'party',
      })).to.eventually.have.property('_id');
    });

    it('prevents party creation if user is already in party', () => {
      return expect(generateGroup(leader, {
        type: 'party',
      }).then((group) => {
        return api.post('/groups', {
          type: 'party',
        });
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        text: t('messageGroupAlreadyInParty'),
      });
    });

    xit('prevents creating a public party. TODO: it is possible to create a public party. Should we send back an error? Automatically switch the privacy to private?', () => {
      return expect(api.post('/groups', {
        type: 'party',
        privacy: 'public',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        text: 'Parties must be private',
      });
    });
  });

  context('Guilds', () => {
    let api, leader;

    beforeEach(() => {
      return generateUser({
        balance: 2,
      }).then((user) => {
        leader = user;
        api = requester(user);
      });
    });

    it('prevents guild creation when user does not have enough gems', () => {
      return expect(generateUser({
        balance: 0.75,
      }).then((user) => {
        api = requester(user);
        return api.post('/groups', {
          type: 'guild',
        });
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        text: t('messageInsufficientGems'),
      });
    });

    it('can create a public guild', () => {
      return expect(api.post('/groups', {
        type: 'guild',
        privacy: 'public',
      })).to.eventually.have.property('leader', leader._id);
    });

    it('can create a private guild', () => {
      return expect(api.post('/groups', {
        type: 'guild',
        privacy: 'private',
      })).to.eventually.have.property('leader', leader._id);
    });

    it('deducts gems from user and adds them to guild bank', () => {
      return expect(api.post('/groups', {
        type: 'guild',
        privacy: 'private',
      }).then((group) => {
        expect(group.balance).to.eql(1);
        return api.get('/user');
      })).to.eventually.have.deep.property('balance', 1);
    });
  });
});
