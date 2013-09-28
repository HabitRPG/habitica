'use strict';

describe('Auth Controller', function() {

  // do we need this, or has it since been added to Karma proper?
  /*beforeEach(function(){
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });*/


  //beforeEach(module('phonecatServices'));


  describe('AuthCtrl', function(){
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('api/v1/users/auth/local').
        respond({id: 'abc', apiToken: 'abc'});

      scope = $rootScope.$new();
      ctrl = $controller(AuthCtrl, {$scope: scope});
    }));


    it('should log in users with correct uname / pass', function() {
//      expect(scope.phones).toEqual([]);
//      $httpBackend.flush();
//
//      expect(scope.phones).toEqualData(
//        [{name: 'Nexus S'}, {name: 'Motorola DROID'}]);
    });
  });

});