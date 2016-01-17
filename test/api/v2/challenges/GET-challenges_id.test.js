import {
  createAndPopulateGroup,
  generateChallenge,
} from '../../../helpers/api-integration/v2';

describe('GET /challenges/:id', () => {
  context('Member of a challenge', () => {
    let leader, party, challenge;

    before(async () => {
      let {
        group,
        groupLeader,
      } = await createAndPopulateGroup();

      party = group;
      leader =  groupLeader;
      challenge = await generateChallenge(leader, party, {
        name: 'a created challenge',
        shortName: 'aCreatedChallenge',
        description: 'a description for the challenge',
      });
    });

    it('returns the challenge object', async () => {
      let fetchedChallenge = await leader.get(`/challenges/${challenge._id}`);

      expect(fetchedChallenge.name).to.eql(challenge.name);
      expect(fetchedChallenge.shortName).to.eql(challenge.shortName);
      expect(fetchedChallenge.description).to.eql(challenge.description);
      expect(fetchedChallenge.members).to.have.a.lengthOf(1);
    });
  });
});
