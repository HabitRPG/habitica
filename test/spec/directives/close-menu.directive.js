'use strict';

describe('closeMenu Directive', function() {
  var menuElement, menuElementWithChild, menuElementChild, scope;

  beforeEach(module('habitrpg'));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();

    var element = '<a data-close-menu menu="mobile">';
    var elementWithChild = '<li></li>';
    var elementChild = '<a data-close-menu></a>';

    menuElement = $compile(element)(scope);
    menuElementWithChild = $compile(elementWithChild)(scope);
    menuElementChild = $compile(elementChild)(scope);
    scope.$digest();
  }));

  it('closes a connected menu when element is clicked', function() {
    scope._expandedMenu = {};
    scope._expandedMenu.menu = 'mobile';
    menuElement.appendTo(document.body);

    menuElement.triggerHandler('click');

    expect(scope._expandedMenu.menu).to.eql(null)
  });

  it('closes a connected menu when child element is clicked', function() {
    scope._expandedMenu = {};
    scope._expandedMenu.menu = 'mobile';
    menuElementWithChild.appendTo(document.body);
    menuElementChild.appendTo(menuElementWithChild);

    menuElementChild.triggerHandler('click');

    expect(scope._expandedMenu.menu).to.eql(null)
  });
});
