/* eslint-disable global-require */
import forEach from 'lodash/forEach';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';
import armoire from '../../website/common/script/content/gear/sets/armoire';

describe('armoire', () => {
  let clock;
  afterEach(() => {
    if (clock) {
      clock.restore();
    }
  });

  it('does not return unreleased gear', async () => {
    clock = sinon.useFakeTimers(new Date('2024-01-02'));
    const items = armoire.all;
    expect(items.length).to.equal(377);
    expect(items.filter(item => item.set === 'pottersSet' || item.set === 'optimistSet' || item.set === 'schoolUniform')).to.be.an('array').that.is.empty;
  });

  it('released gear has all required properties', async () => {
    clock = sinon.useFakeTimers(new Date('2024-05-08'));
    const items = armoire.all;
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
    const items = armoire.all;
    expect(items.length).to.equal(377);
    clock.restore();
    delete require.cache[require.resolve('../../website/common/script/content/gear/sets/armoire')];
    clock = sinon.useFakeTimers(new Date('2024-01-08'));
    const januaryItems = armoire.all;
    expect(januaryItems.length).to.equal(381);
    clock.restore();
    delete require.cache[require.resolve('../../website/common/script/content/gear/sets/armoire')];
    clock = sinon.useFakeTimers(new Date('2024-02-07'));
    const januaryItems2 = armoire.all;
    expect(januaryItems2.length).to.equal(381);
    clock.restore();
    delete require.cache[require.resolve('../../website/common/script/content/gear/sets/armoire')];
    clock = sinon.useFakeTimers(new Date('2024-02-07T09:00:00.000Z'));
    const febuaryItems = armoire.all;
    expect(febuaryItems.length).to.equal(384);
  });

  it('sets have at least 2 items', () => {
    const setMap = {};
    forEach(armoire.all, item => {
      // Gotta have one outlier
      if (!item.set || item.set.startsWith('armoire-')) return;
      if (setMap[item.set] === undefined) {
        setMap[item.set] = 0;
      }
      setMap[item.set] += 1;
    });
    Object.keys(setMap).forEach(set => {
      expect(setMap[set], set).to.be.at.least(2);
    });
  });
});
