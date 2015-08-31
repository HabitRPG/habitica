'use strict';

describe('closeMenu Directive', function() {
  var scope;

  beforeEach(module('habitrpg'));

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();

    scope.$digest();
  }));

  it('closes a connected menu when element is clicked', inject(function($compile) {
    var menuElement = $compile('<a data-close-menu menu="mobile">')(scope);
    scope._expandedMenu = { menu: 'mobile' };

    menuElement.appendTo(document.body);
    menuElement.triggerHandler('click');

    expect(scope._expandedMenu.menu).to.eql(null)
  }));

  it('closes a connected menu when child element is clicked', inject(function($compile) {
    var menuElementWithChild = $compile('<li></li>')(scope);
    var menuElementChild = $compile('<a data-close-menu></a>')(scope);
    scope._expandedMenu = { menu: 'mobile' };

    menuElementWithChild.appendTo(document.body);
    menuElementChild.appendTo(menuElementWithChild);
    menuElementChild.triggerHandler('click');

    expect(scope._expandedMenu.menu).to.eql(null)
  }));
});
