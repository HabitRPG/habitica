'use strict';

describe('focusMe Directive', function() {
  var element, scope;

  beforeEach(module('habitrpg'));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();

    element = "<input focus-me></input>";

    element = $compile(element)(scope);
    scope.$digest();
  }));

  it('focuses the element when appended to the DOM', function(done) {
    inject(function($timeout) {
      element.appendTo(document.body);

      element.on('focus', function() { done() });

      $timeout.flush();
    });
  });
});
