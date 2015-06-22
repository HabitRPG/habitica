'use strict';

describe('Root Controller', function() {
  var scope, rootscope, user, User, notification, ctrl, $httpBackend;

  beforeEach(function () {
    module(function($provide) {
      $provide.value('User', {});
      $provide.service('$templateCache', function () {
        return {
          get: function () {},
          put: function () {}
        }
      });
    });

    inject(function($rootScope, $controller, _$httpBackend_, Notification) {
      scope = $rootScope.$new();
      scope.loginUsername = 'user';
      scope.loginPassword = 'pass';

      rootscope = $rootScope;

      $httpBackend = _$httpBackend_;

      notification = Notification;
      sandbox.stub(notification, 'text');
      sandbox.stub(notification, 'markdown');

      user = specHelper.newUser();
      User = {user: user};
      User.save = sandbox.spy();
      User.sync = sandbox.spy();

      $httpBackend.whenGET(/partials/).respond();

      ctrl = $controller('RootCtrl', {$scope: scope, User: User});
    });
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
      task_target = {
        id: 'task-id',
        text: 'task'
      };
      type = 'task';
      scope.spell = {
        target: 'task',
        key: 'fireball',
        mana: 10,
        text: function() { return env.t('spellWizardFireballText') },
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

      it('calls cast endpoint', function() {
        $httpBackend.expectPOST(/cast/).respond(201);
        scope.castEnd(task_target, type);

        $httpBackend.flush();
      });

      it('sends notification that spell was cast on task', function() {
        $httpBackend.expectPOST(/cast/).respond(201);
        scope.castEnd(task_target, type);
        $httpBackend.flush();

        expect(notification.markdown).to.be.calledOnce;
        expect(notification.markdown).to.be.calledWith('You cast Burst of Flames on task.');
        expect(User.sync).to.be.calledOnce;
      });

      it('sends notification that spell was cast on user', function() {
        var user_target = {
          profile: { name: 'Lefnire' }
        };
        scope.spell = {
          target: 'user',
          key: 'snowball',
          mana: 0,
          text: function() { return env.t('spellSpecialSnowballAuraText') },
          cast: function(){}
        };
        $httpBackend.expectPOST(/cast/).respond(201);
        scope.castEnd(user_target, 'user');
        $httpBackend.flush();

        expect(notification.markdown).to.be.calledOnce;
        expect(notification.markdown).to.be.calledWith('You cast Snowball on Lefnire.');
        expect(User.sync).to.be.calledOnce;
      });

      it('sends notification that spell was cast on party', function() {
        var party_target = {};
        scope.spell = {
          target: 'party',
          key: 'healAll',
          mana: 25,
          text: function() { return env.t('spellHealerHealAllText') },
          cast: function(){}
        };
        $httpBackend.expectPOST(/cast/).respond(201);
        scope.castEnd(party_target, 'party');
        $httpBackend.flush();

        expect(notification.markdown).to.be.calledOnce;
        expect(notification.markdown).to.be.calledWith('You cast Blessing for the party.');
        expect(User.sync).to.be.calledOnce;
      });

      it('sends notification that spell was cast on self', function() {
        var self_target = {};
        scope.spell = {
          target: 'self',
          key: 'stealth',
          mana: 45,
          text: function() { return env.t('spellRogueStealthText') },
          cast: function(){}
        };
        $httpBackend.expectPOST(/cast/).respond(201);
        scope.castEnd(self_target, 'self');
        $httpBackend.flush();

        expect(notification.markdown).to.be.calledOnce;
        expect(notification.markdown).to.be.calledWith('You cast Stealth.');
        expect(User.sync).to.be.calledOnce;
      });
    });
  });
});
