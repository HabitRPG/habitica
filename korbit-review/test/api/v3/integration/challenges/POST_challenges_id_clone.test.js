import {
  generateUser,
  generateGroup,
} from '../../../../helpers/api-integration/v3';

describe('POST /challenges/:challengeId/clone', () => {
  it('clones a challenge', async () => {
    const user = await generateUser({ balance: 10 });
    const group = await generateGroup(user);

    const name = 'Test Challenge';
    const shortName = 'TC Label';
    const description = 'Test Description';
    const prize = 1;

    const challenge = await user.post('/challenges', {
      group: group._id,
      name,
      shortName,
      description,
      prize,
    });
    const challengeTask = await user.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
      notes: 1976,
    });

    const cloneChallengeResponse = await user.post(`/challenges/${challenge._id}/clone`, {
      group: group._id,
      name: `${name} cloned`,
      shortName,
      description,
      prize,
    });

    expect(cloneChallengeResponse.clonedTasks[0].text).to.eql(challengeTask.text);
    expect(cloneChallengeResponse.clonedTasks[0]._id).to.not.eql(challengeTask._id);
    expect(cloneChallengeResponse.clonedTasks[0].challenge.id)
      .to.eql(cloneChallengeResponse.clonedChallenge._id);
  });
});
