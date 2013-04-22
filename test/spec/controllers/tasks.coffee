'use strict'

describe 'Controller: TasksCtrl', () ->

  # load the controller's module
  beforeEach module 'websiteAngularApp'

  TasksCtrl = {}
  scope = {}

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    TasksCtrl = $controller 'TasksCtrl', {
      $scope: scope
    }

  it 'should attach a list of awesomeThings to the scope', () ->
    expect(scope.awesomeThings.length).toBe 3;
