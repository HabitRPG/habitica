'use strict';

describe('taskFocus Directive', function() {
  var elementToFocus, scope;

  beforeEach(module('habitrpg'));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();

    scope.focusThisLink = false;
    var element = '<a data-task-focus="focusThisLink" ></a>';

    elementToFocus = $compile(element)(scope);
    scope.$digest();
  }));

  it('places focus on the element it is applied to when the expression it binds to evaluates to true', function() {
      elementToFocus.appendTo(document.body);
      scope.focusThisLink = true;
      scope.$digest();
      expect(document.activeElement).to.eql(elementToFocus)
  });

});
