'use strict';

describe('closeMenu Directive', function() {
  var element, menuElement, scope, ctrl;

  beforeEach(module('habitrpg'));

  beforeEach(inject(function($rootScope, $compile, $controller) {
    scope = $rootScope.$new();

    ctrl = $controller('MenuCtrl', {$scope: scope});

    element = '<a data-close-menu menu="mobile">';

    element = $compile(element)(scope);
    menuElement = $compile(element)(scope);
    scope.$digest();
  }));

  it('closes a connected menu when element is clicked', function() {
    inject(function($timeout) {
      var clickSpy = sandbox.spy();

      element.appendTo(document.body);
      element.on('click', clickSpy);
      element.triggerHandler('click');

      expect(scope._expandedMenu).to.equal(null)
      expect(clickSpy).to.have.been.called;
    });
  });
});
