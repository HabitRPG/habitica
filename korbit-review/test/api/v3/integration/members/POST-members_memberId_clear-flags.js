import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /members/:memberId/clear-flags', () => {
  let reporter;
  let admin;
  let moderator;

  beforeEach(async () => {
    reporter = await generateUser();
    admin = await generateUser({ permissions: { userSupport: true } });
    moderator = await generateUser({ permissions: { moderator: true } });
    await reporter.post(`/members/${admin._id}/flag`);
  });

  context('error cases', () => {
    it('returns error when memberId is not a UUID', async () => {
      await expect(moderator.post('/members/gribbly/clear-flags'))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: t('invalidReqParams'),
        });
    });

    it('returns error when member with UUID is not found', async () => {
      const randomId = generateUUID();

      await expect(moderator.post(`/members/${randomId}/clear-flags`))
        .to.eventually.be.rejected.and.eql({
          code: 404,
          error: 'NotFound',
          message: t('userWithIDNotFound', { userId: randomId }),
        });
    });

    it('returns error when requesting user is not a moderator', async () => {
      await expect(reporter.post(`/members/${admin._id}/clear-flags`))
        .to.eventually.be.rejected.and.eql({
          code: 400,
          error: 'BadRequest',
          message: 'Only a moderator may clear reports from a profile.',
        });
    });
  });

  context('valid request', () => {
    it('removes a single flag from user', async () => {
      await expect(moderator.post(`/members/${admin._id}/clear-flags`)).to.eventually.be.ok;
      const updatedTarget = await admin.get(`/hall/heroes/${admin._id}`);
      expect(updatedTarget.profile.flags).to.eql({});
    });

    it('removes multiple flags from user', async () => {
      await moderator.post(`/members/${admin._id}/flag`);
      await expect(moderator.post(`/members/${admin._id}/clear-flags`)).to.eventually.be.ok;
      const updatedTarget = await admin.get(`/hall/heroes/${admin._id}`);
      expect(updatedTarget.profile.flags).to.eql({});
    });
  });
});
