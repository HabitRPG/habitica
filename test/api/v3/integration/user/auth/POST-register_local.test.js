import { v4 as uuid } from 'uuid';
import { each } from 'lodash';
import {
  generateUser,
  requester,
  translate as t,
  createAndPopulateGroup,
  getProperty,
} from '../../../../../helpers/api-integration/v3';
import { ApiUser } from '../../../../../helpers/api-integration/api-classes';
import { encrypt } from '../../../../../../website/server/libs/encryption';

function generateRandomUserName () {
  return (Date.now() + uuid()).substring(0, 20);
}

describe('POST /user/auth/local/register', () => {
  context('username and email are free', () => {
    let api;

    beforeEach(async () => {
      api = requester();
    });

    it('registers a new user', async () => {
      const username = generateRandomUserName();
      const email = `${username}@example.com`;
      const password = 'password';

      const user = await api.post('/user/auth/local/register', {
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

    it('registers a new user and sets verifiedUsername to true', async () => {
      const username = generateRandomUserName();
      const email = `${username}@example.com`;
      const password = 'password';

      const user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user._id).to.exist;
      expect(user.apiToken).to.exist;
      expect(user.flags.verifiedUsername).to.eql(true);
    });

    xit('remove spaces from username', async () => {
      // TODO can probably delete this test now
      const username = ' usernamewithspaces ';
      const email = 'test@example.com';
      const password = 'password';

      const user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.auth.local.username).to.eql(username.trim());
      expect(user.profile.name).to.eql(username.trim());
    });

    context('validates username', () => {
      const email = 'test@example.com';
      const password = 'password';

      it('requires to username to be less than 20', async () => {
        const username = (Date.now() + uuid()).substring(0, 21);

        await expect(api.post('/user/auth/local/register', {
          username,
          email,
          password,
          confirmPassword: password,
        })).to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: 'Invalid request parameters.',
        });
      });

      it('rejects chracters not in [-_a-zA-Z0-9]', async () => {
        const username = 'a-zA_Z09*';

        await expect(api.post('/user/auth/local/register', {
          username,
          email,
          password,
          confirmPassword: password,
        })).to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: 'Invalid request parameters.',
        });
      });

      it('allows only [-_a-zA-Z0-9] characters', async () => {
        const username = 'a-zA_Z09';

        const user = await api.post('/user/auth/local/register', {
          username,
          email,
          password,
          confirmPassword: password,
        });

        expect(user.auth.local.username).to.eql(username);
      });
    });

    context('provides default tags and tasks', async () => {
      it('for a generic API consumer', async () => {
        const username = generateRandomUserName();
        const email = `${username}@example.com`;
        const password = 'password';

        const user = await api.post('/user/auth/local/register', {
          username,
          email,
          password,
          confirmPassword: password,
        });

        const requests = new ApiUser(user);

        const habits = await requests.get('/tasks/user?type=habits');
        const dailys = await requests.get('/tasks/user?type=dailys');
        const todos = await requests.get('/tasks/user?type=todos');
        const rewards = await requests.get('/tasks/user?type=rewards');
        const tags = await requests.get('/tags');

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
          { 'x-client': 'habitica-web' },
        );
        const username = generateRandomUserName();
        const email = `${username}@example.com`;
        const password = 'password';

        const user = await api.post('/user/auth/local/register', {
          username,
          email,
          password,
          confirmPassword: password,
        });

        const requests = new ApiUser(user);

        const habits = await requests.get('/tasks/user?type=habits');
        const dailys = await requests.get('/tasks/user?type=dailys');
        const todos = await requests.get('/tasks/user?type=todos');
        const rewards = await requests.get('/tasks/user?type=rewards');
        const tags = await requests.get('/tags');

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
          { 'x-client': 'habitica-android' },
        );
        const username = generateRandomUserName();
        const email = `${username}@example.com`;
        const password = 'password';

        const user = await api.post('/user/auth/local/register', {
          username,
          email,
          password,
          confirmPassword: password,
        });

        const requests = new ApiUser(user);

        const habits = await requests.get('/tasks/user?type=habits');
        const dailys = await requests.get('/tasks/user?type=dailys');
        const todos = await requests.get('/tasks/user?type=todos');
        const rewards = await requests.get('/tasks/user?type=rewards');
        const tags = await requests.get('/tags');

        expect(habits).to.have.a.lengthOf(0);
        expect(dailys).to.have.a.lengthOf(0);
        expect(todos).to.have.a.lengthOf(0);
        expect(rewards).to.have.a.lengthOf(0);
        expect(tags).to.have.a.lengthOf(0);
      });

      it('for iOS', async () => {
        api = requester(
          null,
          { 'x-client': 'habitica-ios' },
        );
        const username = generateRandomUserName();
        const email = `${username}@example.com`;
        const password = 'password';

        const user = await api.post('/user/auth/local/register', {
          username,
          email,
          password,
          confirmPassword: password,
        });

        const requests = new ApiUser(user);

        const habits = await requests.get('/tasks/user?type=habits');
        const dailys = await requests.get('/tasks/user?type=dailys');
        const todos = await requests.get('/tasks/user?type=todos');
        const rewards = await requests.get('/tasks/user?type=rewards');
        const tags = await requests.get('/tags');

        expect(habits).to.have.a.lengthOf(0);
        expect(dailys).to.have.a.lengthOf(0);
        expect(todos).to.have.a.lengthOf(0);
        expect(rewards).to.have.a.lengthOf(0);
        expect(tags).to.have.a.lengthOf(0);
      });
    });

    xit('enrolls new users in an A/B test', async () => {
      const username = generateRandomUserName();
      const email = `${username}@example.com`;
      const password = 'password';

      const user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      await expect(getProperty('users', user._id, '_ABtests')).to.eventually.be.a('object');
    });

    it('includes items awarded by default when creating a new user', async () => {
      const username = generateRandomUserName();
      const email = `${username}@example.com`;
      const password = 'password';

      const user = await api.post('/user/auth/local/register', {
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
      const username = generateRandomUserName();
      const email = `${username}@example.com`;
      const password = 'password';
      const confirmPassword = 'not password';

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

    it('requires minimum length for the password', async () => {
      const username = generateRandomUserName();
      const email = `${username}@example.com`;
      const password = '1234567';
      const confirmPassword = '1234567';

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

    it('enforces maximum length for the password', async () => {
      const username = generateRandomUserName();
      const email = `${username}@example.com`;
      const password = '12345678910111213141516171819202122232425262728293031323334353637383940';
      const confirmPassword = '12345678910111213141516171819202122232425262728293031323334353637383940';

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
      const email = `${generateRandomUserName()}@example.com`;
      const password = 'password';
      const confirmPassword = 'password';

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
      const username = generateRandomUserName();
      const password = 'password';

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
      const username = generateRandomUserName();
      const email = 'notanemail@sdf';
      const password = 'password';

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

    it('sanitizes email params to a lowercase string before creating the user', async () => {
      const username = generateRandomUserName();
      const email = 'ISANEmAiL@ExAmPle.coM';
      const password = 'password';

      const user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.auth.local.email).to.equal(email.toLowerCase());
    });

    it('fails on a habitica.com email', async () => {
      const username = generateRandomUserName();
      const email = `${username}@habitica.com`;
      const password = 'password';

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
      const username = generateRandomUserName();
      const email = `${username}@habitrpg.com`;
      const password = 'password';

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
      const username = generateRandomUserName();
      const email = `${username}@example.com`;
      const confirmPassword = 'password';

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
    const email = 'some@email.net';
    const username = 'some-username';
    const password = 'some-password';
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

  context('attach to google user', () => {
    let user;
    const email = 'some@email-google.net';
    const username = 'some-username-google';
    const password = 'some-password';
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
      await user.update({ 'auth.google.id': 'some-google-id', 'auth.local': { ok: true } });
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

  context('attach to apple user', () => {
    let user;
    const email = 'some@email-apple.net';
    const username = 'some-username-apple';
    const password = 'some-password';
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
      await user.update({ 'auth.apple.id': 'some-apple-id', 'auth.local': { ok: true } });
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
    let username; let email; let
      api;

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
      const uniqueEmail = `${generateRandomUserName()}@exampe.com`;
      const password = 'password';

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
      const uniqueUsername = generateRandomUserName();
      const password = 'password';

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
    let api; let username; let email; let
      password;

    beforeEach(() => {
      api = requester();
      username = generateRandomUserName();
      email = `${username}@example.com`;
      password = 'password';
    });

    it('does not crash the signup process when it\'s invalid', async () => {
      const user = await api.post('/user/auth/local/register?groupInvite=aaaaInvalid', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user._id).to.be.a('string');
    });

    it('supports invite using req.query.groupInvite', async () => {
      const { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'party', privacy: 'private' },
      });

      const invite = encrypt(JSON.stringify({
        id: group._id,
        inviter: groupLeader._id,
        sentAt: Date.now(), // so we can let it expire
      }));

      const user = await api.post(`/user/auth/local/register?groupInvite=${invite}`, {
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
      const { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'party', privacy: 'private' },
      });

      const invite = encrypt(JSON.stringify({
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
      const { group, groupLeader } = await createAndPopulateGroup({
        groupDetails: { type: 'party', privacy: 'private' },
      });

      const invite = encrypt(JSON.stringify({
        id: group._id,
        inviter: groupLeader._id,
        sentAt: Date.now() - 6.912e8, // 8 days old
      }));

      const user = await api.post(`/user/auth/local/register?groupInvite=${invite}`, {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.invitations.party).to.eql({});
    });
  });

  context('successful login via api', () => {
    let api; let username; let email; let
      password;

    beforeEach(() => {
      api = requester();
      username = generateRandomUserName();
      email = `${username}@example.com`;
      password = 'password';
    });

    it('sets all site tour values to -2 (already seen)', async () => {
      const user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.flags.tour).to.not.be.empty;

      each(user.flags.tour, value => {
        expect(value).to.eql(-2);
      });
    });

    it('populates user with default todos, not no other task types', async () => {
      const user = await api.post('/user/auth/local/register', {
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
      const user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.tags).to.not.be.empty;
    });
  });

  context('successful login with habitica-web header', () => {
    let api; let username; let email; let
      password;

    beforeEach(() => {
      api = requester({}, { 'x-client': 'habitica-web' });
      username = generateRandomUserName();
      email = `${username}@example.com`;
      password = 'password';
    });

    it('sets all common tutorial flags to true', async () => {
      const user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.flags.tour).to.not.be.empty;

      each(user.flags.tutorial.common, value => {
        expect(value).to.eql(true);
      });
    });

    it('populates user with default todos, habits, and rewards', async () => {
      const user = await api.post('/user/auth/local/register', {
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
      const user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      expect(user.tags).to.not.be.empty;
    });

    it('adds the correct tags to the correct tasks', async () => {
      const user = await api.post('/user/auth/local/register', {
        username,
        email,
        password,
        confirmPassword: password,
      });

      const requests = new ApiUser(user);

      const habits = await requests.get('/tasks/user?type=habits');
      const todos = await requests.get('/tasks/user?type=todos');

      expect(habits).to.have.a.lengthOf(0);
      expect(todos).to.have.a.lengthOf(0);
    });
  });
});
