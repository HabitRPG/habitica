'use strict';

describe('expandMenu Directive', function() {
  var element, menuElement, scope, ctrl, elm;

  beforeEach(module('habitrpg'));

  beforeEach(inject(function($rootScope, $compile, $controller) {
    scope = $rootScope.$new();

    ctrl = $controller('MenuCtrl', {$scope: scope});

    element = '<a data-expand-menu menu="mobile"></a>';

    element = $compile(element)(scope);
    menuElement = $compile(element)(scope);
    scope.$digest();
  }));

  it('expands a connected menu when element is clicked', function() {
    inject(function($timeout) {
      var clickSpy = sandbox.spy();

      element.appendTo(document.body);

      element.on('click', clickSpy);
      element.triggerHandler('click');

      expect(clickSpy).to.have.been.called;
    });
  });
});
