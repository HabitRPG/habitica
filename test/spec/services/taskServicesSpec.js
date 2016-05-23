'use strict';

describe('Tasks Service', function() {
  var rootScope, tasks, user;

  beforeEach(function() {

    module(function($provide) {
      user = specHelper.newUser();
      $provide.value('User', {user: user});
    });

    inject(function(_$rootScope_, Tasks, User) {
      rootScope = _$rootScope_;
      rootScope.charts = {};
      tasks = Tasks;
    });
  });

  describe('editTask', function() {

    var task;

    beforeEach(function(){
      task = specHelper.newTask();
    });

    it('toggles the _editing property', function() {
      tasks.editTask(task);
      expect(task._editing).to.eql(true);
      tasks.editTask(task);
      expect(task._editing).to.eql(false);
    });

    it('sets _tags to true by default', function() {
      tasks.editTask(task);

      expect(task._tags).to.eql(true);
    });

    it('sets _tags to false if preference for collapsed tags is turned on', function() {
      user.preferences.tagsCollapsed = true;
      tasks.editTask(task);

      expect(task._tags).to.eql(false);
    });

    it('sets _advanced to true by default', function(){
      user.preferences.advancedCollapsed = true;
      tasks.editTask(task);

      expect(task._advanced).to.eql(false);
    });

    it('sets _advanced to false if preference for collapsed advance menu is turned on', function() {
      user.preferences.advancedCollapsed = false;
      tasks.editTask(task);

      expect(task._advanced).to.eql(true);
    });

    it('closes task chart if it exists', function() {
      rootScope.charts[task.id] = true;

      tasks.editTask(task);
      expect(rootScope.charts[task.id]).to.eql(false);
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

      it('does not clone original task\'s id or _id', function() {
        var task = specHelper.newTask();
        var clonedTask = tasks.cloneTask(task);

        expect(clonedTask.id).to.exist;
        expect(clonedTask.id).to.not.eql(task.id);
        expect(clonedTask._id).to.exist;
        expect(clonedTask._id).to.not.eql(task._id);
      });

      it('does not clone original task\'s dateCreated attribute', function() {
        var task = specHelper.newTask({
          dateCreated: new Date(2014, 5, 1, 1, 1, 1, 1),
        });
        var clonedTask = tasks.cloneTask(task);

        expect(clonedTask.dateCreated).to.exist;
        expect(clonedTask.dateCreated).to.not.eql(task.dateCreated);
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
