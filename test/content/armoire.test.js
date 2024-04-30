/* eslint-disable global-require */
import forEach from 'lodash/forEach';

describe('armoire', () => {
  let clock;
  beforeEach(() => {
    clock = sinon.useFakeTimers(new Date('2024-01-01'));
  });
  afterEach(() => {
    clock.restore();
  });
  it('does not return unreleased gear', async () => {
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
    forEach(items, item => {
      expect(item.released).to.be.true;
    });
  });
});
