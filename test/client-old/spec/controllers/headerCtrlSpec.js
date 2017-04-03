'use strict';

describe('Header Controller', function() {
  var scope, ctrl, user, $location, $rootScope;

  beforeEach(function() {
    module(function($provide) {
      user = specHelper.newUser();
      user._id = "unique-user-id"
      $provide.value('User', {user: user});
    });

    inject(function(_$rootScope_, _$controller_, _$location_){
      scope = _$rootScope_.$new();
      $rootScope = _$rootScope_;

      $location = _$location_;

      // Load RootCtrl to ensure shared behaviors are loaded
      _$controller_('RootCtrl',  {$scope: scope, User: {user: user}});

      ctrl = _$controller_('HeaderCtrl', {$scope: scope, User: {user: user}});
    });
  });

  context('inviteOrStartParty', function(){
    beforeEach(function(){
      sandbox.stub($location, 'path');
      sandbox.stub($rootScope, 'openModal');
    });

    it('redirects to party page if user does not have a party', function(){
      var group = {};
      scope.inviteOrStartParty(group);

      expect($location.path).to.be.calledWith("/options/groups/party");
      expect($rootScope.openModal).to.not.be.called;
    });

    it('Opens invite-friends modal if user has a party', function(){
      var group = {
        type: 'party'
      };
      scope.inviteOrStartParty(group);

      expect($rootScope.openModal).to.be.calledOnce;
      expect($location.path).to.not.be.called;
    });
  });
});
