import { ApiGroup } from '../api-classes';
import { requester } from '../requester';

export async function setWorldBoss ({ key = 'dysheartener', hp = 1000000, rage = 5000 }) {
  let tavern = await requester().get('/groups/tavern');

  let apiTavern = new ApiGroup(tavern);

  await apiTavern.update(
    {
      quest: {
        active: true,
        key,
        progress: {
          hp,
          rage,
        },
      },
    }
  );
}
