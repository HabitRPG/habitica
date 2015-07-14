'use strict';

describe('Quests Service', function() {
  var questsService, user, quest;

  beforeEach(function() {
    user = specHelper.newUser();
    user.achievements.quests = {};
    quest = {lvl:20};

    module(function($provide) {
      $provide.value('User', {user: user});
    });

    inject(function(Quests) {
      questsService = Quests;
    });
  });

  context('functions', function() {

    describe('lock quest', function() {

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
  });
});
