'use strict';

describe('taskFocus Directive', function() {
  var elementToFocus, scope;

  beforeEach(module('habitrpg'));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();

    scope.focusThisLink = false;
    var element = '<input data-task-focus="focusThisLink" />';

    elementToFocus = $compile(element)(scope);
    scope.$digest();
  }));

  it('places focus on the element it is applied to when the expression it binds to evaluates to true',
    inject(function($timeout) {
      var focusSpy = sandbox.spy();

      elementToFocus.appendTo(document.body);
      elementToFocus.on('focus', focusSpy);
      scope.focusThisLink = true;
      scope.$digest();

      $timeout.flush();
      expect(document.activeElement.dataset.taskFocus).to.eql("focusThisLink");
      expect(focusSpy).to.have.been.called;
    })
  );

});
