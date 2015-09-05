'use strict';

describe('expandMenu Directive', function() {
  var menuElement, scope;

  beforeEach(module('habitrpg'));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();

    var element = '<a data-expand-menu menu="mobile"></a>';

    menuElement = $compile(element)(scope);
    scope.$digest();
  }));

  it('expands a connected menu when element is clicked', function() {
    expect(scope._expandedMenu).to.not.exist;
    menuElement.appendTo(document.body);

    menuElement.triggerHandler('click');

    expect(scope._expandedMenu.menu).to.eql('mobile')
  });

  it('closes a connected menu when it is already open', function() {
    scope._expandedMenu = {};
    scope._expandedMenu.menu = 'mobile';
    menuElement.appendTo(document.body);

    menuElement.triggerHandler('click');

    expect(scope._expandedMenu.menu).to.eql(null)
  });
});
