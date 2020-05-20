import {
  generateUser,
  resetHabiticaDB,
} from '../../../../helpers/api-integration/v3';

describe('GET /hall/heroes', () => {
  it('returns all heroes sorted by -contributor.level and with correct fields', async () => {
    await resetHabiticaDB();

    const nonHero = await generateUser();
    const hero1 = await generateUser({
      contributor: { level: 1 },
      secret: {
        text: 'Super-Hero',
      },
    });
    const hero2 = await generateUser({
      contributor: { level: 3 },
    });

    const heroes = await nonHero.get('/hall/heroes');
    expect(heroes.length).to.equal(2);
    expect(heroes[0]._id).to.equal(hero2._id);
    expect(heroes[1]._id).to.equal(hero1._id);

    expect(heroes[0]).to.have.all.keys(['_id', 'contributor', 'backer', 'profile']);

    // should not contain the secret
    expect(heroes[1]).to.have.all.keys(['_id', 'contributor', 'backer', 'profile']);

    expect(heroes[0].profile).to.have.all.keys(['name']);
    expect(heroes[1].profile).to.have.all.keys(['name']);

    expect(heroes[0].profile.name).to.equal(hero2.profile.name);
    expect(heroes[1].profile.name).to.equal(hero1.profile.name);
    expect(heroes[1].secret).to.equal(undefined);
  });
});
