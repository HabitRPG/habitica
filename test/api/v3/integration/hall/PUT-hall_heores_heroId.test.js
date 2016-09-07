import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-v3-integration.helper';
import { v4 as generateUUID } from 'uuid';

describe('PUT /heroes/:heroId', () => {
  let user;

  before(async () => {
    user = await generateUser({
      contributor: {admin: true},
    });
  });

  it('requires the caller to be an admin', async () => {
    let nonAdmin = await generateUser();

    await expect(nonAdmin.put(`/hall/heroes/${user._id}`)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('noAdminAccess'),
    });
  });

  it('validates req.params.heroId', async () => {
    await expect(user.put('/hall/heroes/invalidUUID')).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('handles non-existing heroes', async () => {
    let dummyId = generateUUID();
    await expect(user.put(`/hall/heroes/${dummyId}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userWithIDNotFound', {userId: dummyId}),
    });
  });

  it('updates contributor level, balance, ads, blocked', async () => {
    let hero = await generateUser();
    let heroRes = await user.put(`/hall/heroes/${hero._id}`, {
      balance: 3,
      contributor: {level: 1},
      purchased: {ads: true},
      auth: {blocked: true},
    });

    // test response
    expect(heroRes).to.have.all.keys([ // works as: object has all and only these keys
      '_id', 'balance', 'profile', 'purchased',
      'contributor', 'auth', 'items', 'flags',
    ]);
    expect(heroRes.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(heroRes.profile).to.have.all.keys(['name']);

    // test response values
    expect(heroRes.balance).to.equal(3 + 0.75); // 3+0.75 for first contrib level
    expect(heroRes.contributor.level).to.equal(1);
    expect(heroRes.purchased.ads).to.equal(true);
    expect(heroRes.auth.blocked).to.equal(true);
    // test hero values
    await hero.sync();
    expect(hero.balance).to.equal(3 + 0.75); // 3+0.75 for first contrib level
    expect(hero.contributor.level).to.equal(1);
    expect(hero.purchased.ads).to.equal(true);
    expect(hero.auth.blocked).to.equal(true);
    expect(hero.preferences.sleep).to.equal(true);
    expect(hero.notifications.length).to.equal(1);
    expect(hero.notifications[0].type).to.equal('NEW_CONTRIBUTOR_LEVEL');
  });

  it('updates chatRevoked flag', async () => {
    let hero = await generateUser();

    await user.put(`/hall/heroes/${hero._id}`, {
      flags: {chatRevoked: true},
    });

    await hero.sync();

    expect(hero.flags.chatRevoked).to.eql(true);
  });

  it('updates contributor level', async () => {
    let hero = await generateUser({
      contributor: {level: 5},
    });
    let heroRes = await user.put(`/hall/heroes/${hero._id}`, {
      contributor: {level: 6},
    });

    // test response
    expect(heroRes).to.have.all.keys([ // works as: object has all and only these keys
      '_id', 'balance', 'profile', 'purchased',
      'contributor', 'auth', 'items', 'flags',
    ]);
    expect(heroRes.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(heroRes.profile).to.have.all.keys(['name']);

    // test response values
    expect(heroRes.balance).to.equal(1); // 0+1 for sixth contrib level
    expect(heroRes.contributor.level).to.equal(6);
    expect(heroRes.items.pets['Dragon-Hydra']).to.equal(5);
    // test hero values
    await hero.sync();
    expect(hero.balance).to.equal(1); // 0+1 for sixth contrib level
    expect(hero.contributor.level).to.equal(6);
    expect(hero.items.pets['Dragon-Hydra']).to.equal(5);
  });

  it('updates contributor data', async () => {
    let hero = await generateUser({
      contributor: {level: 5},
    });
    let heroRes = await user.put(`/hall/heroes/${hero._id}`, {
      contributor: {text: 'Astronaut'},
    });

    // test response
    expect(heroRes).to.have.all.keys([ // works as: object has all and only these keys
      '_id', 'balance', 'profile', 'purchased',
      'contributor', 'auth', 'items', 'flags',
    ]);
    expect(heroRes.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(heroRes.profile).to.have.all.keys(['name']);

    // test response values
    expect(heroRes.contributor.level).to.equal(5); // doesn't modify previous values
    expect(heroRes.contributor.text).to.equal('Astronaut');
    // test hero values
    await hero.sync();
    expect(hero.contributor.level).to.equal(5); // doesn't modify previous values
    expect(hero.contributor.text).to.equal('Astronaut');
  });

  it('updates items', async () => {
    let hero = await generateUser();
    let heroRes = await user.put(`/hall/heroes/${hero._id}`, {
      itemPath: 'items.special.snowball',
      itemVal: 5,
    });

    // test response
    expect(heroRes).to.have.all.keys([ // works as: object has all and only these keys
      '_id', 'balance', 'profile', 'purchased',
      'contributor', 'auth', 'items', 'flags',
    ]);
    expect(heroRes.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(heroRes.profile).to.have.all.keys(['name']);

    // test response values
    expect(heroRes.items.special.snowball).to.equal(5);
    // test hero values
    await hero.sync();
    expect(hero.items.special.snowball).to.equal(5);
  });
});
