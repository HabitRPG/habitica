/* eslint-disable global-require */
import forEach from 'lodash/forEach';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';

function makeArmoireIitemList () {
  const {
    armor,
    body,
    eyewear,
    head,
    headAccessory,
    shield,
    weapon,
  } = require('../../website/common/script/content/gear/sets/armoire');
  const items = [];
  items.push(...Object.values(armor));
  items.push(...Object.values(body));
  items.push(...Object.values(eyewear));
  items.push(...Object.values(head));
  items.push(...Object.values(headAccessory));
  items.push(...Object.values(shield));
  items.push(...Object.values(weapon));
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
    clock = sinon.useFakeTimers(new Date('2024-01-01'));
    const items = makeArmoireIitemList();
    expect(items.length).to.equal(377);
    forEach(items, item => {
      expect(item.released).to.be.true;
    });
  });

  it('released gear has all required properties', async () => {
    clock = sinon.useFakeTimers(new Date('2024-05-08'));
    const items = makeArmoireIitemList();
    expect(items.length).to.equal(392);
    forEach(items, item => {
      if (item.set !== undefined) {
        expect(item.set).to.be.a('string');
        expect(item.set).to.not.be.empty;
      }
      expectValidTranslationString(item.text);
      expect(item.released).to.be.a('boolean');
      expect(item.value).to.be.a('number');
    });
  });

  it('releases gear when appropriate', async () => {
    clock = sinon.useFakeTimers(new Date('2024-01-01'));
    const items = makeArmoireIitemList();
    expect(items.length).to.equal(377);
    clock.restore();
    delete require.cache[require.resolve('../../website/common/script/content/gear/sets/armoire')];
    clock = sinon.useFakeTimers(new Date('2024-01-08'));
    const januaryItems = makeArmoireIitemList();
    expect(januaryItems.length).to.equal(381);
    clock.restore();
    delete require.cache[require.resolve('../../website/common/script/content/gear/sets/armoire')];
    clock = sinon.useFakeTimers(new Date('2024-02-20'));
    const febuaryItems = makeArmoireIitemList();
    expect(febuaryItems.length).to.equal(384);
  });
});
