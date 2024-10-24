import {
  each,
} from 'lodash';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';

import eggs from '../../website/common/script/content/eggs';

describe('eggs', () => {
  let clock;

  afterEach(() => {
    if (clock) {
      clock.restore();
    }
  });

  const eggTypes = [
    'drops',
    'quests',
  ];

  eggTypes.forEach(eggType => {
    describe(eggType, () => {
      it('contains basic information about each egg', () => {
        each(eggs[eggType], (egg, key) => {
          expectValidTranslationString(egg.text);
          expectValidTranslationString(egg.adjective);
          expectValidTranslationString(egg.mountText);
          expectValidTranslationString(egg.notes);
          expect(egg.canBuy).to.be.a('function');
          expect(egg.value).to.be.a('number');
          expect(egg.key).to.equal(key);
        });
      });
    });
  });

  it('does not contain unreleased eggs', () => {
    clock = sinon.useFakeTimers(new Date('2024-05-20'));
    const questEggs = eggs.quests;
    expect(questEggs.Giraffe).to.not.exist;
  });

  it('Releases eggs when appropriate without needing restarting', () => {
    clock = sinon.useFakeTimers(new Date('2024-05-20'));
    const mayEggs = eggs.quests;
    clock.restore();
    clock = sinon.useFakeTimers(new Date('2024-06-20'));
    const juneEggs = eggs.quests;
    expect(juneEggs.Giraffe).to.exist;
    expect(Object.keys(mayEggs).length).to.equal(Object.keys(juneEggs).length - 1);
  });
});
