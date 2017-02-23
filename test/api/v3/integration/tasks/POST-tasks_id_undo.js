import {
  generateUser,
  sleep,
  translate as t,
  server,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';
import common from '../../../../../website/common';

describe('POST /tasks/:id/undo', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser({
      'stats.gp': 100,
      'flags.dropsEnabled': true,
    });
  });

  context('all', () => {
    it('tracks reward history', async () => {
      let uuid = generateUUID();

      let task = await user.post('/tasks/user', {
        text: 'test habit',
        type: 'habit',
      });

      await user.post(`/tasks/${task.id}/score/up`);
      let updatedUser = await user.get('/user');
      let beforeMp = updatedUser.stats.mp;
      let beforeExp = updatedUser.stats.exp;
      let beforeGp = updatedUser.stats.gp;
      let beforeQuestProgress = updatedUser.party.quest.progress.up;

      await user.post(`/tasks/${task.id}/undo`);
      updatedUser = await user.get('/user');
      let afterMp = updatedUser.stats.mp;
      let afterExp = updatedUser.stats.exp;
      let afterGp = updatedUser.stats.gp;
      let afterQuestProgress = updatedUser.party.quest.progress.up;

      expect(afterMp).to.be.lessThan(beforeMp);
      expect(afterExp).to.be.lessThan(beforeExp);
      expect(afterGp).to.be.lessThan(beforeGp);
      expect(afterQuestProgress).to.be.lessThan(beforeQuestProgress);
    });
  });
});
