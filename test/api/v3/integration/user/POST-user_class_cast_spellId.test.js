import {
  generateUser,
  translate as t,
  createAndPopulateGroup,
  generateGroup,
  generateChallenge,
  sleep,
} from '../../../../helpers/api-integration/v3';

import { v4 as generateUUID } from 'uuid';
import { find } from 'lodash';

describe('POST /user/class/cast/:spellId', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error if spell does not exist', async () => {
    await user.update({'stats.class': 'rogue'});
    let spellId = 'invalidSpell';
    await expect(user.post(`/user/class/cast/${spellId}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('spellNotFound', {spellId}),
      });
  });

  it('returns an error if spell does not exist in user\'s class', async () => {
    let spellId = 'pickPocket';
    await expect(user.post(`/user/class/cast/${spellId}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('spellNotFound', {spellId}),
      });
  });

  it('returns an error if spell.mana > user.mana', async () => {
    await user.update({'stats.class': 'rogue'});
    await expect(user.post('/user/class/cast/backStab'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('notEnoughMana'),
      });
  });

  it('returns an error if spell.value > user.gold', async () => {
    await expect(user.post('/user/class/cast/birthday'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageNotEnoughGold'),
      });
  });

  it('returns an error if spell.lvl > user.level', async () => {
    await user.update({'stats.mp': 200, 'stats.class': 'wizard'});
    await expect(user.post('/user/class/cast/earth'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('spellLevelTooHigh', {level: 13}),
      });
  });

  it('returns an error if user doesn\'t own the spell', async () => {
    await expect(user.post('/user/class/cast/snowball'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('spellNotOwned'),
      });
  });

  it('returns an error if targetId is not an UUID', async () => {
    await expect(user.post('/user/class/cast/spellId?targetId=notAnUUID'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
  });

  it('returns an error if targetId is required but missing', async () => {
    await user.update({'stats.class': 'rogue', 'stats.lvl': 11});
    await expect(user.post('/user/class/cast/pickPocket'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('targetIdUUID'),
      });
  });

  it('returns an error if targeted task doesn\'t exist', async () => {
    await user.update({'stats.class': 'rogue', 'stats.lvl': 11});
    await expect(user.post(`/user/class/cast/pickPocket?targetId=${generateUUID()}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('taskNotFound'),
      });
  });

  it('returns an error if a challenge task was targeted', async () => {
    let {group, groupLeader} = await createAndPopulateGroup();
    let challenge = await generateChallenge(groupLeader, group);
    await groupLeader.post(`/tasks/challenge/${challenge._id}`, [
      {type: 'habit', text: 'task text'},
    ]);
    await groupLeader.update({'stats.class': 'rogue', 'stats.lvl': 11});
    await sleep(0.5);
    await groupLeader.sync();
    await expect(groupLeader.post(`/user/class/cast/pickPocket?targetId=${groupLeader.tasksOrder.habits[0]}`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('challengeTasksNoCast'),
      });
  });

  it('returns an error if a group task was targeted', async () => {
    let {group, groupLeader} = await createAndPopulateGroup();

    let groupTask = await groupLeader.post(`/tasks/group/${group._id}`, {
      text: 'todo group',
      type: 'todo',
    });
    await groupLeader.post(`/tasks/${groupTask._id}/assign/${groupLeader._id}`);
    let memberTasks = await groupLeader.get('/tasks/user');
    let syncedGroupTask = find(memberTasks, function findAssignedTask (memberTask) {
      return memberTask.group.id === group._id;
    });

    await groupLeader.update({'stats.class': 'rogue', 'stats.lvl': 11});
    await sleep(0.5);
    await groupLeader.sync();

    await expect(groupLeader.post(`/user/class/cast/pickPocket?targetId=${syncedGroupTask._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('groupTasksNoCast'),
      });
  });

  it('returns an error if targeted party member doesn\'t exist', async () => {
    let {groupLeader} = await createAndPopulateGroup({
      groupDetails: { type: 'party', privacy: 'private' },
      members: 1,
    });
    await groupLeader.update({'items.special.snowball': 3});

    let target = generateUUID();
    await expect(groupLeader.post(`/user/class/cast/snowball?targetId=${target}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('userWithIDNotFound', {userId: target}),
      });
  });

  it('returns an error if party does not exists', async () => {
    await user.update({'items.special.snowball': 3});

    await expect(user.post(`/user/class/cast/snowball?targetId=${generateUUID()}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('partyNotFound'),
      });
  });

  it('send message in party chat if party && !spell.silent', async () => {
    let { group, groupLeader } = await createAndPopulateGroup({
      groupDetails: { type: 'party', privacy: 'private' },
      members: 1,
    });
    await groupLeader.update({'stats.mp': 200, 'stats.class': 'wizard', 'stats.lvl': 13});
    await groupLeader.post('/user/class/cast/earth');
    await sleep(1);
    await group.sync();
    expect(group.chat[0]).to.exist;
    expect(group.chat[0].uuid).to.equal('system');
  });

  it('searing brightness does not affect challenge or group tasks', async () => {
    let guild = await generateGroup(user);
    let challenge = await generateChallenge(user, guild);
    await user.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test challenge habit',
      type: 'habit',
    });

    let groupTask = await user.post(`/tasks/group/${guild._id}`, {
      text: 'todo group',
      type: 'todo',
    });
    await user.update({'stats.class': 'healer', 'stats.mp': 200, 'stats.lvl': 15});
    await user.post(`/tasks/${groupTask._id}/assign/${user._id}`);

    await user.post('/user/class/cast/brightness');
    await user.sync();

    let memberTasks = await user.get('/tasks/user');

    let syncedGroupTask = find(memberTasks, function findAssignedTask (memberTask) {
      return memberTask.group.id === guild._id;
    });

    let userChallengeTask = find(memberTasks, function findAssignedTask (memberTask) {
      return memberTask.challenge.id === challenge._id;
    });

    expect(userChallengeTask).to.exist;
    expect(syncedGroupTask).to.exist;
    expect(userChallengeTask.value).to.equal(0);
    expect(syncedGroupTask.value).to.equal(0);
  });

  it('increases both user\'s achievement values', async () => {
    let party = await createAndPopulateGroup({
      members: 1,
    });
    let leader = party.groupLeader;
    let recipient = party.members[0];
    await leader.update({'stats.gp': 10});
    await leader.post(`/user/class/cast/birthday?targetId=${recipient._id}`);
    await leader.sync();
    await recipient.sync();
    expect(leader.achievements.birthday).to.equal(1);
    expect(recipient.achievements.birthday).to.equal(1);
  });

  it('only increases user\'s achievement one if target == caster', async () => {
    await user.update({'stats.gp': 10});
    await user.post(`/user/class/cast/birthday?targetId=${user._id}`);
    await user.sync();
    expect(user.achievements.birthday).to.equal(1);
  });

  // TODO find a way to have sinon working in integration tests
  // it doesn't work when tests are running separately from server
  it('passes correct target to spell when targetType === \'task\'');
  it('passes correct target to spell when targetType === \'tasks\'');
  it('passes correct target to spell when targetType === \'self\'');
  it('passes correct target to spell when targetType === \'party\'');
  it('passes correct target to spell when targetType === \'user\'');
  it('passes correct target to spell when targetType === \'party\' and user is not in a party');
  it('passes correct target to spell when targetType === \'user\' and user is not in a party');
});
