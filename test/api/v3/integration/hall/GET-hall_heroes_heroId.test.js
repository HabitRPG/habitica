import { v4 as generateUUID } from 'uuid';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /heroes/:heroId', () => {
  let user;

  const heroFields = [
    '_id', 'id', 'auth', 'balance', 'contributor', 'flags', 'items',
    'lastCron', 'party', 'preferences', 'profile', 'purchased', 'secret',
  ];

  before(async () => {
    user = await generateUser({
      permissions: { userSupport: true },
    });
  });

  it('requires the caller to be an admin', async () => {
    const nonAdmin = await generateUser();

    await expect(nonAdmin.get(`/hall/heroes/${user._id}`)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('noPrivAccess'),
    });
  });

  it('validates req.params.heroId', async () => {
    await expect(user.get('/hall/heroes/invalidUUID')).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userWithIDNotFound', { userId: 'invalidUUID' }),
    });
  });

  it('handles non-existing heroes', async () => {
    const dummyId = generateUUID();
    await expect(user.get(`/hall/heroes/${dummyId}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userWithIDNotFound', { userId: dummyId }),
    });
  });

  it('returns only necessary hero data given user id', async () => {
    const hero = await generateUser({
      contributor: { tier: 23 },
      secret: {
        text: 'Super Hero',
      },
    });
    const heroRes = await user.get(`/hall/heroes/${hero._id}`);

    expect(heroRes).to.have.all.keys(heroFields); // works as: object has all and only these keys
    expect(heroRes.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(heroRes.profile).to.have.all.keys(['name']);
    expect(heroRes.secret.text).to.be.eq('Super Hero');
  });

  it('returns only necessary hero data given username', async () => {
    const hero = await generateUser({
      contributor: { tier: 23 },
    });
    const heroRes = await user.get(`/hall/heroes/${hero.auth.local.username}`);

    expect(heroRes).to.have.all.keys(heroFields);
    expect(heroRes.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(heroRes.profile).to.have.all.keys(['name']);
  });

  it('returns correct hero using search with difference case', async () => {
    await generateUser({}, { username: 'TestUpperCaseName123' });
    const heroRes = await user.get('/hall/heroes/TestuPPerCasEName123');
    expect(heroRes.auth.local.username).to.equal('TestUpperCaseName123');
  });
});
