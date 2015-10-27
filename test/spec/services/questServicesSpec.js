'use strict';

describe('Quests Service', function() {
  var groupsService, quest, questsService, user, content, resolveSpy, rejectSpy;

  beforeEach(function() {
    user = specHelper.newUser();
    user.ops = {
      buyQuest: sandbox.spy()
    };

    user.achievements.quests = {};
    quest = {lvl:20};

    module(function($provide) {
      $provide.value('User', {sync: sinon.stub(), user: user});
    });

    inject(function(Quests, Groups, Content) {
      questsService = Quests;
      groupsService = Groups;
      content = Content;
    });

    sandbox.stub(groupsService, 'inviteOrStartParty');
    sandbox.stub(window,'confirm');
    sandbox.stub(window,'alert');
    resolveSpy = sandbox.spy();
    rejectSpy = sandbox.spy();
  });

  describe('#lockQuest', function() {

    it('locks quest when user does not meet level requirement', function() {
      user.stats.lvl = 15;

      expect(questsService.lockQuest(quest)).to.be.ok;
    });

    it('does not lock quest if we ignore level requirement', function() {
      user.stats.lvl = 15;

      expect(questsService.lockQuest(quest,true)).to.not.be.ok;
    });

    it('does not lock quest if user meets level requirement', function() {
      user.stats.lvl = 20;

      expect(questsService.lockQuest(quest)).to.not.be.ok;
    });

    it('locks quest if user has not completed previous quest in series', function() {
      quest.previous = 'priorQuest';
      user.stats.lvl = 25;

      expect(questsService.lockQuest(quest)).to.be.ok;
    });

    it('does not lock quest if user has completed previous quest in series', function() {
      quest.previous = 'priorQuest';
      user.stats.lvl = 25;
      user.achievements.quests.priorQuest = 1;

      expect(questsService.lockQuest(quest)).to.not.be.ok;
    });
  });

  describe('#buyQuest', function() {
    var scope;

    beforeEach(inject(function($rootScope) {
      scope = $rootScope.$new();
    }));

    it('returns a promise', function() {
      var promise = questsService.buyQuest('whale');
      expect(promise).to.respondTo('then');
    });

    context('Quest key does not exist', function() {
      it('rejects with message that quest is not found', function(done) {
        questsService.buyQuest('foo')
          .then(resolveSpy, function(rej) {
            expect(rej).to.eql('No quest with that key found');
            expect(resolveSpy).to.not.be.called;
            done();
        });

        scope.$apply();
      });
    });

    context('invite friends', function() {
      it('prompts user to invite friends to party for invite reward quests', function() {
        questsService.buyQuest('basilist');

        expect(window.confirm).to.be.calledOnce;
        expect(window.confirm).to.be.calledWith(env.t('mustInviteFriend'));
      });

      it('rejects promise if confirm is cancelled', function(done) {
        window.confirm.returns(false);

        questsService.buyQuest('basilist')
          .then(resolveSpy, function(rej) {
            expect(rej).to.eql('Did not want to invite friends');
            expect(window.confirm).to.be.calledOnce;
            expect(groupsService.inviteOrStartParty).to.not.be.called;
            done();
          });

        scope.$apply();
      });

      it('rejects promise if confirm is cofirmed and calls groups service', function(done) {
        window.confirm.returns(true);

        questsService.buyQuest('basilist')
          .then(resolveSpy, function(rej) {
            expect(rej).to.eql('Invite or start party');
            expect(window.confirm).to.be.calledOnce;
            expect(groupsService.inviteOrStartParty).to.be.calledOnce;
            done();
          });

        scope.$apply();
      });
    });

    context('quests in a series', function() {
      it('does not allow user to buy subsquent quests in a series if user has no quest achievements', function(done) {
        user.stats.lvl = 100;
        user.achievements.quests = undefined;

        questsService.buyQuest('goldenknight2')
          .then(resolveSpy, function(res) {
            expect(window.alert).to.have.been.calledOnce;
            expect(res).to.eql('unlockByQuesting');
            expect(resolveSpy).to.not.be.called;
            done();
          });

        scope.$apply();
      });

      it('does not allow user to buy quests whose previous quests are incomplete', function(done) {
        user.stats.lvl = 100;
        user.achievements.quests = {
          'atom1': 1
        };

        questsService.buyQuest('goldenknight2')
          .then(resolveSpy, function(res) {
            expect(window.alert).to.have.been.calledOnce;
            expect(resolveSpy).to.not.be.called;
            done();
          });

        scope.$apply();
      });
    });

    context('quests with level requirement', function() {
      it('does not allow user to buy quests beyond their level', function(done) {
        user.stats.lvl = 1;

        questsService.buyQuest('vice1')
          .then(resolveSpy, function(res) {
            expect(window.alert).to.have.been.calledOnce;
            expect(res).to.eql('mustLvlQuest');
            done();
          });

        scope.$apply();
      });

      it('allows user to buy quest if they meet level requirement', function(done) {
        user.stats.lvl = 30;

        questsService.buyQuest('vice1')
          .then(function(res) {
            expect(res).to.eql(content.quests.vice1);
            expect(window.alert).to.not.be.called;
            expect(rejectSpy).to.not.be.called;
            done();
          }, rejectSpy);

        scope.$apply();
      });
    });

    context('gold purchasable quests', function() {
      it('sends quest object', function(done) {
        questsService.buyQuest('dilatoryDistress1')
          .then(function(res) {
            expect(res).to.eql(content.quests.dilatoryDistress1);
            expect(window.alert).to.not.be.called;
            expect(rejectSpy).to.not.be.called;
            done();
          }, rejectSpy);

        scope.$apply();
      });
    });

    context('all other quests', function() {
      it('sends quest object', function(done) {
        questsService.buyQuest('whale')
          .then(function(res) {
            expect(res).to.eql(content.quests.whale);
            expect(window.alert).to.not.be.called;
            expect(rejectSpy).to.not.be.called;
            done();
          }, rejectSpy);

        scope.$apply();
      });
    });
  });

  describe('#showQuest', function() {
    var scope;

    beforeEach(inject(function($rootScope) {
      scope = $rootScope.$new();
    }));

    it('returns a promise', function() {
      var promise = questsService.showQuest('whale');
      expect(promise).to.respondTo('then');
    });

    context('Quest key does not exist', function() {
      it('rejects with message that quest is not found', function(done) {
        questsService.showQuest('foo')
          .then(resolveSpy, function(rej) {
            expect(rej).to.eql('No quest with that key found');
            expect(resolveSpy).to.not.be.called;
            done();
        });

        scope.$apply();
      });
    });

    context('quests in a series', function() {
      it('does not allow user to buy subsquent quests in a series if user has no quest achievements', function(done) {
        user.stats.lvl = 100;
        user.achievements.quests = undefined;

        questsService.showQuest('goldenknight2')
          .then(resolveSpy, function(res) {
            expect(window.alert).to.have.been.calledOnce;
            expect(res).to.eql('unlockByQuesting');
            expect(resolveSpy).to.not.be.called;
            done();
          });

        scope.$apply();
      });

      it('does not allow user to buy quests whose previous quests are incomplete', function(done) {
        user.stats.lvl = 100;
        user.achievements.quests = {
          'atom1': 1
        };

        questsService.showQuest('goldenknight2')
          .then(resolveSpy, function(res) {
            expect(window.alert).to.have.been.calledOnce;
            expect(resolveSpy).to.not.be.called;
            done();
          });

        scope.$apply();
      });
    });

    context('quests with level requirement', function() {
      it('does not allow user to buy quests beyond their level', function(done) {
        user.stats.lvl = 1;

        questsService.showQuest('vice1')
          .then(resolveSpy, function(res) {
            expect(window.alert).to.have.been.calledOnce;
            expect(res).to.eql('mustLvlQuest');
            done();
          });

        scope.$apply();
      });

      it('allows user to buy quest if they meet level requirement', function(done) {
        user.stats.lvl = 30;

        questsService.showQuest('vice1')
          .then(function(res) {
            expect(res).to.eql(content.quests.vice1);
            expect(window.alert).to.not.be.called;
            expect(rejectSpy).to.not.be.called;
            done();
          }, rejectSpy);

        scope.$apply();
      });
    });

    context('gold purchasable quests', function() {
      it('sends quest object', function(done) {
        questsService.showQuest('dilatoryDistress1')
          .then(function(res) {
            expect(res).to.eql(content.quests.dilatoryDistress1);
            expect(window.alert).to.not.be.called;
            expect(rejectSpy).to.not.be.called;
            done();
          }, rejectSpy);

        scope.$apply();
      });
    });

    context('all other quests', function() {
      it('sends quest object', function(done) {
        questsService.showQuest('whale')
          .then(function(res) {
            expect(res).to.eql(content.quests.whale);
            expect(window.alert).to.not.be.called;
            expect(rejectSpy).to.not.be.called;
            done();
          }, rejectSpy);

        scope.$apply();
      });
    });
  });

  describe('#initQuest', function() {

    it('returns a promise', function() {
      var promise = questsService.initQuest('whale');
      expect(promise).to.respondTo('then');
    });

    it('accepts quest');

    it('brings user to party page');
  });

  describe('#sendAction', function() {
    var fakeBackend, scope;

    beforeEach(inject(function($httpBackend, $rootScope) {
      scope = $rootScope.$new();
      fakeBackend = $httpBackend;

      fakeBackend.when('GET', 'partials/main.html').respond({});
      fakeBackend.when('GET', '/api/v2/groups/party').respond({_id: 'party-id'});
      fakeBackend.when('POST', '/api/v2/groups/party-id/questReject').respond({quest: { key: 'whale' } });
      fakeBackend.flush();
    }));

    it('returns a promise', function() {
      var promise = questsService.sendAction('questReject');
      expect(promise).to.respondTo('then');
    });

    it('calls specified quest endpoint', function(done) {
      fakeBackend.expectPOST('/api/v2/groups/party-id/questReject');

      questsService.sendAction('questReject')
        .then(function(res) {
          expect(res.key).to.eql('whale');
          done();
        });

      fakeBackend.flush();
      scope.$apply();
    });

    it('syncs User', function() {
      questsService.sendAction('questReject')
        .then(function(res) {
          expect(User.sync).to.be.calledOnce;
          done();
        });

      scope.$apply();
    });
  });
});
