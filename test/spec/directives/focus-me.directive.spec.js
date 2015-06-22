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

  it('focuses the element when appended to the DOM', function() {
    inject(function($timeout) {
      var focusSpy = sandbox.spy();

      element.appendTo(document.body);
      element.on('focus', focusSpy);

      $timeout.flush();
      expect(focusSpy).to.have.been.called;
    });
  });
});
