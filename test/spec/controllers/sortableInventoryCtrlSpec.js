'use strict';

describe('Sortable Inventory Controller', function() {
  var scope;

  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    $controller('SortableInventoryController', {$scope: scope});
  }));

  it('has no default sort order', function(){
    expect(scope.order).to.not.exist;
  });

  it('sets sort criteria for all standard attributes', function(){
    var oldOrder = scope.order;

    var attrs = ['con', 'int', 'per', 'str', 'name', 'set'];

    attrs.forEach(function (attribute) {
      scope.setOrder(attribute);
      expect(scope.order).to.exist;
      expect(scope.order).to.not.eql(oldOrder);
      oldOrder = scope.order;
    });
  });

  it('does nothing when missing sort criteria', function(){
    scope.setOrder('foooo');
    expect(scope.order).to.not.exist;
  });
});
