import * as armoireSet from '../../../website/common/script/content/gear/sets/armoire';

describe('armoireSet items', () => {
  it('checks if canOwn has the same id', () => {
    Object.keys(armoireSet).forEach(type => {
      Object.keys(armoireSet[type]).forEach(itemKey => {
        const ownedKey = `${type}_armoire_${itemKey}`;

        expect(armoireSet[type][itemKey].canOwn({
          items: {
            gear: {
              owned: {
                [ownedKey]: true,
              },
            },
          },
        }), `${ownedKey} canOwn is broken`).to.eq(true);
      });
    });
  });
});
