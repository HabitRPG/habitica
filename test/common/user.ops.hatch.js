let shared = require('../../common/script/index.js');

describe('user.ops.hatch', () => {
  let user;

  beforeEach(() => {
    user = {
      items: {
        eggs: {},
        hatchingPotions: {},
        pets: {},
      },
    };

    shared.wrap(user);
  });

  context('Pet Hatching', () => {
    context('failure conditions', () => {
      it('does not allow hatching without specifying egg and potion', (done) => {
        user.ops.hatch({params: {}}, (response) => {
          expect(response.message).to.eql('Please specify query.egg & query.hatchingPotion');
          expect(user.items.pets).to.be.empty;
          done();
        });
      });

      it('does not allow hatching if user lacks specified egg', (done) => {
        user.items.eggs = {Wolf: 1};
        user.items.hatchingPotions = {Base: 1};
        user.ops.hatch({params: {egg: 'Dragon', hatchingPotion: 'Base'}}, (response) => {
          expect(response.message).to.eql(shared.i18n.t('messageMissingEggPotion'));
          expect(user.items.pets).to.be.empty;
          expect(user.items.eggs).to.eql({Wolf: 1});
          expect(user.items.hatchingPotions).to.eql({Base: 1});
          done();
        });
      });

      it('does not allow hatching if user lacks specified hatching potion', (done) => {
        user.items.eggs = {Wolf: 1};
        user.items.hatchingPotions = {Base: 1};
        user.ops.hatch({params: {egg: 'Wolf', hatchingPotion: 'Golden'}}, (response) => {
          expect(response.message).to.eql(shared.i18n.t('messageMissingEggPotion'));
          expect(user.items.pets).to.be.empty;
          expect(user.items.eggs).to.eql({Wolf: 1});
          expect(user.items.hatchingPotions).to.eql({Base: 1});
          done();
        });
      });

      it('does not allow hatching if user already owns target pet', (done) => {
        user.items.eggs = {Wolf: 1};
        user.items.hatchingPotions = {Base: 1};
        user.items.pets = {'Wolf-Base': 10};
        user.ops.hatch({params: {egg: 'Wolf', hatchingPotion: 'Base'}}, (response) => {
          expect(response.message).to.eql(shared.i18n.t('messageAlreadyPet'));
          expect(user.items.pets).to.eql({'Wolf-Base': 10});
          expect(user.items.eggs).to.eql({Wolf: 1});
          expect(user.items.hatchingPotions).to.eql({Base: 1});
          done();
        });
      });

      it('does not allow hatching quest pet egg using premium potion', (done) => {
        user.items.eggs = {Cheetah: 1};
        user.items.hatchingPotions = {Spooky: 1};
        user.ops.hatch({params: {egg: 'Cheetah', hatchingPotion: 'Spooky'}}, (response) => {
          expect(response.message).to.eql(shared.i18n.t('messageInvalidEggPotionCombo'));
          expect(user.items.pets).to.be.empty;
          expect(user.items.eggs).to.eql({Cheetah: 1});
          expect(user.items.hatchingPotions).to.eql({Spooky: 1});
          done();
        });
      });
    });

    context('successful hatching', () => {
      it('hatches a basic pet', (done) => {
        user.items.eggs = {Wolf: 1};
        user.items.hatchingPotions = {Base: 1};
        user.ops.hatch({params: {egg: 'Wolf', hatchingPotion: 'Base'}}, (response) => {
          expect(response.message).to.eql(shared.i18n.t('messageHatched'));
          expect(user.items.pets).to.eql({'Wolf-Base': 5});
          expect(user.items.eggs).to.eql({Wolf: 0});
          expect(user.items.hatchingPotions).to.eql({Base: 0});
          done();
        });
      });

      it('hatches a quest pet', (done) => {
        user.items.eggs = {Cheetah: 1};
        user.items.hatchingPotions = {Base: 1};
        user.ops.hatch({params: {egg: 'Cheetah', hatchingPotion: 'Base'}}, (response) => {
          expect(response.message).to.eql(shared.i18n.t('messageHatched'));
          expect(user.items.pets).to.eql({'Cheetah-Base': 5});
          expect(user.items.eggs).to.eql({Cheetah: 0});
          expect(user.items.hatchingPotions).to.eql({Base: 0});
          done();
        });
      });

      it('hatches a premium pet', (done) => {
        user.items.eggs = {Wolf: 1};
        user.items.hatchingPotions = {Spooky: 1};
        user.ops.hatch({params: {egg: 'Wolf', hatchingPotion: 'Spooky'}}, (response) => {
          expect(response.message).to.eql(shared.i18n.t('messageHatched'));
          expect(user.items.pets).to.eql({'Wolf-Spooky': 5});
          expect(user.items.eggs).to.eql({Wolf: 0});
          expect(user.items.hatchingPotions).to.eql({Spooky: 0});
          done();
        });
      });

      it('hatches a pet previously raised to a mount', (done) => {
        user.items.eggs = {Wolf: 1};
        user.items.hatchingPotions = {Base: 1};
        user.items.pets = {'Wolf-Base': -1};
        user.ops.hatch({params: {egg: 'Wolf', hatchingPotion: 'Base'}}, (response) => {
          expect(response.message).to.eql(shared.i18n.t('messageHatched'));
          expect(user.items.pets).to.eql({'Wolf-Base': 5});
          expect(user.items.eggs).to.eql({Wolf: 0});
          expect(user.items.hatchingPotions).to.eql({Base: 0});
          done();
        });
      });
    });
  });
});
