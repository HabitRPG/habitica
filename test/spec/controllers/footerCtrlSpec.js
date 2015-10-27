'use strict';

describe('Footer Controller', function() {
  var scope, user;

  beforeEach(inject(function($rootScope, $controller) {
    console.log(window.env.NODE_ENV);
    user = specHelper.newUser();
    var User = {log: sandbox.stub(), set: sandbox.stub(), user: user};
    scope = $rootScope.$new();
    $controller('FooterCtrl', {$scope: scope, User: User});
  }));

  context('Debug mode', function() {
    before(function() {
      window.env.NODE_ENV = 'test';
    });

    after(function() {
      delete window.env.NODE_ENV;
    });

    describe('#setHealthLow', function(){
      it('sets user health to 1');
    });

    describe('#addMissedDay', function(){
      beforeEach(function() {
        sandbox.stub(confirm).returns(true);
      });

      it('Cancels if confirm box is not confirmed');

      it('allows multiple days');

      it('sets users last cron');

      it('notifies uers');
    });

    describe('#addTenGems', function() {
      it('posts to /user/addTenGems', inject(function($httpBackend) {
        $httpBackend.expectPOST('/api/v2/user/addTenGems').respond({});

        scope.addTenGems();

        $httpBackend.flush();
      }));
    });

    describe('#addHourglass', function() {
      it('posts to /user/addHourglass', inject(function($httpBackend) {
        $httpBackend.expectPOST('/api/v2/user/addHourglass').respond({});

        scope.addHourglass();

        $httpBackend.flush();
      }));
    });

    describe('#addGold', function() {
      it('adds 500 gold to user');
    });

    describe('#addMana', function() {
      it('adds 500 mana to user');
    });

    describe('#addLevelsAndGold', function() {
      it('adds 10000 experience to user');

      it('adds 10000 gp to user');

      it('adds 10000 mp to user');
    });

    describe('#addOneLevel', function() {
      it('adds one level to user');
    });

    describe('#addBossQuestProgressUp', function() {
      it('adds 1000 progress to quest.progress.up');
    });
  });
});
