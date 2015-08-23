'use strict';

describe('closeMenu Directive', function() {
  var menuElement, scope;

  beforeEach(module('habitrpg'));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();

    var element = '<a data-close-menu menu="mobile">';

    menuElement = $compile(element)(scope);
    scope.$digest();
  }));

  it('closes a connected menu when element is clicked', function() {
    scope._expandedMenu = 'mobile';
    menuElement.appendTo(document.body);

    menuElement.triggerHandler('click');

    expect(scope._expandedMenu).to.eql(null)
  });
});
