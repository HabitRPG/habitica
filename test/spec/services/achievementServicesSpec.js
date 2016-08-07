'use strict';

describe('achievementServices', function() {
  var achievementService, rootScope;

  beforeEach(function() {
    rootScope = { 'openModal': sandbox.stub() };
    module(function($provide) {
      $provide.value('$rootScope', rootScope);
    });

    inject(function(Achievement) {
      achievementService = Achievement;
    });
  });

  describe('#displayAchievement', function() {
    it('passes given achievement name to openModal', function() {
      achievementService.displayAchievement('beastMaster');

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith('achievements/beastMaster');
    });

    it('calls openModal with UserCtrl and specified small modal size', function() {
      achievementService.displayAchievement('test');

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith(
        'achievements/test',
        { controller: 'UserCtrl', size: 'sm' }
      );
    });
  });

  describe('#displayBulkyAchievement', function() {
    it('passes given achievement name to openModal', function() {
      achievementService.displayBulkyAchievement('beastMaster');

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith('achievements/beastMaster');
    });

    it('calls openModal with UserCtrl and unspecified modal size', function() {
      achievementService.displayBulkyAchievement('test');

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith(
        'achievements/test',
        { controller: 'UserCtrl' }
      );
    });
  });
});
