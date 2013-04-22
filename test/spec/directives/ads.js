'use strict';

describe('Directive: ads', function () {
  beforeEach(module('websiteAngularApp'));

  var element;

  it('should make hidden element visible', inject(function ($rootScope, $compile) {
    element = angular.element('<ads></ads>');
    element = $compile(element)($rootScope);
    expect(element.text()).toBe('this is the ads directive');
  }));
});
