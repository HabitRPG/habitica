import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('GET /heroes/:heroId', () => {
  let user;

  before(async () => {
    user = await generateUser({
      contributor: {admin: true},
    });
  });

  it('requires the caller to be an admin', async () => {
    let nonAdmin = await generateUser();

    await expect(nonAdmin.get(`/hall/heroes/${user._id}`)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('noAdminAccess'),
    });
  });

  it('validates req.params.heroId', async () => {
    await expect(user.get('/hall/heroes/invalidUUID')).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userWithIDNotFound', {userId: 'invalidUUID'}),
    });
  });

  it('handles non-existing heroes', async () => {
    let dummyId = generateUUID();
    await expect(user.get(`/hall/heroes/${dummyId}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userWithIDNotFound', {userId: dummyId}),
    });
  });

  it('returns only necessary hero data given user id', async () => {
    let hero = await generateUser({
      contributor: {tier: 23},
    });
    let heroRes = await user.get(`/hall/heroes/${hero._id}`);

    expect(heroRes).to.have.all.keys([ // works as: object has all and only these keys
      '_id', 'id', 'balance', 'profile', 'purchased',
      'contributor', 'auth', 'items',
    ]);
    expect(heroRes.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(heroRes.profile).to.have.all.keys(['name']);
  });

  it('returns only necessary hero data given username', async () => {
    let hero = await generateUser({
      contributor: {tier: 23},
    });
    let heroRes = await user.get(`/hall/heroes/${hero.auth.local.username}`);

    expect(heroRes).to.have.all.keys([ // works as: object has all and only these keys
      '_id', 'id', 'balance', 'profile', 'purchased',
      'contributor', 'auth', 'items',
    ]);
    expect(heroRes.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(heroRes.profile).to.have.all.keys(['name']);
  });

  it('returns correct hero using search with difference case', async () => {
    await generateUser({}, { username: 'TestUpperCaseName123' });
    let heroRes = await user.get('/hall/heroes/TestuPPerCasEName123');
    expect(heroRes.auth.local.username).to.equal('TestUpperCaseName123');
  });
});
