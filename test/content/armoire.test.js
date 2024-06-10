/* eslint-disable global-require */
import forEach from 'lodash/forEach';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';

function makeArmoireIitemList () {
  const armoire = require('../../website/common/script/content/gear/sets/armoire').default;
  const items = [];
  items.push(...Object.values(armoire.armor));
  items.push(...Object.values(armoire.body));
  items.push(...Object.values(armoire.eyewear));
  items.push(...Object.values(armoire.head));
  items.push(...Object.values(armoire.headAccessory));
  items.push(...Object.values(armoire.shield));
  items.push(...Object.values(armoire.weapon));
  return items;
}

describe('armoire', () => {
  let clock;
  beforeEach(() => {
    delete require.cache[require.resolve('../../website/common/script/content/gear/sets/armoire')];
  });
  afterEach(() => {
    clock.restore();
  });
  it('does not return unreleased gear', async () => {
    clock = sinon.useFakeTimers(new Date('2024-01-02'));
    const items = makeArmoireIitemList();
    expect(items.length).to.equal(377);
    expect(items.filter(item => item.set === 'pottersSet' || item.set === 'optimistSet' || item.set === 'schoolUniform')).to.be.an('array').that.is.empty;
  });

  it('released gear has all required properties', async () => {
    clock = sinon.useFakeTimers(new Date('2024-05-08'));
    const items = makeArmoireIitemList();
    expect(items.length).to.equal(396);
    forEach(items, item => {
      if (item.set !== undefined) {
        expect(item.set, item.key).to.be.a('string');
        expect(item.set, item.key).to.not.be.empty;
      }
      expectValidTranslationString(item.text);
      expect(item.value, item.key).to.be.a('number');
    });
  });

  it('releases gear when appropriate', async () => {
    clock = sinon.useFakeTimers(new Date('2024-01-01T00:00:00.000Z'));
    const items = makeArmoireIitemList();
    expect(items.length).to.equal(377);
    clock.restore();
    delete require.cache[require.resolve('../../website/common/script/content/gear/sets/armoire')];
    clock = sinon.useFakeTimers(new Date('2024-01-08'));
    const januaryItems = makeArmoireIitemList();
    expect(januaryItems.length).to.equal(381);
    clock.restore();
    delete require.cache[require.resolve('../../website/common/script/content/gear/sets/armoire')];
    clock = sinon.useFakeTimers(new Date('2024-02-07'));
    const januaryItems2 = makeArmoireIitemList();
    expect(januaryItems2.length).to.equal(381);
    clock.restore();
    delete require.cache[require.resolve('../../website/common/script/content/gear/sets/armoire')];
    clock = sinon.useFakeTimers(new Date('2024-02-07T09:00:00.000Z'));
    const febuaryItems = makeArmoireIitemList();
    expect(febuaryItems.length).to.equal(384);
  });
});
