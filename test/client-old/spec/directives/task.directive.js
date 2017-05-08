describe('task Directive', () => {
  var compile, scope, directiveElem, $modal;

  beforeEach(function(){
    module(function($provide) {
      $modal = {
        open: sandbox.spy(),
      };
      $provide.value('$modal', $modal);
    });

    inject(function($compile, $rootScope, $templateCache) {
      compile = $compile;
      scope = $rootScope.$new();

      $templateCache.put('templates/task.html', '<div>Task</div>');
    });


    directiveElem = getCompiledElement();
  });

  function getCompiledElement(){
    var element = angular.element('<task></task>');
    var compiledElement = compile(element)(scope);
    scope.$digest();
    return compiledElement;
  }

  xit('opens task note modal', () => {
    scope.showNoteDetails();

    expect($modal.open).to.be.calledOnce;
  });
})
