describe('Group Task Actions Controller', () => {
  let scope, user, userSerivce;

  beforeEach(() => {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(($rootScope, $controller) => {
      user = specHelper.newUser();
      user._id = "unique-user-id";
      userSerivce = {user: user};
      userSerivce.sync = sandbox.stub();

      scope = $rootScope.$new();

      $controller('GroupTaskMetaActionsCtrl', {$scope: scope, User: userSerivce});

      scope.task = {
        group: {
          assignedUsers: [],
        },
      };
    });
  });

  describe('claim', () => {
    beforeEach(() => {
      sandbox.stub(window, 'confirm').returns(true);
    });

    it('adds user to assigned users of scope task ', () => {
      scope.claim();
      expect(scope.task.group.assignedUsers).to.contain(user._id);
    });

    it('syncs user tasks ', () => {
      scope.claim();
      expect(userSerivce.sync).to.be.calledOnce;
    });
  });
});
