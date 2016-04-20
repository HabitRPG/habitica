import feed from '../../../common/script/ops/feed';
import content from '../../../common/script/content';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../../common/script/libs/errors';
import i18n from '../../../common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';

describe('shared.ops.feed', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  context('failure conditions', () => {
    it('does not allow feeding without specifying pet and food', (done) => {
      try {
        feed(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(i18n.t('missingPetFoodFeed'));
        done();
      }
    });

    it('does not allow feeding if pet name format is invalid', (done) => {
      try {
        feed(user, {params: {pet: 'invalid', food: 'food'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(i18n.t('invalidPetName'));
        done();
      }
    });

    it('does not allow feeding if food does not exists', (done) => {
      try {
        feed(user, {params: {pet: 'valid-pet', food: 'invalid food name'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(i18n.t('messageFoodNotFound'));
        done();
      }
    });

    it('does not allow feeding if pet is not owned', (done) => {
      try {
        feed(user, {params: {pet: 'not-owned', food: 'Meat'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(i18n.t('messagePetNotFound'));
        done();
      }
    });

    it('does not allow feeding if food is not owned', (done) => {
      user.items.pets['Wolf-Base'] = 5;
      try {
        feed(user, {params: {pet: 'Wolf-Base', food: 'Meat'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(i18n.t('messageFoodNotFound'));
        done();
      }
    });

    it('does not allow feeding of special pets', (done) => {
      user.items.pets['Wolf-Veteran'] = 5;
      user.items.food.Meat = 1;
      try {
        feed(user, {params: {pet: 'Wolf-Veteran', food: 'Meat'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageCannotFeedPet'));
        done();
      }
    });

    it('does not allow feeding of mounts', (done) => {
      user.items.pets['Wolf-Base'] = -1;
      user.items.mounts['Wolf-Base'] = true;
      user.items.food.Meat = 1;
      try {
        feed(user, {params: {pet: 'Wolf-Base', food: 'Meat'}});
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageAlreadyMount'));
        done();
      }
    });
  });

  context('successful feeding', () => {
    it('evolves the pet if the food is a Saddle', () => {
      user.items.pets['Wolf-Base'] = 5;
      user.items.food.Saddle = 2;
      user.items.currentPet = 'Wolf-Base';
      let [egg, potion] = 'Wolf-Base'.split('-');

      let potionText = content.hatchingPotions[potion] ? content.hatchingPotions[potion].text() : potion;
      let eggText = content.eggs[egg] ? content.eggs[egg].text() : egg;

      let [data, message] = feed(user, {params: {pet: 'Wolf-Base', food: 'Saddle'}});
      expect(data).to.eql(user.items.pets['Wolf-Base']);
      expect(message).to.eql(i18n.t('messageEvolve', {
        egg: i18n.t('petName', {
          potion: potionText,
          egg: eggText,
        }),
      }));

      expect(user.items.food.Saddle).to.equal(1);
      expect(user.items.pets['Wolf-Base']).to.equal(-1);
      expect(user.items.mounts['Wolf-Base']).to.equal(true);
      expect(user.items.currentPet).to.equal('');
    });

    it('enjoys the food', () => {
      user.items.pets['Wolf-Base'] = 5;
      user.items.food.Meat = 2;

      let food = content.food.Meat;
      let [egg, potion] = 'Wolf-Base'.split('-');
      let potionText = content.hatchingPotions[potion] ? content.hatchingPotions[potion].text() : potion;
      let eggText = content.eggs[egg] ? content.eggs[egg].text() : egg;

      let [data, message] = feed(user, {params: {pet: 'Wolf-Base', food: 'Meat'}});
      expect(data).to.eql(user.items.pets['Wolf-Base']);
      expect(message).to.eql(i18n.t('messageLikesFood', {
        egg: i18n.t('petName', {
          potion: potionText,
          egg: eggText,
        }),
        foodText: food.text(),
      }));

      expect(user.items.food.Meat).to.equal(1);
      expect(user.items.pets['Wolf-Base']).to.equal(10);
    });

    it('enjoys the food (premium potion)', () => {
      user.items.pets['Wolf-Spooky'] = 5;
      user.items.food.Milk = 2;

      let food = content.food.Milk;
      let [egg, potion] = 'Wolf-Spooky'.split('-');
      let potionText = content.hatchingPotions[potion] ? content.hatchingPotions[potion].text() : potion;
      let eggText = content.eggs[egg] ? content.eggs[egg].text() : egg;

      let [data, message] = feed(user, {params: {pet: 'Wolf-Spooky', food: 'Milk'}});
      expect(data).to.eql(user.items.pets['Wolf-Spooky']);
      expect(message).to.eql(i18n.t('messageLikesFood', {
        egg: i18n.t('petName', {
          potion: potionText,
          egg: eggText,
        }),
        foodText: food.text(),
      }));

      expect(user.items.food.Milk).to.equal(1);
      expect(user.items.pets['Wolf-Spooky']).to.equal(10);
    });

    it('does not like the food', () => {
      user.items.pets['Wolf-Base'] = 5;
      user.items.food.Milk = 2;

      let food = content.food.Milk;
      let [egg, potion] = 'Wolf-Base'.split('-');
      let potionText = content.hatchingPotions[potion] ? content.hatchingPotions[potion].text() : potion;
      let eggText = content.eggs[egg] ? content.eggs[egg].text() : egg;

      let [data, message] = feed(user, {params: {pet: 'Wolf-Base', food: 'Milk'}});
      expect(data).to.eql(user.items.pets['Wolf-Base']);
      expect(message).to.eql(i18n.t('messageDontEnjoyFood', {
        egg: i18n.t('petName', {
          potion: potionText,
          egg: eggText,
        }),
        foodText: food.text(),
      }));

      expect(user.items.food.Milk).to.equal(1);
      expect(user.items.pets['Wolf-Base']).to.equal(7);
    });

    it('evolves the pet into a mount when feeding user.items.pets[pet] >= 50', () => {
      user.items.pets['Wolf-Base'] = 49;
      user.items.food.Milk = 2;
      user.items.currentPet = 'Wolf-Base';

      let [egg, potion] = 'Wolf-Base'.split('-');
      let potionText = content.hatchingPotions[potion] ? content.hatchingPotions[potion].text() : potion;
      let eggText = content.eggs[egg] ? content.eggs[egg].text() : egg;

      let [data, message] = feed(user, {params: {pet: 'Wolf-Base', food: 'Milk'}});
      expect(data).to.eql(user.items.pets['Wolf-Base']);
      expect(message).to.eql(i18n.t('messageEvolve', {
        egg: i18n.t('petName', {
          potion: potionText,
          egg: eggText,
        }),
      }));

      expect(user.items.food.Milk).to.equal(1);
      expect(user.items.pets['Wolf-Base']).to.equal(-1);
      expect(user.items.mounts['Wolf-Base']).to.equal(true);
      expect(user.items.currentPet).to.equal('');
    });
  });
});
