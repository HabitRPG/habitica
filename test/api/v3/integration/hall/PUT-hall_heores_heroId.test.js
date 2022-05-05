import { v4 as generateUUID } from 'uuid';
import { model as User } from '../../../../../website/server/models/user';
import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('PUT /heroes/:heroId', () => {
  let user;

  const heroFields = [
    '_id', 'auth', 'balance', 'contributor', 'flags', 'items', 'lastCron',
    'party', 'preferences', 'profile', 'purchased', 'secret', 'permissions',
  ];

  before(async () => {
    user = await generateUser({ 'permissions.userSupport': true });
  });

  it('requires the caller to be an admin', async () => {
    const nonAdmin = await generateUser();

    await expect(nonAdmin.put(`/hall/heroes/${user._id}`)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('noPrivAccess'),
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
    const dummyId = generateUUID();
    await expect(user.put(`/hall/heroes/${dummyId}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('userWithIDNotFound', { userId: dummyId }),
    });
  });

  it('change contributor level, balance, ads', async () => {
    const hero = await generateUser();
    const prevBlockState = hero.auth.blocked;
    const prevSleepState = hero.preferences.sleep;
    const heroRes = await user.put(`/hall/heroes/${hero._id}`, {
      balance: 3,
      contributor: { level: 1 },
      purchased: { ads: true },
    });

    // test response
    expect(heroRes).to.have.all.keys(heroFields); // works as: object has all and only these keys
    expect(heroRes.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(heroRes.profile).to.have.all.keys(['name']);

    // test response values
    expect(heroRes.balance).to.equal(3 + 0.75); // 3+0.75 for first contrib level
    expect(heroRes.contributor.level).to.equal(1);
    expect(heroRes.purchased.ads).to.equal(true);
    // test hero values
    await hero.sync();
    expect(hero.balance).to.equal(3 + 0.75); // 3+0.75 for first contrib level
    expect(hero.contributor.level).to.equal(1);
    expect(hero.purchased.ads).to.equal(true);
    expect(hero.auth.blocked).to.equal(prevBlockState);
    expect(hero.preferences.sleep).to.equal(prevSleepState);
    expect(hero.notifications.length).to.equal(1);
    expect(hero.notifications[0].type).to.equal('NEW_CONTRIBUTOR_LEVEL');
  });

  it('block a user', async () => {
    const hero = await generateUser();
    const heroRes = await user.put(`/hall/heroes/${hero._id}`, {
      auth: { blocked: true },
      preferences: { sleep: true },
    });

    // test response values
    expect(heroRes.auth.blocked).to.equal(true);
    // test hero values
    await hero.sync();
    expect(hero.auth.blocked).to.equal(true);
    expect(hero.preferences.sleep).to.equal(true);
  });

  it('unblock a user', async () => {
    const hero = await generateUser();
    const prevSleepState = hero.preferences.sleep;
    const heroRes = await user.put(`/hall/heroes/${hero._id}`, {
      auth: { blocked: false },
    });

    // test response values
    expect(heroRes.auth.blocked).to.equal(false);
    // test hero values
    await hero.sync();
    expect(hero.auth.blocked).to.equal(false);
    expect(hero.preferences.sleep).to.equal(prevSleepState);
  });

  it('updates chatRevoked flag', async () => {
    const hero = await generateUser();
    await user.put(`/hall/heroes/${hero._id}`, {
      flags: { chatRevoked: true },
    });
    await hero.sync();
    expect(hero.flags.chatRevoked).to.eql(true);
  });

  it('updates chatShadowMuted flag', async () => {
    const hero = await generateUser();
    await user.put(`/hall/heroes/${hero._id}`, {
      flags: { chatShadowMuted: true },
    });
    await hero.sync();
    expect(hero.flags.chatShadowMuted).to.eql(true);
  });

  it('updates contributor level', async () => {
    const hero = await generateUser({
      contributor: { level: 5 },
    });
    const heroRes = await user.put(`/hall/heroes/${hero._id}`, {
      contributor: { level: 6 },
    });

    // test response
    expect(heroRes).to.have.all.keys(heroFields);
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
    const hero = await generateUser({
      contributor: { level: 5 },
    });
    const heroRes = await user.put(`/hall/heroes/${hero._id}`, {
      contributor: { text: 'Astronaut' },
    });

    // test response
    expect(heroRes).to.have.all.keys(heroFields);
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

  it('updates contributor secret', async () => {
    const secretText = 'my super hero';

    const hero = await generateUser({
      contributor: { level: 5 },
      secret: {
        text: 'supr hro typo',
      },
    });
    const heroRes = await user.put(`/hall/heroes/${hero._id}`, {
      contributor: { text: 'Astronaut' },
      secret: {
        text: secretText,
      },
    });

    // test response
    // works as: object has all and only these keys
    expect(heroRes).to.have.all.keys(heroFields);
    expect(heroRes.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(heroRes.profile).to.have.all.keys(['name']);

    // test response values
    expect(heroRes.contributor.level).to.equal(5); // doesn't modify previous values
    expect(heroRes.contributor.text).to.equal('Astronaut');
    expect(heroRes.secret.text).to.equal(secretText);

    // test hero values
    await hero.sync();
    expect(hero.contributor.level).to.equal(5); // doesn't modify previous values
    expect(hero.contributor.text).to.equal('Astronaut');
    expect(hero.secret.text).to.equal(secretText);
  });

  it('updates items', async () => {
    const hero = await generateUser();
    const heroRes = await user.put(`/hall/heroes/${hero._id}`, {
      itemPath: 'items.special.snowball',
      itemVal: 5,
    });

    // test response
    expect(heroRes).to.have.all.keys(heroFields);
    expect(heroRes.auth.local).not.to.have.keys(['salt', 'hashed_password']);
    expect(heroRes.profile).to.have.all.keys(['name']);

    // test response values
    expect(heroRes.items.special.snowball).to.equal(5);
    // test hero values
    await hero.sync();
    expect(hero.items.special.snowball).to.equal(5);
  });

  it('does not accidentally update API Token', async () => {
    // This test has been included because hall.js will contain code to produce
    // a truncated version of the API Token, and we want to be sure that
    // the real Token is not modified by bugs in that code.
    const hero = await generateUser();
    const originalToken = hero.apiToken;

    // make any change to the user except the Token
    await user.put(`/hall/heroes/${hero._id}`, {
      contributor: { text: 'Astronaut' },
    });

    const updatedHero = await User.findById(hero._id).exec();
    expect(updatedHero.apiToken).to.equal(originalToken);
    expect(updatedHero.apiTokenObscured).to.not.exist;
  });

  it('does update API Token when admin changes it', async () => {
    const hero = await generateUser();
    const originalToken = hero.apiToken;

    // change the user's API Token
    await user.put(`/hall/heroes/${hero._id}`, {
      changeApiToken: true,
    });

    const updatedHero = await User.findById(hero._id).exec();
    expect(updatedHero.apiToken).to.not.equal(originalToken);
    expect(updatedHero.apiTokenObscured).to.not.exist;
  });
});
