import { v4 as generateUUID } from 'uuid';
import moment from 'moment';
import nconf from 'nconf';
import { IncomingWebhook } from '@slack/webhook';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /members/:memberId/flag', () => {
  let reporter;
  let target;

  beforeEach(async () => {
    reporter = await generateUser();
    target = await generateUser({
      'profile.blurb': 'Naughty Text',
      'profile.imageUrl': 'https://evil.com/',
    });
  });

  context('error cases', () => {
    it('returns error when memberId is not a UUID', async () => {
      await expect(reporter.post('/members/gribbly/flag'))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('invalidReqParams'),
        });
    });

    it('returns error when member with UUID is not found', async () => {
      const randomId = generateUUID();

      await expect(reporter.post(`/members/${randomId}/flag`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('userWithIDNotFound', { userId: randomId }),
        });
    });

    it('returns error when non-admin flags same profile twice', async () => {
      await reporter.post(`/members/${target._id}/flag`);
      await expect(reporter.post(`/members/${target._id}/flag`))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: 'A profile can not be flagged more than once by the same user.',
        });
    });
  });

  context('valid request', () => {
    let admin;
    const comment = 'this profile is bad';
    const source = 'Third Party Script';

    beforeEach(async () => {
      admin = await generateUser({ 'permissions.userSupport': true });
      sandbox.stub(IncomingWebhook.prototype, 'send').returns(Promise.resolve());
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('adds flags object to target user', async () => {
      await reporter.post(`/members/${target._id}/flag`);
      const updatedTarget = await admin.get(`/hall/heroes/${target._id}`);
      expect(updatedTarget.profile.flags[reporter._id]).to.have.all.keys([
        'timestamp',
      ]);
      expect(moment(updatedTarget.profile.flags[reporter._id].timestamp).toDate()).to.be.a('date');
    });

    it('allows addition of a comment and source', async () => {
      await reporter.post(`/members/${target._id}/flag`, {
        comment,
        source,
      });
      const updatedTarget = await admin.get(`/hall/heroes/${target._id}`);
      expect(updatedTarget.profile.flags[reporter._id].comment).to.eql(comment);
      expect(updatedTarget.profile.flags[reporter._id].source).to.eql(source);
    });

    it('allows moderator to flag twice', async () => {
      const moderator = await generateUser({ 'permissions.moderator': true });
      await moderator.post(`/members/${target._id}/flag`);
      await expect(moderator.post(`/members/${target._id}/flag`)).to.eventually.be.ok;
    });

    it('allows multiple non-moderators to flag individually', async () => {
      await admin.post(`/members/${target._id}/flag`);
      await reporter.post(`/members/${target._id}/flag`);
      const updatedTarget = await admin.get(`/hall/heroes/${target._id}`);
      expect(updatedTarget.profile.flags[admin._id]).to.exist;
      expect(updatedTarget.profile.flags[reporter._id]).to.exist;
    });

    it('sends a flag report to moderation Slack', async () => {
      const BASE_URL = nconf.get('BASE_URL');
      await reporter.post(`/members/${target._id}/flag`, {
        comment,
        source,
      });

      /* eslint-disable camelcase */
      expect(IncomingWebhook.prototype.send).to.be.calledWith({
        text: `@${reporter.auth.local.username} (${reporter._id}; language: ${reporter.preferences.language}) flagged @${target.auth.local.username}'s profile from ${source} and commented: ${comment}`,
        attachments: [{
          fallback: 'Flag Profile',
          color: 'danger',
          title: 'User Profile Report',
          title_link: `${BASE_URL}/profile/${target._id}`,
          text: `Display Name: ${target.profile.name}\n\nImage URL: ${target.profile.imageUrl}\n\nAbout: ${target.profile.blurb}`,
          mrkdwn_in: [
            'text',
          ],
        }],
      });
      /* eslint-enable camelcase */
    });

    it('excludes empty fields when sending Slack message', async () => {
      const BASE_URL = nconf.get('BASE_URL');
      await reporter.post(`/members/${admin._id}/flag`, {
        comment,
        source,
      });

      /* eslint-disable camelcase */
      expect(IncomingWebhook.prototype.send).to.be.calledWith({
        text: `@${reporter.auth.local.username} (${reporter._id}; language: ${reporter.preferences.language}) flagged @${admin.auth.local.username}'s profile from ${source} and commented: ${comment}`,
        attachments: [{
          fallback: 'Flag Profile',
          color: 'danger',
          title: 'User Profile Report',
          title_link: `${BASE_URL}/profile/${admin._id}`,
          text: `Display Name: ${admin.profile.name}`,
          mrkdwn_in: [
            'text',
          ],
        }],
      });
      /* eslint-enable camelcase */
    });
  });
});
