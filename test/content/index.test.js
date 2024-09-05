import content from '../../website/common/script/content';

describe('content index', () => {
  let clock;

  afterEach(() => {
    if (clock) {
      clock.restore();
    }
  });

  it('Releases eggs when appropriate without needing restarting', () => {
    clock = sinon.useFakeTimers(new Date('2024-06-20'));
    const mayEggs = content.eggs;
    expect(mayEggs.Chameleon).to.not.exist;
    clock.restore();
    clock = sinon.useFakeTimers(new Date('2024-07-20'));
    const juneEggs = content.eggs;
    expect(juneEggs.Chameleon).to.exist;
    expect(Object.keys(mayEggs).length, '').to.equal(Object.keys(juneEggs).length - 1);
  });

  it('Releases hatching potions when appropriate without needing restarting', () => {
    clock = sinon.useFakeTimers(new Date('2024-05-20'));
    const mayHatchingPotions = content.hatchingPotions;
    expect(mayHatchingPotions.Koi).to.not.exist;
    clock.restore();
    clock = sinon.useFakeTimers(new Date('2024-06-20'));
    const juneHatchingPotions = content.hatchingPotions;
    expect(juneHatchingPotions.Koi).to.exist;
    expect(Object.keys(mayHatchingPotions).length, '').to.equal(Object.keys(juneHatchingPotions).length - 1);
  });

  it('Releases armoire gear when appropriate without needing restarting', () => {
    clock = sinon.useFakeTimers(new Date('2024-06-20'));
    const juneGear = content.gear.flat;
    expect(juneGear.armor_armoire_corsairsCoatAndCape).to.not.exist;
    clock.restore();
    clock = sinon.useFakeTimers(new Date('2024-07-10'));
    const julyGear = content.gear.flat;
    expect(julyGear.armor_armoire_corsairsCoatAndCape).to.exist;
    expect(Object.keys(juneGear).length, '').to.equal(Object.keys(julyGear).length - 3);
  });

  it('Releases pets when appropriate without needing restarting', () => {
    clock = sinon.useFakeTimers(new Date('2024-06-20'));
    const junePets = content.petInfo;
    expect(junePets['Chameleon-Base']).to.not.exist;
    clock.restore();
    clock = sinon.useFakeTimers(new Date('2024-07-18'));
    const julyPets = content.petInfo;
    expect(julyPets['Chameleon-Base']).to.exist;
    expect(Object.keys(junePets).length, '').to.equal(Object.keys(julyPets).length - 10);
  });

  it('Releases mounts when appropriate without needing restarting', () => {
    clock = sinon.useFakeTimers(new Date('2024-06-20'));
    const juneMounts = content.mountInfo;
    expect(juneMounts['Chameleon-Base']).to.not.exist;
    clock.restore();
    clock = sinon.useFakeTimers(new Date('2024-07-18'));
    const julyMounts = content.mountInfo;
    expect(julyMounts['Chameleon-Base']).to.exist;
    expect(Object.keys(juneMounts).length, '').to.equal(Object.keys(julyMounts).length - 10);
  });

  it('marks regular food as buyable and droppable without any events', () => {
    clock = sinon.useFakeTimers(new Date('2024-06-20'));
    const { food } = content;
    Object.keys(food).forEach(key => {
      if (key === 'Saddle') {
        expect(food[key].canBuy(), `${key} canBuy`).to.be.true;
        expect(food[key].canDrop, `${key} canDrop`).to.be.false;
        return;
      }
      let expected = true;
      if (key.startsWith('Cake_')) {
        expected = false;
      } else if (key.startsWith('Candy_')) {
        expected = false;
      } else if (key.startsWith('Pie_')) {
        expected = false;
      }
      expect(food[key].canBuy(), `${key} canBuy`).to.equal(expected);
      expect(food[key].canDrop, `${key} canDrop`).to.equal(expected);
    });
  });

  it('marks candy as buyable and droppable during habitoween', () => {
    clock = sinon.useFakeTimers(new Date('2024-10-31'));
    const { food } = content;
    Object.keys(food).forEach(key => {
      if (key === 'Saddle') {
        expect(food[key].canBuy(), `${key} canBuy`).to.be.true;
        expect(food[key].canDrop, `${key} canDrop`).to.be.false;
        return;
      }
      let expected = false;
      if (key.startsWith('Cake_')) {
        expected = false;
      } else if (key.startsWith('Candy_')) {
        expected = true;
      } else if (key.startsWith('Pie_')) {
        expected = false;
      }
      expect(food[key].canBuy(), `${key} canBuy`).to.equal(expected);
      expect(food[key].canDrop, `${key} canDrop`).to.equal(expected);
    });
  });

  it('marks cake as buyable and droppable during birthday', () => {
    clock = sinon.useFakeTimers(new Date('2024-01-31'));
    const { food } = content;
    Object.keys(food).forEach(key => {
      if (key === 'Saddle') {
        expect(food[key].canBuy(), `${key} canBuy`).to.be.true;
        expect(food[key].canDrop, `${key} canDrop`).to.be.false;
        return;
      }
      let expected = false;
      if (key.startsWith('Cake_')) {
        expected = true;
      } else if (key.startsWith('Candy_')) {
        expected = false;
      } else if (key.startsWith('Pie_')) {
        expected = false;
      }
      expect(food[key].canBuy(), `${key} canBuy`).to.equal(expected);
      expect(food[key].canDrop, `${key} canDrop`).to.equal(expected);
    });
  });

  it('marks pie as buyable and droppable during pi day', () => {
    clock = sinon.useFakeTimers(new Date('2024-03-15'));
    const { food } = content;
    Object.keys(food).forEach(key => {
      if (key === 'Saddle') {
        expect(food[key].canBuy(), `${key} canBuy`).to.be.true;
        expect(food[key].canDrop, `${key} canDrop`).to.be.false;
        return;
      }
      let expected = false;
      if (key.startsWith('Cake_')) {
        expected = false;
      } else if (key.startsWith('Candy_')) {
        expected = false;
      } else if (key.startsWith('Pie_')) {
        expected = true;
      }
      expect(food[key].canBuy(), `${key} canBuy`).to.equal(expected);
      expect(food[key].canDrop, `${key} canDrop`).to.equal(expected);
    });
  });
});
