/* eslint-disable global-require */
import {
  each,
} from 'lodash';
import {
  expectValidTranslationString,
} from '../helpers/content.helper';
import content from '../../website/common/script/content';

describe('food', () => {
  let clock;

  afterEach(() => {
    if (clock) {
      clock.restore();
    }
    delete require.cache[require.resolve('../../website/common/script/content')];
  });

  describe('all', () => {
    it('contains basic information about each food item', () => {
      each(content.food, (foodItem, key) => {
        if (foodItem.key === 'Saddle') {
          expectValidTranslationString(foodItem.sellWarningNote);
        } else {
          expectValidTranslationString(foodItem.textA);
          expectValidTranslationString(foodItem.textThe);
          expect(foodItem.target).to.be.a('string');
        }
        expectValidTranslationString(foodItem.text);
        expectValidTranslationString(foodItem.notes);
        expect(foodItem.canBuy).to.be.a('function');
        expect(foodItem.value).to.be.a('number');
        expect(foodItem.key).to.equal(key);
      });
    });

    it('sets canDrop for normal food if there is no food season', () => {
      clock = sinon.useFakeTimers(new Date(2024, 5, 8));
      const datedContent = require('../../website/common/script/content').default;
      each(datedContent.food, foodItem => {
        if (foodItem.key.indexOf('Cake') === -1 && foodItem.key.indexOf('Candy_') === -1 && foodItem.key.indexOf('Pie_') === -1 && foodItem.key !== 'Saddle') {
          expect(foodItem.canDrop).to.equal(true);
        } else {
          expect(foodItem.canDrop).to.equal(false);
        }
      });
    });

    it('sets canDrop for candy if it is candy season', () => {
      clock = sinon.useFakeTimers(new Date(2024, 9, 31));
      const datedContent = require('../../website/common/script/content').default;
      each(datedContent.food, foodItem => {
        if (foodItem.key.indexOf('Candy_') !== -1) {
          expect(foodItem.canDrop).to.equal(true);
        } else {
          expect(foodItem.canDrop).to.equal(false);
        }
      });
    });

    it('sets canDrop for cake if it is cake season', () => {
      clock = sinon.useFakeTimers(new Date(2024, 0, 31));
      const datedContent = require('../../website/common/script/content').default;
      each(datedContent.food, foodItem => {
        if (foodItem.key.indexOf('Cake_') !== -1) {
          expect(foodItem.canDrop).to.equal(true);
        } else {
          expect(foodItem.canDrop).to.equal(false);
        }
      });
    });

    it('sets canDrop for pie if it is pie season', () => {
      clock = sinon.useFakeTimers(new Date(2024, 2, 15));
      const datedContent = require('../../website/common/script/content').default;
      each(datedContent.food, foodItem => {
        if (foodItem.key.indexOf('Pie_') !== -1) {
          expect(foodItem.canDrop).to.equal(true);
        } else {
          expect(foodItem.canDrop).to.equal(false);
        }
      });
    });
  });

  it('sets correct values for saddles', () => {
    const saddle = content.food.Saddle;
    expect(saddle.canBuy).to.be.a('function');
    expect(saddle.value).to.equal(5);
    expect(saddle.key).to.equal('Saddle');
    expect(saddle.canDrop).to.equal(false);
  });
});
