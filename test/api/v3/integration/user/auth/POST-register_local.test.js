import {
  generateUser,
  requester,
  translate as t,
  createAndPopulateGroup,
  getProperty,
} from '../../../../../helpers/api-integration/v3';
import { ApiUser } from '../../../../../helpers/api-integration/api-classes';
import { v4 as generateRandomUserName } from 'uuid';
import { each } from 'lodash';
import { encrypt } from '../../../../../../website/server/libs/encryption';

describe('POST /user/auth/local/register', () => {
  context('username and email are free', () => {
    let api;

    beforeEach(async () => {
      api = requester();
    });

    it('registers a new user', async () => {
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let password = 'password';

      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user._id).to.exist;
      expect(user.apiToken).to.exist;
      expect(user.auth.local.username).to.eql(username);
      expect(user.profile.name).to.eql(username);
      expect(user.newUser).to.eql(true);
    });

    it('remove spaces from username', async () => {
      let username = ' usernamewithspaces ';
      let email = 'test@example.com';
      let password = 'password';

      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.auth.local.username).to.eql(username.trim());
      expect(user.profile.name).to.eql(username.trim());
    });

    context('provides default tags and tasks', async () => {
      it('for a generic API consumer', async () => {
        let username = generateRandomUserName();
        let email = `${username}@example.com`;
        let password = 'password';

        let user = await api.post('/user/auth/local/register', {
          username,
          email,
          password,
          confirmPassword: password,
        });

        let requests = new ApiUser(user);

        let habits = await requests.get('/tasks/user?type=habits');
        let dailys = await requests.get('/tasks/user?type=dailys');
        let todos = await requests.get('/tasks/user?type=todos');
        let rewards = await requests.get('/tasks/user?type=rewards');
        let tags = await requests.get('/tags');

        expect(habits).to.have.a.lengthOf(0);
        expect(dailys).to.have.a.lengthOf(0);
        expect(todos).to.have.a.lengthOf(1);
        expect(rewards).to.have.a.lengthOf(0);

        expect(tags).to.have.a.lengthOf(7);
        expect(tags[0].name).to.eql(t('defaultTag1'));
        expect(tags[1].name).to.eql(t('defaultTag2'));
        expect(tags[2].name).to.eql(t('defaultTag3'));
        expect(tags[3].name).to.eql(t('defaultTag4'));
        expect(tags[4].name).to.eql(t('defaultTag5'));
        expect(tags[5].name).to.eql(t('defaultTag6'));
        expect(tags[6].name).to.eql(t('defaultTag7'));
      });

      xit('for Web', async () => {
        api = requester(
          null,
          {'x-client': 'habitica-web'},
        );
        let username = generateRandomUserName();
        let email = `${username}@example.com`;
        let password = 'password';

        let user = await api.post('/user/auth/local/register', {
          username,
          email,
          password,
          confirmPassword: password,
        });

        let requests = new ApiUser(user);

        let habits = await requests.get('/tasks/user?type=habits');
        let dailys = await requests.get('/tasks/user?type=dailys');
        let todos = await requests.get('/tasks/user?type=todos');
        let rewards = await requests.get('/tasks/user?type=rewards');
        let tags = await requests.get('/tags');

        expect(habits).to.have.a.lengthOf(3);
        expect(habits[0].text).to.eql(t('defaultHabit1Text'));
        expect(habits[0].notes).to.eql('');
        expect(habits[1].text).to.eql(t('defaultHabit2Text'));
        expect(habits[1].notes).to.eql('');
        expect(habits[2].text).to.eql(t('defaultHabit3Text'));
        expect(habits[2].notes).to.eql('');

        expect(dailys).to.have.a.lengthOf(0);

        expect(todos).to.have.a.lengthOf(1);
        expect(todos[0].text).to.eql(t('defaultTodo1Text'));
        expect(todos[0].notes).to.eql(t('defaultTodoNotes'));

        expect(rewards).to.have.a.lengthOf(1);
        expect(rewards[0].text).to.eql(t('defaultReward1Text'));
        expect(rewards[0].notes).to.eql('');

        expect(tags).to.have.a.lengthOf(7);
        expect(tags[0].name).to.eql(t('defaultTag1'));
        expect(tags[1].name).to.eql(t('defaultTag2'));
        expect(tags[2].name).to.eql(t('defaultTag3'));
        expect(tags[3].name).to.eql(t('defaultTag4'));
        expect(tags[4].name).to.eql(t('defaultTag5'));
        expect(tags[5].name).to.eql(t('defaultTag6'));
        expect(tags[6].name).to.eql(t('defaultTag7'));
      });
    });

    context('does not provide default tags and tasks', async () => {
      it('for Android', async () => {
        api = requester(
          null,
          {'x-client': 'habitica-android'},
        );
        let username = generateRandomUserName();
        let email = `${username}@example.com`;
        let password = 'password';

        let user = await api.post('/user/auth/local/register', {
          username,
          email,
          password,
          confirmPassword: password,
        });

        let requests = new ApiUser(user);

        let habits = await requests.get('/tasks/user?type=habits');
        let dailys = await requests.get('/tasks/user?type=dailys');
        let todos = await requests.get('/tasks/user?type=todos');
        let rewards = await requests.get('/tasks/user?type=rewards');
        let tags = await requests.get('/tags');

        expect(habits).to.have.a.lengthOf(0);
        expect(dailys).to.have.a.lengthOf(0);
        expect(todos).to.have.a.lengthOf(0);
        expect(rewards).to.have.a.lengthOf(0);
        expect(tags).to.have.a.lengthOf(0);
      });

      it('for iOS', async () => {
        api = requester(
          null,
          {'x-client': 'habitica-ios'},
        );
        let username = generateRandomUserName();
        let email = `${username}@example.com`;
        let password = 'password';

        let user = await api.post('/user/auth/local/register', {
          username,
          email,
          password,
          confirmPassword: password,
        });

        let requests = new ApiUser(user);

        let habits = await requests.get('/tasks/user?type=habits');
        let dailys = await requests.get('/tasks/user?type=dailys');
        let todos = await requests.get('/tasks/user?type=todos');
        let rewards = await requests.get('/tasks/user?type=rewards');
        let tags = await requests.get('/tags');

        expect(habits).to.have.a.lengthOf(0);
        expect(dailys).to.have.a.lengthOf(0);
        expect(todos).to.have.a.lengthOf(0);
        expect(rewards).to.have.a.lengthOf(0);
        expect(tags).to.have.a.lengthOf(0);
      });
    });

    it('enrolls new users in an A/B test', async () => {
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let password = 'password';

      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      await expect(getProperty('users', user._id, '_ABtests')).to.eventually.be.a('object');
    });

    it('includes items awarded by default when creating a new user', async () => {
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let password = 'password';

      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.items.quests.dustbunnies).to.equal(1);
      expect(user.purchased.background.violet).to.be.ok;
      expect(user.preferences.background).to.equal('violet');
    });

    it('requires password and confirmPassword to match', async () => {
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let password = 'password';
      let confirmPassword = 'not password';

      await expect(api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('requires a username', async () => {
      let email = `${generateRandomUserName()}@example.com`;
      let password = 'password';
      let confirmPassword = 'password';

      await expect(api.post('/user/auth/local/register', {
        email,
        password,
        confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('requires an email', async () => {
      let username = generateRandomUserName();
      let password = 'password';

      await expect(api.post('/user/auth/local/register', {
        username,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('requires a valid email', async () => {
      let username = generateRandomUserName();
      let email = 'notanemail@sdf';
      let password = 'password';

      await expect(api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('fails on a habitica.com email', async () => {
      let username = generateRandomUserName();
      let email = `${username}@habitica.com`;
      let password = 'password';

      await expect(api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'User validation failed',
      });
    });

    it('fails on a habitrpg.com email', async () => {
      let username = generateRandomUserName();
      let email = `${username}@habitrpg.com`;
      let password = 'password';

      await expect(api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'User validation failed',
      });
    });

    it('requires a password', async () => {
      let username = generateRandomUserName();
      let email = `${username}@example.com`;
      let confirmPassword = 'password';

      await expect(api.post('/user/auth/local/register', {
        username,
        email,
        confirmPassword,
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });
  });

  context('attach to facebook user', () => {
    let user;
    let email = 'some@email.net';
    let username = 'some-username';
    let password = 'some-password';
    beforeEach(async () => {
      user = await generateUser();
    });
    it('checks onlySocialAttachLocal', async () => {
      await expect(user.post('/user/auth/local/register', {
        email,
        username,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('onlySocialAttachLocal'),
      });
    });
    it('succeeds', async () => {
      await user.update({ 'auth.facebook.id': 'some-fb-id', 'auth.local': { ok: true } });
      await user.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });
      await user.sync();
      expect(user.auth.local.username).to.eql(username);
      expect(user.auth.local.email).to.eql(email);
    });
  });

  context('login is already taken', () => {
    let username, email, api;

    beforeEach(async () => {
      api = requester();
      username = generateRandomUserName();
      email = `${username}@example.com`;

      return generateUser({
        'auth.local.username': username,
        'auth.local.lowerCaseUsername': username,
        'auth.local.email': email,
      });
    });

    it('rejects if username is already taken', async () => {
      let uniqueEmail = `${generateRandomUserName()}@exampe.com`;
      let password = 'password';

      await expect(api.post('/user/auth/local/register', {
        username,
        email: uniqueEmail,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('usernameTaken'),
      });
    });

    it('rejects if email is already taken', async () => {
      let uniqueUsername = generateRandomUserName();
      let password = 'password';

      await expect(api.post('/user/auth/local/register', {
        username: uniqueUsername,
        email,
        password,
        confirmPassword: password,
      })).to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('emailTaken'),
      });
    });
  });

  context('req.query.groupInvite', () => {
    let api, username, email, password;

    beforeEach(() => {
      api = requester();
      username = generateRandomUserName();
      email = `${username}@example.com`;
      password = 'password';
    });

    it('does not crash the signup process when it\'s invalid', async () => {
      let user = await api.post('/user/auth/local/register?groupInvite=aaaaInvalid', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user._id).to.be.a('string');
    });

    it('supports invite using req.query.groupInvite', async () => {
      let { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'party', privacy: 'private' },
      });

      let invite = encrypt(JSON.stringify({
        id: group._id,
        inviter: groupLeader._id,
        sentAt: Date.now(), // so we can let it expire
      }));

      let user = await api.post(`/user/auth/local/register?groupInvite=${invite}`, {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.invitations.parties[0].id).to.eql(group._id);
      expect(user.invitations.parties[0].name).to.eql(group.name);
      expect(user.invitations.parties[0].inviter).to.eql(groupLeader._id);
    });

    it('awards achievement to inviter', async () => {
      let { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'party', privacy: 'private' },
      });

      let invite = encrypt(JSON.stringify({
        id: group._id,
        inviter: groupLeader._id,
        sentAt: Date.now(),
      }));

      await api.post(`/user/auth/local/register?groupInvite=${invite}`, {
        username,
        email,
        password,
        confirmPassword: password,
      });

      await groupLeader.sync();
      expect(groupLeader.achievements.invitedFriend).to.be.true;
    });

    it('user not added to a party on expired invite', async () => {
      let { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'party', privacy: 'private' },
      });

      let invite = encrypt(JSON.stringify({
        id: group._id,
        inviter: groupLeader._id,
        sentAt: Date.now() - 6.912e8, // 8 days old
      }));

      let user = await api.post(`/user/auth/local/register?groupInvite=${invite}`, {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.invitations.party).to.eql({});
    });

    it('adds a user to a guild on an invite of type other than party', async () => {
      let { group, groupLeader } = await createAndPopulateGroup({
          groupDetails: { type: 'guild', privacy: 'private' },
      });

      let invite = encrypt(JSON.stringify({
        id: group._id,
        inviter: groupLeader._id,
        sentAt: Date.now(),
      }));

      let user = await api.post(`/user/auth/local/register?groupInvite=${invite}`, {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.invitations.guilds[0]).to.eql({
        id: group._id,
        name: group.name,
        inviter: groupLeader._id,
      });
    });
  });

  context('successful login via api', () => {
    let api, username, email, password;

    beforeEach(() => {
      api = requester();
      username = generateRandomUserName();
      email = `${username}@example.com`;
      password = 'password';
    });

    it('sets all site tour values to -2 (already seen)', async () => {
      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.flags.tour).to.not.be.empty;

      each(user.flags.tour, (value) => {
        expect(value).to.eql(-2);
      });
    });

    it('populates user with default todos, not no other task types', async () => {
      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.tasksOrder.todos).to.not.be.empty;
      expect(user.tasksOrder.dailys).to.be.empty;
      expect(user.tasksOrder.habits).to.be.empty;
      expect(user.tasksOrder.rewards).to.be.empty;
    });

    it('populates user with default tags', async () => {
      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.tags).to.not.be.empty;
    });
  });

  context('successful login with habitica-web header', () => {
    let api, username, email, password;

    beforeEach(() => {
      api = requester({}, {'x-client': 'habitica-web'});
      username = generateRandomUserName();
      email = `${username}@example.com`;
      password = 'password';
    });

    it('sets all common tutorial flags to true', async () => {
      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.flags.tour).to.not.be.empty;

      each(user.flags.tutorial.common, (value) => {
        expect(value).to.eql(true);
      });
    });

    it('populates user with default todos, habits, and rewards', async () => {
      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.tasksOrder.todos).to.be.empty;
      expect(user.tasksOrder.dailys).to.be.empty;
      expect(user.tasksOrder.habits).to.be.empty;
      expect(user.tasksOrder.rewards).to.be.empty;
    });

    it('populates user with default tags', async () => {
      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.tags).to.not.be.empty;
    });

    it('adds the correct tags to the correct tasks', async () => {
      let user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      let requests = new ApiUser(user);

      let habits = await requests.get('/tasks/user?type=habits');
      let todos = await requests.get('/tasks/user?type=todos');

      expect(habits).to.have.a.lengthOf(0);
      expect(todos).to.have.a.lengthOf(0);
    });
  });
});
