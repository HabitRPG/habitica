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

  it('passes given achievement name to openModal', function() {
    achievementService.displayAchievement('beastMaster');

    expect(rootScope.openModal).to.be.calledOnce;
    expect(rootScope.openModal).to.be.calledWith('achievements/beastMaster');
  });

  it('calls openModal with UserCtrl', function() {
    achievementService.displayAchievement('test');

    expect(rootScope.openModal).to.be.calledOnce;
    expect(rootScope.openModal).to.be.calledWith(
      'achievements/test',
      sinon.match({ controller: 'UserCtrl' })
    );
  });

  it('calls openModal with specified small modal size', function() {
    achievementService.displayAchievement('test');

    expect(rootScope.openModal).to.be.calledOnce;
    expect(rootScope.openModal).to.be.calledWith(
      'achievements/test',
      sinon.match({ size: 'sm' })
    );
  });
});
