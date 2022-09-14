import { v4 as generateUUID } from 'uuid';
import { find } from 'lodash';
import {
  generateUser,
  translate as t,
  createAndPopulateGroup,
  generateGroup,
  generateChallenge,
  sleep,
} from '../../../../helpers/api-integration/v3';
import apiError from '../../../../../website/server/libs/apiError';

describe('POST /user/class/cast/:spellId', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error if spell does not exist', async () => {
    await user.update({ 'stats.class': 'rogue' });
    const spellId = 'invalidSpell';
    await expect(user.post(`/user/class/cast/${spellId}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: apiError('spellNotFound', { spellId }),
      });
  });

  it('returns an error if spell does not exist in user\'s class', async () => {
    const spellId = 'pickPocket';
    await expect(user.post(`/user/class/cast/${spellId}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: apiError('spellNotFound', { spellId }),
      });
  });

  it('returns an error if spell.mana > user.mana', async () => {
    await user.update({ 'stats.class': 'rogue' });
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

  it('returns an error if use Healing Light spell with full health', async () => {
    await user.update({
      'stats.class': 'healer',
      'stats.lvl': 11,
      'stats.hp': 50,
      'stats.mp': 200,
    });
    await expect(user.post('/user/class/cast/heal'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageHealthAlreadyMax'),
      });
  });

  it('returns an error if spell.lvl > user.level', async () => {
    await user.update({ 'stats.mp': 200, 'stats.class': 'wizard' });
    await expect(user.post('/user/class/cast/earth'))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('spellLevelTooHigh', { level: 13 }),
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
    await user.update({ 'stats.class': 'rogue', 'stats.lvl': 11 });
    await expect(user.post('/user/class/cast/pickPocket'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('targetIdUUID'),
      });
  });

  it('returns an error if targeted task doesn\'t exist', async () => {
    await user.update({ 'stats.class': 'rogue', 'stats.lvl': 11 });
    await expect(user.post(`/user/class/cast/pickPocket?targetId=${generateUUID()}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageTaskNotFound'),
      });
  });

  it('returns an error if a challenge task was targeted', async () => {
    const { group, groupLeader } = await createAndPopulateGroup();
    const challenge = await generateChallenge(groupLeader, group);
    await groupLeader.post(`/challenges/${challenge._id}/join`);
    await groupLeader.post(`/tasks/challenge/${challenge._id}`, [
      { type: 'habit', text: 'task text' },
    ]);
    await groupLeader.update({ 'stats.class': 'rogue', 'stats.lvl': 11 });
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
    const { group, groupLeader } = await createAndPopulateGroup({ upgradeToGroupPlan: true });

    const groupTask = await groupLeader.post(`/tasks/group/${group._id}`, {
      text: 'todo group',
      type: 'todo',
    });
    await groupLeader.post(`/tasks/${groupTask._id}/assign`, [groupLeader._id]);
    await groupLeader.update({ 'stats.class': 'rogue', 'stats.lvl': 11 });
    await sleep(0.5);
    await groupLeader.sync();

    await expect(groupLeader.post(`/user/class/cast/pickPocket?targetId=${groupTask._id}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('messageTaskNotFound'),
      });
  });

  it('Issue #12361: returns an error if stealth has already been cast', async () => {
    await user.update({
      'stats.class': 'rogue',
      'stats.lvl': 15,
      'stats.mp': 400,
      'stats.buffs.stealth': 1,
    });
    await user.sync();
    await expect(user.post('/user/class/cast/stealth'))
      .to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('spellAlreadyCast'),
      });
    expect(user.stats.mp).to.equal(400);
  });

  it('returns an error if targeted party member doesn\'t exist', async () => {
    const { groupLeader } = await createAndPopulateGroup({
      groupDetails: { type: 'party', privacy: 'private' },
      members: 1,
    });
    await groupLeader.update({ 'items.special.snowball': 3 });

    const target = generateUUID();
    await expect(groupLeader.post(`/user/class/cast/snowball?targetId=${target}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('userWithIDNotFound', { userId: target }),
      });
  });

  it('returns an error if party does not exists', async () => {
    await user.update({ 'items.special.snowball': 3 });

    await expect(user.post(`/user/class/cast/snowball?targetId=${generateUUID()}`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('partyNotFound'),
      });
  });

  it('send message in party chat if party && !spell.silent', async () => {
    const { group, groupLeader } = await createAndPopulateGroup({
      groupDetails: { type: 'party', privacy: 'private' },
      members: 1,
    });
    await groupLeader.update({ 'stats.mp': 200, 'stats.class': 'wizard', 'stats.lvl': 13 });

    await groupLeader.post('/user/class/cast/earth');
    await sleep(1);
    const groupMessages = await groupLeader.get(`/groups/${group._id}/chat`);

    expect(groupMessages[0]).to.exist;
    expect(groupMessages[0].uuid).to.equal('system');
  });

  it('Ethereal Surge does not recover mp of other mages', async () => {
    const group = await createAndPopulateGroup({
      groupDetails: { type: 'party', privacy: 'private' },
      members: 4,
    });

    let promises = [];
    promises.push(group.groupLeader.update({ 'stats.mp': 200, 'stats.class': 'wizard', 'stats.lvl': 20 }));
    promises.push(group.members[0].update({ 'stats.mp': 0, 'stats.class': 'warrior', 'stats.lvl': 20 }));
    promises.push(group.members[1].update({ 'stats.mp': 0, 'stats.class': 'wizard', 'stats.lvl': 20 }));
    promises.push(group.members[2].update({ 'stats.mp': 0, 'stats.class': 'rogue', 'stats.lvl': 20 }));
    promises.push(group.members[3].update({ 'stats.mp': 0, 'stats.class': 'healer', 'stats.lvl': 20 }));
    await Promise.all(promises);

    await group.groupLeader.post('/user/class/cast/mpheal');

    promises = [];
    promises.push(group.members[0].sync());
    promises.push(group.members[1].sync());
    promises.push(group.members[2].sync());
    promises.push(group.members[3].sync());
    await Promise.all(promises);

    expect(group.members[0].stats.mp).to.be.greaterThan(0); // warrior
    expect(group.members[1].stats.mp).to.equal(0); // wizard
    expect(group.members[2].stats.mp).to.be.greaterThan(0); // rogue
    expect(group.members[3].stats.mp).to.be.greaterThan(0); // healer
  });

  it('cast bulk', async () => {
    let { group, groupLeader } = await createAndPopulateGroup({ // eslint-disable-line prefer-const
      groupDetails: { type: 'party', privacy: 'private' },
      members: 1,
    });

    await groupLeader.update({ 'stats.mp': 200, 'stats.class': 'wizard', 'stats.lvl': 13 });
    await groupLeader.post('/user/class/cast/earth', { quantity: 2 });

    await sleep(1);
    group = await groupLeader.get(`/groups/${group._id}`);

    expect(group.chat[0]).to.exist;
    expect(group.chat[0].uuid).to.equal('system');
  });

  it('searing brightness does not affect challenge or group tasks', async () => {
    const guild = await generateGroup(user, {}, { 'purchased.plan.customerId': 'group-unlimited' });
    const challenge = await generateChallenge(user, guild);
    await user.post(`/challenges/${challenge._id}/join`);
    await user.post(`/tasks/challenge/${challenge._id}`, {
      text: 'test challenge habit',
      type: 'habit',
    });

    const groupTask = await user.post(`/tasks/group/${guild._id}`, {
      text: 'todo group',
      type: 'todo',
    });
    await user.update({ 'stats.class': 'healer', 'stats.mp': 200, 'stats.lvl': 15 });
    await user.post(`/tasks/${groupTask._id}/assign`, [user._id]);
    await user.put('/user', {
      'preferences.tasks.mirrorGroupTasks': [guild._id],
    });

    await user.post('/user/class/cast/brightness');
    await user.sync();

    const memberTasks = await user.get('/tasks/user');

    const syncedGroupTask = find(memberTasks, memberTask => memberTask.group.id === guild._id);

    const userChallengeTask = find(
      memberTasks,
      memberTask => memberTask.challenge.id === challenge._id,
    );

    expect(userChallengeTask).to.exist;
    expect(syncedGroupTask).to.exist;
    expect(userChallengeTask.value).to.equal(0);
    expect(syncedGroupTask.value).to.equal(0);
  });

  it('increases both user\'s achievement values', async () => {
    const party = await createAndPopulateGroup({
      members: 1,
    });
    const leader = party.groupLeader;
    const recipient = party.members[0];
    await leader.update({ 'stats.gp': 10 });
    await leader.post(`/user/class/cast/birthday?targetId=${recipient._id}`);
    await leader.sync();
    await recipient.sync();
    expect(leader.achievements.birthday).to.equal(1);
    expect(recipient.achievements.birthday).to.equal(1);
  });

  it('only increases user\'s achievement one if target == caster', async () => {
    await user.update({ 'stats.gp': 10 });
    await user.post(`/user/class/cast/birthday?targetId=${user._id}`);
    await user.sync();
    expect(user.achievements.birthday).to.equal(1);
  });

  it('passes correct target to spell when targetType === \'task\'', async () => {
    await user.update({ 'stats.class': 'wizard', 'stats.lvl': 11 });

    const task = await user.post('/tasks/user', {
      text: 'test habit',
      type: 'habit',
    });

    const result = await user.post(`/user/class/cast/fireball?targetId=${task._id}`);

    expect(result.task._id).to.equal(task._id);
  });

  it('passes correct target to spell when targetType === \'self\'', async () => {
    await user.update({ 'stats.class': 'wizard', 'stats.lvl': 14, 'stats.mp': 50 });

    const result = await user.post('/user/class/cast/frost');

    expect(result.user.stats.mp).to.equal(10);
  });

  // TODO find a way to have sinon working in integration tests
  // it doesn't work when tests are running separately from server
  it('passes correct target to spell when targetType === \'tasks\'');
  it('passes correct target to spell when targetType === \'party\'');
  it('passes correct target to spell when targetType === \'user\'');
  it('passes correct target to spell when targetType === \'party\' and user is not in a party');
  it('passes correct target to spell when targetType === \'user\' and user is not in a party');
});
