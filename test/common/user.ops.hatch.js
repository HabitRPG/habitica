var sinon = require('sinon');
var chai = require('chai');
chai.use(require('sinon-chai'))
var expect = chai.expect

require('coffee-script');
var shared = require('../../common/script/index.coffee');
var content = require('../../common/script/content/index.coffee');

describe('user.ops.hatch', function() {
  var user;

  beforeEach(function() {
    user = {
      items: {
        eggs: {},
        hatchingPotions: {},
        pets: {}
      }
    };

    shared.wrap(user);
  });

  context('Pet Hatching', function() {

    context('failure conditions', function() {

      it('does not allow hatching without specifying egg and potion', function(done) {
        user.ops.hatch({params:{}},function(response) {
          expect(response.message).to.eql('Please specify query.egg & query.hatchingPotion');
          expect(user.items.pets).to.be.empty;
          done();
        });
      });

      it('does not allow hatching if user lacks specified egg', function(done) {
        user.items.eggs = {'Wolf':1};
        user.items.hatchingPotions = {'Base':1};
        user.ops.hatch({params:{egg:'Dragon',hatchingPotion:'Base'}}, function(response) {
          expect(response.message).to.eql(shared.i18n.t('messageMissingEggPotion'));
          expect(user.items.pets).to.be.empty;
          expect(user.items.eggs).to.eql({'Wolf':1});
          expect(user.items.hatchingPotions).to.eql({'Base':1});
          done();
        });
      });

      it('does not allow hatching if user lacks specified hatching potion', function(done) {
        user.items.eggs = {'Wolf':1};
        user.items.hatchingPotions = {'Base':1};
        user.ops.hatch({params:{egg:'Wolf',hatchingPotion:'Golden'}}, function(response) {
          expect(response.message).to.eql(shared.i18n.t('messageMissingEggPotion'));
          expect(user.items.pets).to.be.empty;
          expect(user.items.eggs).to.eql({'Wolf':1});
          expect(user.items.hatchingPotions).to.eql({'Base':1});
          done();
        });
      });

      it('does not allow hatching if user already owns target pet', function(done) {
        user.items.eggs = {'Wolf':1};
        user.items.hatchingPotions = {'Base':1};
        user.items.pets = {'Wolf-Base':10};
        user.ops.hatch({params:{egg:'Wolf',hatchingPotion:'Base'}}, function(response) {
          expect(response.message).to.eql(shared.i18n.t('messageAlreadyPet'));
          expect(user.items.pets).to.eql({'Wolf-Base':10});
          expect(user.items.eggs).to.eql({'Wolf':1});
          expect(user.items.hatchingPotions).to.eql({'Base':1});
          done();
        });
      });

      it('does not allow hatching quest pet egg using premium potion', function(done) {
        user.items.eggs = {'Cheetah':1};
        user.items.hatchingPotions = {'Spooky':1};
        user.ops.hatch({params:{egg:'Cheetah',hatchingPotion:'Spooky'}}, function(response) {
          expect(response.message).to.eql(shared.i18n.t('messageInvalidEggPotionCombo'));
          expect(user.items.pets).to.be.empty;
          expect(user.items.eggs).to.eql({'Cheetah':1});
          expect(user.items.hatchingPotions).to.eql({'Spooky':1});
          done();
        });
      });
    });

    context('successful hatching', function() {

      it('hatches a basic pet', function(done) {
        user.items.eggs = {'Wolf':1};
        user.items.hatchingPotions = {'Base':1};
        user.ops.hatch({params:{egg:'Wolf',hatchingPotion:'Base'}}, function(response) {
          expect(response.message).to.eql(shared.i18n.t('messageHatched'));
          expect(user.items.pets).to.eql({'Wolf-Base':5});
          expect(user.items.eggs).to.eql({'Wolf':0});
          expect(user.items.hatchingPotions).to.eql({'Base':0});
          done();
        });
      });

      it('hatches a quest pet', function(done) {
        user.items.eggs = {'Cheetah':1};
        user.items.hatchingPotions = {'Base':1};
        user.ops.hatch({params:{egg:'Cheetah',hatchingPotion:'Base'}}, function(response) {
          expect(response.message).to.eql(shared.i18n.t('messageHatched'));
          expect(user.items.pets).to.eql({'Cheetah-Base':5});
          expect(user.items.eggs).to.eql({'Cheetah':0});
          expect(user.items.hatchingPotions).to.eql({'Base':0});
          done();
        });
      });

      it('hatches a premium pet', function(done) {
        user.items.eggs = {'Wolf':1};
        user.items.hatchingPotions = {'Spooky':1};
        user.ops.hatch({params:{egg:'Wolf',hatchingPotion:'Spooky'}}, function(response) {
          expect(response.message).to.eql(shared.i18n.t('messageHatched'));
          expect(user.items.pets).to.eql({'Wolf-Spooky':5});
          expect(user.items.eggs).to.eql({'Wolf':0});
          expect(user.items.hatchingPotions).to.eql({'Spooky':0});
          done();
        });
      });

      it('hatches a pet previously raised to a mount', function(done) {
        user.items.eggs = {'Wolf':1};
        user.items.hatchingPotions = {'Base':1};
        user.items.pets = {'Wolf-Base':-1};
        user.ops.hatch({params:{egg:'Wolf',hatchingPotion:'Base'}}, function(response) {
          expect(response.message).to.eql(shared.i18n.t('messageHatched'));
          expect(user.items.pets).to.eql({'Wolf-Base':5});
          expect(user.items.eggs).to.eql({'Wolf':0});
          expect(user.items.hatchingPotions).to.eql({'Base':0});
          done();
        });
      });
    });
  });
});
