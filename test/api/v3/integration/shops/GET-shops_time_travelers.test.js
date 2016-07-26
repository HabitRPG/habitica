import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('GET /shops/time-travelers', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns a valid shop object', async () => {
    let shop = await user.get('/shops/time-travelers');

    expect(shop.identifier).to.equal('timeTravelersShop');
    expect(shop.text).to.eql(t('timeTravelers'));
    expect(shop.notes).to.be.a('string');
    expect(shop.imageName).to.be.a('string');
    expect(shop.categories).to.be.an('array');

    let categories = shop.categories.map(cat => cat.identifier);

    expect(categories).to.include('pets');
    expect(categories).to.include('mounts');
    expect(categories).to.include('201606');

    let mammothPet = shop.categories
      .find(cat => cat.identifier === 'pets')
      .items
      .find(pet => pet.key === 'Mammoth-Base');
    let mantisShrimp = shop.categories
      .find(cat => cat.identifier === 'mounts')
      .items
      .find(pet => pet.key === 'MantisShrimp-Base');

    expect(mammothPet).to.exist;
    expect(mantisShrimp).to.exist;
  });

  it('returns active shop notes and imageName if user has trinkets', async () => {
    await user.update({
      'purchased.plan.consecutive.trinkets': 1,
    });

    let shop = await user.get('/shops/time-travelers');

    expect(shop.notes).to.eql(t('timeTravelersPopover'));
    expect(shop.imageName).to.eql('npc_timetravelers_active');
  });

  it('returns inactive shop notes and imageName if user has trinkets', async () => {
    let shop = await user.get('/shops/time-travelers');

    expect(shop.notes).to.eql(t('timeTravelersPopoverNoSubMobile'));
    expect(shop.imageName).to.eql('npc_timetravelers');
  });

  it('does not return mystery sets that are already owned', async () => {
    await user.update({
      'items.gear.owned': {
        head_mystery_201606: true, // eslint-disable-line camelcase
        armor_mystery_201606: true, // eslint-disable-line camelcase
      },
    });

    let shop = await user.get('/shops/time-travelers');

    let categories = shop.categories.map(cat => cat.identifier);

    expect(categories).to.not.include('201606');
  });

  it('does not return pets and mounts that user already owns', async () => {
    await user.update({
      'items.mounts': {
        'MantisShrimp-Base': true,
      },
      'items.pets': {
        'Mammoth-Base': 5,
      },
    });

    let shop = await user.get('/shops/time-travelers');

    let mammothPet = shop.categories
      .find(cat => cat.identifier === 'pets')
      .items
      .find(pet => pet.key === 'Mammoth-Base');
    let mantisShrimp = shop.categories
      .find(cat => cat.identifier === 'mounts')
      .items
      .find(pet => pet.key === 'MantisShrimp-Base');

    expect(mammothPet).to.not.exist;
    expect(mantisShrimp).to.not.exist;
  });
});
