import hatch from '../../../website/common/script/ops/hatch';
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

describe('shared.ops.hatch', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
    user.addAchievement = sinon.spy();
    sinon.stub(shared.onboarding, 'checkOnboardingStatus');
  });

  afterEach(() => {
    shared.onboarding.checkOnboardingStatus.restore();
  });

  context('Pet Hatching', () => {
    context('failure conditions', () => {
      it('does not allow hatching without specifying egg and potion', () => {
        user.items.pets = {};
        try {
          hatch(user);
        } catch (err) {
          expect(err).to.be.an.instanceof(BadRequest);
          expect(err.message).to.equal(errorMessage('missingEggHatchingPotion'));
          expect(user.items.pets).to.be.empty;
        }
      });

      it('does not allow hatching if user lacks specified egg', done => {
        user.items.eggs.Wolf = 1;
        user.items.hatchingPotions.Base = 1;
        user.items.pets = {};
        try {
          hatch(user, { params: { egg: 'Dragon', hatchingPotion: 'Base' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(NotFound);
          expect(err.message).to.equal(i18n.t('messageMissingEggPotion'));
          expect(user.items.pets).to.be.empty;
          expect(user.items.eggs.Wolf).to.equal(1);
          expect(user.items.hatchingPotions.Base).to.equal(1);
          done();
        }
      });

      it('does not allow hatching if user lacks specified hatching potion', done => {
        user.items.eggs.Wolf = 1;
        user.items.hatchingPotions.Base = 1;
        user.items.pets = {};
        try {
          hatch(user, { params: { egg: 'Wolf', hatchingPotion: 'Golden' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(NotFound);
          expect(err.message).to.equal(i18n.t('messageMissingEggPotion'));
          expect(user.items.pets).to.be.empty;
          expect(user.items.eggs.Wolf).to.equal(1);
          expect(user.items.hatchingPotions.Base).to.equal(1);
          done();
        }
      });

      it('does not allow hatching if user already owns target pet', done => {
        user.items.eggs = { Wolf: 1 };
        user.items.hatchingPotions = { Base: 1 };
        user.items.pets = { 'Wolf-Base': 10 };
        try {
          hatch(user, { params: { egg: 'Wolf', hatchingPotion: 'Base' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(NotAuthorized);
          expect(err.message).to.equal(i18n.t('messageAlreadyPet'));
          expect(user.items.pets).to.eql({ 'Wolf-Base': 10 });
          expect(user.items.eggs).to.eql({ Wolf: 1 });
          expect(user.items.hatchingPotions).to.eql({ Base: 1 });
          done();
        }
      });

      it('does not allow hatching quest pet egg using premium potion', done => {
        user.items.eggs = { Cheetah: 1 };
        user.items.hatchingPotions = { Spooky: 1 };
        user.items.pets = {};
        try {
          hatch(user, { params: { egg: 'Cheetah', hatchingPotion: 'Spooky' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(BadRequest);
          expect(err.message).to.equal(i18n.t('messageInvalidEggPotionCombo'));
          expect(user.items.pets).to.be.empty;
          expect(user.items.eggs).to.eql({ Cheetah: 1 });
          expect(user.items.hatchingPotions).to.eql({ Spooky: 1 });
          done();
        }
      });

      it('does not allow hatching quest pet egg using wacky potion', done => {
        user.items.eggs = { Bunny: 1 };
        user.items.hatchingPotions = { Veggie: 1 };
        user.items.pets = {};
        try {
          hatch(user, { params: { egg: 'Bunny', hatchingPotion: 'Veggie' } });
        } catch (err) {
          expect(err).to.be.an.instanceof(BadRequest);
          expect(err.message).to.equal(i18n.t('messageInvalidEggPotionCombo'));
          expect(user.items.pets).to.be.empty;
          expect(user.items.eggs).to.eql({ Bunny: 1 });
          expect(user.items.hatchingPotions).to.eql({ Veggie: 1 });
          done();
        }
      });
    });

    context('successful hatching', () => {
      it('hatches a basic pet', () => {
        user.items.eggs = { Wolf: 1 };
        user.items.hatchingPotions = { Base: 1 };
        user.items.pets = {};
        const [data, message] = hatch(user, { params: { egg: 'Wolf', hatchingPotion: 'Base' } });
        expect(message).to.equal(i18n.t('messageHatched'));
        expect(data).to.eql(user.items);
        expect(user.items.pets).to.eql({ 'Wolf-Base': 5 });
        expect(user.items.eggs).to.eql({ Wolf: 0 });
        expect(user.items.hatchingPotions).to.eql({ Base: 0 });
      });

      it('hatches a quest pet', () => {
        user.items.eggs = { Cheetah: 1 };
        user.items.hatchingPotions = { Base: 1 };
        user.items.pets = {};
        const [data, message] = hatch(user, { params: { egg: 'Cheetah', hatchingPotion: 'Base' } });
        expect(message).to.equal(i18n.t('messageHatched'));
        expect(data).to.eql(user.items);
        expect(user.items.pets).to.eql({ 'Cheetah-Base': 5 });
        expect(user.items.eggs).to.eql({ Cheetah: 0 });
        expect(user.items.hatchingPotions).to.eql({ Base: 0 });
      });

      it('hatches a premium pet', () => {
        user.items.eggs = { Wolf: 1 };
        user.items.hatchingPotions = { Spooky: 1 };
        user.items.pets = {};
        const [data, message] = hatch(user, { params: { egg: 'Wolf', hatchingPotion: 'Spooky' } });
        expect(message).to.equal(i18n.t('messageHatched'));
        expect(data).to.eql(user.items);
        expect(user.items.pets).to.eql({ 'Wolf-Spooky': 5 });
        expect(user.items.eggs).to.eql({ Wolf: 0 });
        expect(user.items.hatchingPotions).to.eql({ Spooky: 0 });
      });

      it('hatches a pet previously raised to a mount', () => {
        user.items.eggs = { Wolf: 1 };
        user.items.hatchingPotions = { Base: 1 };
        user.items.pets = { 'Wolf-Base': -1 };
        const [data, message] = hatch(user, { params: { egg: 'Wolf', hatchingPotion: 'Base' } });
        expect(message).to.eql(i18n.t('messageHatched'));
        expect(data).to.eql(user.items);
        expect(user.items.pets).to.eql({ 'Wolf-Base': 5 });
        expect(user.items.eggs).to.eql({ Wolf: 0 });
        expect(user.items.hatchingPotions).to.eql({ Base: 0 });
      });

      it('awards Back to Basics achievement', () => {
        user.items.pets = {
          'TigerCub-Base': 5,
          'PandaCub-Base': 10,
          'LionCub-Base': 5,
          'Fox-Base': 5,
          'FlyingPig-Base': 5,
          'Dragon-Base': 5,
          'Cactus-Base': 15,
          'BearCub-Base': 5,
        };
        user.items.eggs = { Wolf: 1 };
        user.items.hatchingPotions = { Base: 1 };
        hatch(user, { params: { egg: 'Wolf', hatchingPotion: 'Base' } });
        expect(user.achievements.backToBasics).to.eql(true);
      });

      it('awards Dust Devil achievement', () => {
        user.items.pets = {
          'TigerCub-Desert': 5,
          'PandaCub-Desert': 10,
          'LionCub-Desert': 5,
          'Fox-Desert': 5,
          'FlyingPig-Desert': 5,
          'Dragon-Desert': 5,
          'Cactus-Desert': 15,
          'BearCub-Desert': 5,
        };
        user.items.eggs = { Wolf: 1 };
        user.items.hatchingPotions = { Desert: 1 };
        hatch(user, { params: { egg: 'Wolf', hatchingPotion: 'Desert' } });
        expect(user.achievements.dustDevil).to.eql(true);
      });

      it('adds the onboarding achievement to the user and checks the onboarding status', () => {
        user.items.eggs = { Wolf: 1 };
        user.items.hatchingPotions = { Base: 1 };
        user.items.pets = {};
        hatch(user, { params: { egg: 'Wolf', hatchingPotion: 'Base' } });

        expect(user.addAchievement).to.be.calledOnce;
        expect(user.addAchievement).to.be.calledWith('hatchedPet');

        expect(shared.onboarding.checkOnboardingStatus).to.be.calledOnce;
        expect(shared.onboarding.checkOnboardingStatus).to.be.calledWith(user);
      });

      it('does not add the onboarding achievement to the user if it\'s already been awarded', () => {
        user.items.eggs = { Wolf: 1 };
        user.items.hatchingPotions = { Base: 1 };
        user.items.pets = {};
        user.achievements.hatchedPet = true;

        hatch(user, { params: { egg: 'Wolf', hatchingPotion: 'Base' } });

        expect(user.addAchievement).to.not.be.called;
      });
    });
  });
});
