import {
  generateUser,
  generateGroup,
  generateChallenge,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /tasks/unlink-one/:taskId', () => {
  let user;
  let guild;
  let challenge;
  let tasksToTest = {
    habit: {
      text: 'test habit',
      type: 'habit',
      up: false,
      down: true,
    },
    todo: {
      text: 'test todo',
      type: 'todo',
    },
    daily: {
      text: 'test daily',
      type: 'daily',
      frequency: 'daily',
      everyX: 5,
      startDate: new Date(),
    },
    reward: {
      text: 'test reward',
      type: 'reward',
    },
  };

  beforeEach(async () => {
    user = await generateUser();
    guild = await generateGroup(user);
    challenge = await generateChallenge(user, guild);
  });

});