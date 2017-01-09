describe('Group Tasks Meta Actions Controller', () => {
  let rootScope, scope, user, userSerivce;

  beforeEach(() => {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(($rootScope, $controller) => {
      rootScope = $rootScope;

      user = specHelper.newUser();
      user._id = "unique-user-id";
      userSerivce = {user: user};

      scope = $rootScope.$new();

      scope.task = {
        group: {
          assignedUsers: [],
          approval: {
            required: false,
          }
        },
      };
      scope.task._edit = angular.copy(scope.task);

      $controller('GroupTaskActionsCtrl', {$scope: scope, User: userSerivce});
    });
  });


  it('adds a group member to assigned users on "addedGroupMember" event ', () => {
    var testId = 'test-id';
    rootScope.$broadcast('addedGroupMember', testId);
    expect(scope.task.group.assignedUsers).to.contain(testId);
    expect(scope.task._edit.group.assignedUsers).to.contain(testId);
  });

  it('removes a group member to assigned users on "addedGroupMember" event ', () => {
    var testId = 'test-id';
    scope.task.group.assignedUsers.push(testId);
    scope.task._edit.group.assignedUsers.push(testId);
    rootScope.$broadcast('removedGroupMember', testId);
    expect(scope.task.group.assignedUsers).to.not.contain(testId);
    expect(scope.task._edit.group.assignedUsers).to.not.contain(testId);
  });
});
