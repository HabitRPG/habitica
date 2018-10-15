import armoireSet from '../../../website/common/script/content/gear/sets/armoire';

describe('armoireSet items', () => {
  it('checks if canOwn has the same id', () => {
    for (const type of Object.keys(armoireSet)) {
      for (const itemKey of Object.keys(armoireSet[type])) {
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
      }
    }
  });
});
