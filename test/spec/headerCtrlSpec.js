'use strict';

describe('Header Controller', function() {
  var scope, ctrl, user, $rootScope;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function($rootScope, $controller, Shared, Groups){
      user = specHelper.newUser();

      Shared.wrap(user);

      scope = $rootScope.$new();

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = $controller('HeaderCtrl', {$scope: scope, User: {user: user}, Groups: Groups});
    });
  });

  it('gets next milestone', function(){

    scope.user.stats.lvl = 1;
    scope.getNextMilestone();
    expect(scope.nextMilestone).eql({level: '4',  text: env.t("petsMountMilestone")});

    scope.user.stats.lvl = 4;
    scope.getNextMilestone();
    expect(scope.nextMilestone).eql({level: '10',  text: env.t("classSystemMilestone")});

    scope.user.stats.lvl = 10;
    scope.getNextMilestone();
    expect(scope.nextMilestone).eql({level: '11',  text: env.t("firstSkillMilestone")});

    scope.user.stats.lvl = 11;
    scope.getNextMilestone();
    expect(scope.nextMilestone).eql({level: '12',  text: env.t("secondSkillMilestone")});

    scope.user.stats.lvl = 12;
    scope.getNextMilestone();
    expect(scope.nextMilestone).eql({level: '13',  text: env.t("thirdSkillMilestone")});

    scope.user.stats.lvl = 13;
    scope.getNextMilestone();
    expect(scope.nextMilestone).eql({level: '14',  text: env.t("finalSkillMilestone")});

    scope.user.stats.lvl = 14;
    scope.getNextMilestone();
    expect(scope.nextMilestone).eql({level: '15',  text: env.t("mundaneMilestone")});

    scope.user.stats.lvl = 15;
    scope.getNextMilestone();
    expect(scope.nextMilestone).eql({level: '30',  text:  env.t("viceMilestone")});

    scope.user.stats.lvl = 30;
    scope.getNextMilestone();
    expect(scope.nextMilestone).eql({level: '40',  text: env.t("goldenKnightMilestone")});

    scope.user.stats.lvl = 40;
    scope.getNextMilestone();
    expect(scope.nextMilestone).eql({level: '60',  text: env.t("recidivateMilestone")});

    scope.user.stats.lvl = 60;
    scope.getNextMilestone();
    expect(scope.nextMilestone).eql({level: '100',  text: env.t("freeOrbRebirthMilestone")});
  });

});
