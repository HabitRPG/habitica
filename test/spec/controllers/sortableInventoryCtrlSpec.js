describe('Sortable Inventory Controller', () => {
  let scope;

  beforeEach(inject(($rootScope, $controller) => {
    scope = $rootScope.$new();
    $controller('SortableInventoryController', {$scope: scope});
  }));

  it('defaults scope.order to set', () => {
    expect(scope.order).to.eql('set')
  });

  describe('#setOrder', () => {
    it('sets sort criteria for all standard attributes', () =>{
      let oldOrder = scope.order;

      let attrs = [
        'constitution',
        'intelligence',
        'perception',
        'strength',
        'set'
      ];

      attrs.forEach((attribute) => {
        scope.setOrder(attribute);
        expect(scope.order).to.exist;
        expect(scope.order).to.not.eql(oldOrder);
        oldOrder = scope.order;
      });
    });

    it('does nothing when missing sort criteria', () =>{
      scope.order = null;

      scope.setOrder('foooo');

      expect(scope.order).to.not.exist;
    });
  });
});
