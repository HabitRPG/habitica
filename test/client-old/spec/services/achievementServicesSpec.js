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

    it('calls openModal with UserCtrl and small modal size if no other size is given', function() {
      achievementService.displayAchievement('test');

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith(
        'achievements/test',
        { controller: 'UserCtrl', size: 'sm' }
      );
    });

    it('calls openModal with UserCtrl and specified modal size if one is given', function() {
      achievementService.displayAchievement('test', {size: 'md'});

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith(
        'achievements/test',
        { controller: 'UserCtrl', size: 'md' }
      );
    });

    it('calls openModal with UserCtrl and default \'sm\' size if invalid size is given', function() {
      achievementService.displayAchievement('test', {size: 'INVALID_SIZE'});

      expect(rootScope.openModal).to.be.calledOnce;
      expect(rootScope.openModal).to.be.calledWith(
        'achievements/test',
        { controller: 'UserCtrl', size: 'sm' }
      );
    });
  });
});
