import feed from '../../../website/common/script/ops/feed';
import content from '../../../website/common/script/content';
import {
  BadRequest,
  NotAuthorized,
  NotFound,
} from '../../../website/common/script/libs/errors';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import errorMessage from '../../../website/common/script/libs/errorMessage';
import shared from '../../../website/common/script';

describe('shared.ops.feed', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
    user.addAchievement = sinon.spy();
    sinon.stub(shared.onboarding, 'checkOnboardingStatus');
  });

  afterEach(() => {
    shared.onboarding.checkOnboardingStatus.restore();
  });

  context('failure conditions', () => {
    it('does not allow feeding without specifying pet and food', done => {
      try {
        feed(user);
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(errorMessage('missingPetFoodFeed'));
        done();
      }
    });

    it('does not allow feeding if pet name format is invalid', done => {
      try {
        feed(user, { params: { pet: 'invalid', food: 'food' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(BadRequest);
        expect(err.message).to.equal(errorMessage('invalidPetName'));
        done();
      }
    });

    it('does not allow feeding if food does not exist', done => {
      try {
        feed(user, { params: { pet: 'Wolf-Red', food: 'invalid food name' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(errorMessage('invalidFoodName'));
        done();
      }
    });

    it('does not allow feeding if pet is not owned', done => {
      try {
        feed(user, { params: { pet: 'Wolf-Red', food: 'Meat' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(i18n.t('messagePetNotFound'));
        done();
      }
    });

    it('does not allow feeding if food is not owned', done => {
      user.items.pets['Wolf-Base'] = 5;
      try {
        feed(user, { params: { pet: 'Wolf-Base', food: 'Meat' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotFound);
        expect(err.message).to.equal(i18n.t('messageFoodNotFound'));
        done();
      }
    });

    it('does not allow feeding of special pets', done => {
      user.items.pets['Wolf-Veteran'] = 5;
      user.items.food.Meat = 1;
      try {
        feed(user, { params: { pet: 'Wolf-Veteran', food: 'Meat' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageCannotFeedPet'));
        done();
      }
    });

    it('does not allow feeding of wacky pets', done => {
      user.items.pets['Wolf-Veggie'] = 5;
      user.items.food.Meat = 1;
      try {
        feed(user, { params: { pet: 'Wolf-Veggie', food: 'Meat' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageCannotFeedPet'));
        done();
      }
    });

    it('does not allow feeding of mounts', done => {
      user.items.pets['Wolf-Base'] = -1;
      user.items.mounts['Wolf-Base'] = true;
      user.items.food.Meat = 1;
      try {
        feed(user, { params: { pet: 'Wolf-Base', food: 'Meat' } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('messageAlreadyMount'));
        done();
      }
    });

    it('does not allow bulk-feeding query amount above food owned', done => {
      user.items.pets['Wolf-Base'] = 5;
      user.items.food.Meat = 6;
      try {
        feed(user, { params: { pet: 'Wolf-Base', food: 'Meat' }, query: { amount: 8 } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('notEnoughFood'));
        done();
      }
    });

    it('does not allow bulk-over-feeding pet', done => {
      user.items.pets['Wolf-Base'] = 45;
      user.items.food.Meat = 3;
      try {
        feed(user, { params: { pet: 'Wolf-Base', food: 'Meat' }, query: { amount: 2 } });
      } catch (err) {
        expect(err).to.be.an.instanceof(NotAuthorized);
        expect(err.message).to.equal(i18n.t('tooMuchFood'));
        done();
      }
    });
  });

  context('successful feeding', () => {
    it('evolves the pet if the food is a Saddle', () => {
      user.items.pets['Wolf-Base'] = 5;
      user.items.food.Saddle = 2;
      user.items.currentPet = 'Wolf-Base';
      const pet = content.petInfo['Wolf-Base'];

      const [data, message] = feed(user, { params: { pet: 'Wolf-Base', food: 'Saddle' } });
      expect(data).to.eql(user.items.pets['Wolf-Base']);
      expect(message).to.eql(i18n.t('messageEvolve', {
        egg: pet.text(),
      }));

      expect(user.items.food.Saddle).to.equal(1);
      expect(user.items.pets['Wolf-Base']).to.equal(-1);
      expect(user.items.mounts['Wolf-Base']).to.equal(true);
      expect(user.items.currentPet).to.equal('');
    });

    it('enjoys the food', () => {
      user.items.pets['Wolf-Base'] = 5;
      user.items.food.Meat = 2;

      const food = content.food.Meat;
      const pet = content.petInfo['Wolf-Base'];

      const [data, message] = feed(user, { params: { pet: 'Wolf-Base', food: 'Meat' } });
      expect(data).to.eql(user.items.pets['Wolf-Base']);
      expect(message).to.eql(i18n.t('messageLikesFood', {
        egg: pet.text(),
        foodText: food.textThe(),
      }));

      expect(user.items.food.Meat).to.equal(1);
      expect(user.items.pets['Wolf-Base']).to.equal(10);
    });

    it('enjoys the food (premium potion)', () => {
      user.items.pets['Wolf-Spooky'] = 5;
      user.items.food.Milk = 2;

      const food = content.food.Milk;
      const pet = content.petInfo['Wolf-Spooky'];

      const [data, message] = feed(user, { params: { pet: 'Wolf-Spooky', food: 'Milk' } });
      expect(data).to.eql(user.items.pets['Wolf-Spooky']);
      expect(message).to.eql(i18n.t('messageLikesFood', {
        egg: pet.text(),
        foodText: food.textThe(),
      }));

      expect(user.items.food.Milk).to.equal(1);
      expect(user.items.pets['Wolf-Spooky']).to.equal(10);
    });

    it('does not like the food', () => {
      user.items.pets['Wolf-Base'] = 5;
      user.items.food.Milk = 2;

      const food = content.food.Milk;
      const pet = content.petInfo['Wolf-Base'];

      const [data, message] = feed(user, { params: { pet: 'Wolf-Base', food: 'Milk' } });
      expect(data).to.eql(user.items.pets['Wolf-Base']);
      expect(message).to.eql(i18n.t('messageDontEnjoyFood', {
        egg: pet.text(),
        foodText: food.textThe(),
      }));

      expect(user.items.food.Milk).to.equal(1);
      expect(user.items.pets['Wolf-Base']).to.equal(7);
    });

    it('evolves the pet into a mount when feeding user.items.pets[pet] >= 50 preferred food (bulk)', () => {
      user.items.pets['Wolf-Base'] = 5;
      user.items.food.Meat = 10;
      user.items.currentPet = 'Wolf-Base';

      const pet = content.petInfo['Wolf-Base'];

      const [data, message] = feed(user, { params: { pet: 'Wolf-Base', food: 'Meat' }, query: { amount: 9 } });
      expect(data).to.eql(user.items.pets['Wolf-Base']);
      expect(message).to.eql(i18n.t('messageEvolve', {
        egg: pet.text(),
      }));

      expect(user.items.food.Meat).to.equal(1);
      expect(user.items.pets['Wolf-Base']).to.equal(-1);
      expect(user.items.mounts['Wolf-Base']).to.equal(true);
      expect(user.items.currentPet).to.equal('');
    });

    it('evolves the pet into a mount when feeding user.items.pets[pet] >= 50 wrong food (bulk)', () => {
      user.items.pets['Wolf-Base'] = 5;
      user.items.food.Milk = 25;
      user.items.currentPet = 'Wolf-Base';

      const pet = content.petInfo['Wolf-Base'];

      const [data, message] = feed(user, { params: { pet: 'Wolf-Base', food: 'Milk' }, query: { amount: 23 } });
      expect(data).to.eql(user.items.pets['Wolf-Base']);
      expect(message).to.eql(i18n.t('messageEvolve', {
        egg: pet.text(),
      }));
      expect(user.items.food.Milk).to.equal(2);
      expect(user.items.pets['Wolf-Base']).to.equal(-1);
      expect(user.items.mounts['Wolf-Base']).to.equal(true);
      expect(user.items.currentPet).to.equal('');
    });

    it('does not like the food (bulk low food) ', () => {
      user.items.pets['Wolf-Base'] = 5;
      user.items.food.Milk = 5;

      const food = content.food.Milk;
      const pet = content.petInfo['Wolf-Base'];

      const [data, message] = feed(user, { params: { pet: 'Wolf-Base', food: 'Milk' }, query: { amount: 5 } });
      expect(data).to.eql(user.items.pets['Wolf-Base']);
      expect(message).to.eql(i18n.t('messageDontEnjoyFood', {
        egg: pet.text(),
        foodText: food.textThe(),
      }));

      expect(user.items.food.Milk).to.equal(0);
      expect(user.items.pets['Wolf-Base']).to.equal(15);
    });

    it('awards All Your Base achievement', () => {
      user.items.pets['Wolf-Spooky'] = 5;
      user.items.food.Milk = 2;
      user.items.mounts = {
        'Wolf-Base': true,
        'TigerCub-Base': true,
        'PandaCub-Base': true,
        'LionCub-Base': true,
        'Fox-Base': true,
        'FlyingPig-Base': true,
        'Dragon-Base': true,
        'Cactus-Base': true,
        'BearCub-Base': true,
      };
      feed(user, { params: { pet: 'Wolf-Spooky', food: 'Milk' } });
      expect(user.achievements.allYourBase).to.eql(true);
    });

    it('awards Arid Authority achievement', () => {
      user.items.pets['Wolf-Spooky'] = 5;
      user.items.food.Milk = 2;
      user.items.mounts = {
        'Wolf-Desert': true,
        'TigerCub-Desert': true,
        'PandaCub-Desert': true,
        'LionCub-Desert': true,
        'Fox-Desert': true,
        'FlyingPig-Desert': true,
        'Dragon-Desert': true,
        'Cactus-Desert': true,
        'BearCub-Desert': true,
      };
      feed(user, { params: { pet: 'Wolf-Spooky', food: 'Milk' } });
      expect(user.achievements.aridAuthority).to.eql(true);
    });

    it('evolves the pet into a mount when feeding user.items.pets[pet] >= 50', () => {
      user.items.pets['Wolf-Base'] = 49;
      user.items.food.Milk = 2;
      user.items.currentPet = 'Wolf-Base';

      const pet = content.petInfo['Wolf-Base'];

      const [data, message] = feed(user, { params: { pet: 'Wolf-Base', food: 'Milk' } });
      expect(data).to.eql(user.items.pets['Wolf-Base']);
      expect(message).to.eql(i18n.t('messageEvolve', {
        egg: pet.text(),
      }));

      expect(user.items.food.Milk).to.equal(1);
      expect(user.items.pets['Wolf-Base']).to.equal(-1);
      expect(user.items.mounts['Wolf-Base']).to.equal(true);
      expect(user.items.currentPet).to.equal('');
    });

    it('adds the onboarding achievement to the user and checks the onboarding status', () => {
      user.items.pets['Wolf-Base'] = 5;
      user.items.food.Meat = 2;

      feed(user, { params: { pet: 'Wolf-Base', food: 'Meat' } });

      expect(user.addAchievement).to.be.calledOnce;
      expect(user.addAchievement).to.be.calledWith('fedPet');

      expect(shared.onboarding.checkOnboardingStatus).to.be.calledOnce;
      expect(shared.onboarding.checkOnboardingStatus).to.be.calledWith(user);
    });

    it('does not add the onboarding achievement to the user if it\'s already been awarded', () => {
      user.items.pets['Wolf-Base'] = 5;
      user.items.food.Meat = 2;
      user.achievements.fedPet = true;

      feed(user, { params: { pet: 'Wolf-Base', food: 'Meat' } });

      expect(user.addAchievement).to.not.be.called;
    });
  });
});
