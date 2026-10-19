import nconf from 'nconf';
import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /export/admin/:userId/*', () => {
  let admin;
  let member;

  before(async () => {
    admin = await generateUser({ 'permissions.userSupport': true });
    member = await generateUser();
    await member.post('/tasks/user', [
      { type: 'habit', text: 'habit 1' },
    ]);
  });

  let nconfStub;

  beforeEach(() => {
    nconfStub = sandbox.stub(nconf, 'get').callThrough();
    nconfStub.withArgs('ENABLE_ADMIN_PANEL').returns('true');
  });

  afterEach(() => {
    nconfStub.restore();
  });

  it('requires the userSupport permission', async () => {
    const nonAdmin = await generateUser();

    await expect(nonAdmin.get(`/export/admin/${member._id}/userdata.json`))
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('noPrivAccess'),
      });
  });

  it('handles non-existing users', async () => {
    const dummyId = generateUUID();

    await expect(admin.get(`/export/admin/${dummyId}/userdata.json`))
      .to.eventually.be.rejected.and.eql({
        code: 404,
        error: 'NotFound',
        message: t('userWithIDNotFound', { userId: dummyId }),
      });
  });

  it('returns the data of the requested user as JSON', async () => {
    const res = await admin.get(`/export/admin/${member._id}/userdata.json`);

    expect(res._id).to.equal(member._id);
    expect(res.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(res.tasks.habits.length).to.equal(1);
    expect(res.tasks.habits[0].text).to.equal('habit 1');
  });

  it('returns the task history of the requested user as CSV', async () => {
    const res = await admin.get(`/export/admin/${member._id}/history.csv`);

    expect(res.split('\n')[0]).to.equal('Task Name,Task ID,Task Type,Date,Value');
  });

  ['history.csv', 'userdata.json', 'userdata.xml', 'inbox.html'].forEach(file => {
    it(`does not export ${file} when the admin panel is disabled`, async () => {
      nconfStub.withArgs('ENABLE_ADMIN_PANEL').returns('false');

      await expect(admin.get(`/export/admin/${member._id}/${file}`))
        .to.eventually.be.rejected.and.have.property('code', 404);
    });
  });
});
