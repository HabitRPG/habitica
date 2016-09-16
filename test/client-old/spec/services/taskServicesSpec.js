'use strict';

describe('Tasks Service', function() {
  var rootScope, tasks, user, $httpBackend;
  var apiV3Prefix = '/api/v3/tasks';

  beforeEach(function() {
    module(function($provide) {
      user = specHelper.newUser();
      $provide.value('User', {user: user});
    });

    inject(function(_$httpBackend_, _$rootScope_, Tasks, User) {
      $httpBackend = _$httpBackend_;
      rootScope = _$rootScope_;
      rootScope.charts = {};
      tasks = Tasks;
    });
  });

  it('calls get user tasks endpoint', function() {
    $httpBackend.expectGET(apiV3Prefix + '/user').respond({});
    tasks.getUserTasks();
    $httpBackend.flush();
  });

  it('calls post user tasks endpoint', function() {
    $httpBackend.expectPOST(apiV3Prefix + '/user').respond({});
    tasks.createUserTasks();
    $httpBackend.flush();
  });

  it('calls get challenge tasks endpoint', function() {
    var challengeId = 1;
    $httpBackend.expectGET(apiV3Prefix + '/challenge/' + challengeId).respond({});
    tasks.getChallengeTasks(challengeId);
    $httpBackend.flush();
  });

  it('calls create challenge tasks endpoint', function() {
    var challengeId = 1;
    $httpBackend.expectPOST(apiV3Prefix + '/challenge/' + challengeId).respond({});
    tasks.createChallengeTasks(challengeId, {});
    $httpBackend.flush();
  });

  it('calls get task endpoint', function() {
    var taskId = 1;
    $httpBackend.expectGET(apiV3Prefix + '/' + taskId).respond({});
    tasks.getTask(taskId);
    $httpBackend.flush();
  });

  it('calls update task endpoint', function() {
    var taskId = 1;
    $httpBackend.expectPUT(apiV3Prefix + '/' + taskId).respond({});
    tasks.updateTask(taskId, {});
    $httpBackend.flush();
  });

  it('calls delete task endpoint', function() {
    var taskId = 1;
    $httpBackend.expectDELETE(apiV3Prefix + '/' + taskId).respond({});
    tasks.deleteTask(taskId);
    $httpBackend.flush();
  });

  it('calls score task endpoint', function() {
    var taskId = 1;
    var direction = "down";
    $httpBackend.expectPOST(apiV3Prefix + '/' + taskId + '/score/' + direction).respond({});
    tasks.scoreTask(taskId, direction);
    $httpBackend.flush();
  });

  it('calls move task endpoint', function() {
    var taskId = 1;
    var position = 0;
    $httpBackend.expectPOST(apiV3Prefix + '/' + taskId + '/move/to/' + position).respond({});
    tasks.moveTask(taskId, position);
    $httpBackend.flush();
  });

  it('calls add check list item endpoint', function() {
    var taskId = 1;
    $httpBackend.expectPOST(apiV3Prefix + '/' + taskId + '/checklist').respond({});
    tasks.addChecklistItem(taskId, {});
    $httpBackend.flush();
  });

  it('calls score check list item endpoint', function() {
    var taskId = 1;
    var itemId = 2;
    $httpBackend.expectPOST(apiV3Prefix + '/' + taskId + '/checklist/' + itemId + '/score').respond({});
    tasks.scoreCheckListItem(taskId, itemId);
    $httpBackend.flush();
  });

  it('calls update check list item endpoint', function() {
    var taskId = 1;
    var itemId = 2;
    $httpBackend.expectPUT(apiV3Prefix + '/' + taskId + '/checklist/' + itemId).respond({});
    tasks.updateChecklistItem(taskId, itemId, {});
    $httpBackend.flush();
  });

  it('calls remove check list item endpoint', function() {
    var taskId = 1;
    var itemId = 2;
    $httpBackend.expectDELETE(apiV3Prefix + '/' + taskId + '/checklist/' + itemId).respond({});
    tasks.removeChecklistItem(taskId, itemId);
    $httpBackend.flush();
  });

  it('calls add tag to list item endpoint', function() {
    var taskId = 1;
    var tagId = 2;
    $httpBackend.expectPOST(apiV3Prefix + '/' + taskId + '/tags/' + tagId).respond({});
    tasks.addTagToTask(taskId, tagId);
    $httpBackend.flush();
  });

  it('calls remove tag to list item endpoint', function() {
    var taskId = 1;
    var tagId = 2;
    $httpBackend.expectDELETE(apiV3Prefix + '/' + taskId + '/tags/' + tagId).respond({});
    tasks.removeTagFromTask(taskId, tagId);
    $httpBackend.flush();
  });

  it('calls unlinkOneTask endpoint', function() {
    var taskId = 1;
    var keep = "keep";
    $httpBackend.expectPOST(apiV3Prefix + '/unlink-one/' + taskId + '?keep=' + keep).respond({});
    tasks.unlinkOneTask(taskId);
    $httpBackend.flush();
  });

  it('calls unlinkAllTasks endpoint', function() {
    var challengeId = 1;
    var keep = "keep-all";
    $httpBackend.expectPOST(apiV3Prefix + '/unlink-all/' + challengeId + '?keep=' + keep).respond({});
    tasks.unlinkAllTasks(challengeId);
    $httpBackend.flush();
  });

  it('calls clear completed todo task endpoint', function() {
    $httpBackend.expectPOST(apiV3Prefix + '/clearCompletedTodos').respond({});
    tasks.clearCompletedTodos();
    $httpBackend.flush();
  });

  describe('editTask', function() {

    var task;

    beforeEach(function(){
      task = specHelper.newTask();
    });

    it('sets _editing to true', function() {
      tasks.editTask(task, user);
      expect(task._editing).to.eql(true);
    });

    it('sets _tags to true by default', function() {
      tasks.editTask(task, user);

      expect(task._tags).to.eql(true);
    });

    it('sets _tags to false if preference for collapsed tags is turned on', function() {
      user.preferences.tagsCollapsed = true;
      tasks.editTask(task, user);

      expect(task._tags).to.eql(false);
    });

    it('sets _advanced to true by default', function(){
      user.preferences.advancedCollapsed = true;
      tasks.editTask(task, user);

      expect(task._advanced).to.eql(false);
    });

    it('sets _advanced to false if preference for collapsed advance menu is turned on', function() {
      user.preferences.advancedCollapsed = false;
      tasks.editTask(task, user);

      expect(task._advanced).to.eql(true);
    });

    it('closes task chart if it exists', function() {
      rootScope.charts[task.id] = true;

      tasks.editTask(task, user);
      expect(rootScope.charts[task.id]).to.eql(false);
    });
  });

  describe('cancelTaskEdit', function() {
    var task;

    beforeEach(function(){
      task = specHelper.newTask();
    });

    it('sets _editing to false', function() {
      task._editing = true;
      tasks.cancelTaskEdit(task);
      expect(task._editing).to.eql(false);
    });
  });

  describe('cloneTask', function() {

    context('generic tasks', function() {
      it('clones the data from a task', function() {
        var task = specHelper.newTask();
        var clonedTask = tasks.cloneTask(task);

        expect(clonedTask.text).to.eql(task.text);
        expect(clonedTask.notes).to.eql(task.notes);
        expect(clonedTask.tags.includedTag).to.eql(task.tags.includedTag);
        expect(clonedTask.tags.notIncludedTag).to.eql(task.tags.notIncludedTag);
        expect(clonedTask.priority).to.eql(task.priority);
        expect(clonedTask.attribute).to.eql(task.attribute);
      });

      it('does not clone original task\'s _id', function() {
        var task = specHelper.newTask();
        var clonedTask = tasks.cloneTask(task);

        expect(clonedTask._id).to.exist;
        expect(clonedTask._id).to.not.eql(task._id);
      });

      it('does not clone original task\'s dateCreated attribute', function() {
        var task = specHelper.newTask({
          createdAt: new Date(2014, 5, 1, 1, 1, 1, 1),
        });
        var clonedTask = tasks.cloneTask(task);

        expect(clonedTask.createdAt).to.exist;
        expect(clonedTask.createdAt).to.not.eql(task.createdAt);
      });

      it('does not clone original task\'s value', function() {
        var task = specHelper.newTask({
          value: 130
        });
        var clonedTask = tasks.cloneTask(task);

        expect(clonedTask.value).to.exist;
        expect(clonedTask.value).to.not.eql(task.value);
      });
    });

    context('Habits', function() {

      it('clones a habit', function() {
        var habit = specHelper.newHabit({
          up: true,
          down: false
        });
        var clonedHabit = tasks.cloneTask(habit);

        expect(clonedHabit.type).to.eql('habit');
        expect(clonedHabit.up).to.eql(habit.up);
        expect(clonedHabit.down).to.eql(habit.down);
      });
    });

    context('Dailys', function() {

      it('clones a daily', function() {
        var daily = specHelper.newDaily({
          frequency: 'daily',
          everyX: 3,
          startDate: new Date(2014, 5, 1, 1, 1, 1, 1),
        });

        var clonedDaily = tasks.cloneTask(daily);

        expect(clonedDaily.type).to.eql('daily');
        expect(clonedDaily.frequency).to.eql(daily.frequency);
        expect(clonedDaily.everyX).to.eql(daily.everyX);
        expect(clonedDaily.startDate).to.eql(daily.startDate);
      });

      it('does not clone streak', function() {
        var daily = specHelper.newDaily({
          streak: 11
        });

        var clonedDaily = tasks.cloneTask(daily);

        expect(clonedDaily.streak).to.eql(0);
      });
    });

    context('Todos', function() {

      it('clones a todo', function() {
        var todo = specHelper.newTodo();
        var clonedTodo = tasks.cloneTask(todo);

        expect(clonedTodo.type).to.eql('todo');
      });

      it('does not clone due date', function() {
        var todo = specHelper.newTodo({
          date: '2015-06-20'
        });

        var clonedTodo = tasks.cloneTask(todo);

        expect(clonedTodo.date).to.not.exist;
      });

      it('does not clone date completed', function() {
        var todo = specHelper.newTodo({
          dateCompleted: new Date()
        });

        var clonedTodo = tasks.cloneTask(todo);

        expect(clonedTodo.dateCompleted).to.not.exist;
      });
    });

    context('Rewards', function() {

      it('clones a reward', function() {
        var reward = specHelper.newReward();
        var clonedReward = tasks.cloneTask(reward);

        expect(clonedReward.type).to.eql('reward');
      });

      it('does clone a reward\'s vaue', function() {
        var reward = specHelper.newReward({
          value: 20
        });
        var clonedReward = tasks.cloneTask(reward);

        expect(clonedReward.value).to.eql(reward.value);
      });
    });

    context('complete', function() {
      it('does not clone completed status', function() {
        var todo = specHelper.newTodo({
          completed: true
        });

        var clonedTodo = tasks.cloneTask(todo);

        expect(clonedTodo.completed).to.eql(false);
      });
    });

    context('history', function() {

      it('does not clone history', function() {
        var habit = specHelper.newHabit({
          history: [
            { date: Date.now, value: 3.1 },
            { date: Date.now, value: 2.7 }
          ]
        });
        var clonedHabit = tasks.cloneTask(habit);

        expect(clonedHabit.history).to.be.an.array;
        expect(clonedHabit.history).to.be.empty;
      });
    });

    context('checklists', function() {

      it('clones checklist text', function() {
        var todo = specHelper.newTodo({
          checklist: [{
              completed: true,
              text: 'checklist 1',
              id: 'cl-1'
            }, {
              completed: false,
              text: 'checklist 2',
              id: 'cl-2'
          }]
        });

        var clonedTodo = tasks.cloneTask(todo);

        expect(clonedTodo.checklist[0].text).to.eql(todo.checklist[0].text);
        expect(clonedTodo.checklist[1].text).to.eql(todo.checklist[1].text);
      });

      it('does not clone complete or id attribute of checklist', function() {
        var todo = specHelper.newTodo({
          checklist: [{
              completed: true,
              text: 'checklist 1',
              id: 'cl-1'
            }, {
              completed: false,
              text: 'checklist 2',
              id: 'cl-2'
          }]
        });

        var clonedTodo = tasks.cloneTask(todo);

        expect(clonedTodo.checklist[0].completed).to.eql(false);
        expect(clonedTodo.checklist[0].id).to.not.eql(todo.checklist[0].id);
        expect(clonedTodo.checklist[0].id).to.exist;
        expect(clonedTodo.checklist[1].completed).to.eql(false);
        expect(clonedTodo.checklist[1].id).to.not.eql(todo.checklist[1].id);
        expect(clonedTodo.checklist[1].id).to.exist;
      });
    });
  });
});
