'use strict';

describe('Root Controller', function() {
  var scope, rootscope, user, User, notification, ctrl, $httpBackend;

  beforeEach(function () {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function($rootScope, $controller, _$httpBackend_, Notification) {
      scope = $rootScope.$new();
      scope.loginUsername = 'user';
      scope.loginPassword = 'pass';

      rootscope = $rootScope;

      $httpBackend = _$httpBackend_;

      notification = Notification;
      sinon.stub(notification, 'text');

      user = specHelper.newUser();
      User = {user: user};
      User.save = sinon.spy();
      User.sync = sinon.spy();

      ctrl = $controller('RootCtrl', {$scope: scope, User: User});
    });
  });

  afterEach(function() {
    notification.text.reset();
    User.save.reset();
    User.sync.reset();
  });

  describe('contribText', function(){
    it('shows contributor level text', function(){
      expect(scope.contribText()).to.eql(undefined);
      expect(scope.contribText(null, {npc: 'NPC'})).to.eql('NPC');
      expect(scope.contribText({level: 0, text: 'Blacksmith'})).to.eql(undefined);
      expect(scope.contribText({level: 1, text: 'Blacksmith'})).to.eql('Friend Blacksmith');
      expect(scope.contribText({level: 2, text: 'Blacksmith'})).to.eql('Friend Blacksmith');
      expect(scope.contribText({level: 3, text: 'Blacksmith'})).to.eql('Elite Blacksmith');
      expect(scope.contribText({level: 4, text: 'Blacksmith'})).to.eql('Elite Blacksmith');
      expect(scope.contribText({level: 5, text: 'Blacksmith'})).to.eql('Champion Blacksmith');
      expect(scope.contribText({level: 6, text: 'Blacksmith'})).to.eql('Champion Blacksmith');
      expect(scope.contribText({level: 7, text: 'Blacksmith'})).to.eql('Legendary Blacksmith');
      expect(scope.contribText({level: 8, text: 'Blacksmith'})).to.eql('Guardian Blacksmith');
      expect(scope.contribText({level: 9, text: 'Blacksmith'})).to.eql('Heroic Blacksmith');
      expect(scope.contribText({level: 9, text: 'Blacksmith'}, {npc: 'NPC'})).to.eql('NPC');
    });
  });

  describe('castEnd', function(){
    var task_target, type;

    beforeEach(function(){
      task_target = { id: 'task-id' };
      type = 'task';
      scope.spell = {
        target: 'task',
        key: 'fireball',
        mana: 10,
        text: env.t('spellWizardFireballText'),
        cast: function(){}
      };
      rootscope.applyingAction = true;
    });

    context('fails', function(){
      it('exits early if there is no applying action', function(){
        rootscope.applyingAction = null;
        expect(scope.castEnd(task_target, type)).to.be.eql('No applying action');
      });

      it('sends notification if target is invalid', function(){
        scope.spell.target = 'not_the_same_target';

        scope.castEnd(task_target, type);

        notification.text.should.have.been.calledWith(window.env.t('invalidTarget'));
      });
    });

    context('succeeds', function(){
      it('sets scope.spell and rootScope.applyingAction to falsy values', function(){

        scope.castEnd(task_target, type);

        expect(rootscope.applyingAction).to.eql(false);
        expect(scope.spell).to.eql(null);
      });

      it('calls $scope.spell.cast', function(){
        // Kind of a hack, would prefer to use sinon.spy,
        // but scope.spell gets turned to null in scope.castEnd
        var spellWasCast = false;
        scope.spell.cast = function(){ spellWasCast = true };

        scope.castEnd(task_target, type);

        expect(spellWasCast).to.eql(true);
      });

      it('calls cast endpoint');

      it('sends notification that spell was cast');
    });
  });
});
