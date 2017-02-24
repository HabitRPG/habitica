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
    ['habit', 'todo', 'daily'].forEach((type) => {
      it(`undos a score up ${type}`, async () => {
        let uuid = generateUUID();

        let task = await user.post('/tasks/user', {
          text: `test ${type}`,
          type: type,
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

      it(`undos a score down ${type}`, async () => {
        let uuid = generateUUID();

        let task = await user.post('/tasks/user', {
          text: 'test habit',
          type: 'habit',
        });

        await user.post(`/tasks/${task.id}/score/down`);
        let updatedUser = await user.get('/user');
        let beforeHp = updatedUser.stats.hp;
        let beforeMp = updatedUser.stats.mp;
        let beforeExp = updatedUser.stats.exp;
        let beforeGp = updatedUser.stats.gp;

        await user.post(`/tasks/${task.id}/undo`);
        updatedUser = await user.get('/user');
        let afterHp = updatedUser.stats.hp;
        let afterMp = updatedUser.stats.mp;
        let afterExp = updatedUser.stats.exp;
        let afterGp = updatedUser.stats.gp;

        expect(beforeHp).to.be.lessThan(afterHp);
        expect(beforeMp).to.be.lessThan(afterMp);
        expect(beforeExp <= afterExp).to.be.true;
        expect(beforeGp <= afterExp).to.be.lessThan(afterGp);
      });
    });
  });
});
