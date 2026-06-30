import {
  describe, expect, test, beforeEach,
} from 'vitest';
import generateStore from '@/store';

describe('getTaskClasses getter', () => {
  let store; let
    getTaskClasses;

  beforeEach(() => {
    store = generateStore();
    store.state.user.data = {
      preferences: {
      },
    };

    getTaskClasses = store.getters['tasks:getTaskClasses'];
  });

  test('returns reward edit-modal-bg class', () => {
    const task = { type: 'reward' };
    expect(getTaskClasses(task, 'edit-modal-bg')).to.equal('task-purple-modal-bg');
  });

  test('returns worst task edit-modal-bg class', () => {
    const task = { type: 'todo', value: -21 };
    expect(getTaskClasses(task, 'edit-modal-bg')).to.equal('task-worst-modal-bg');
  });

  test('returns worse task edit-modal-bg class', () => {
    const task = { type: 'todo', value: -11 };
    expect(getTaskClasses(task, 'edit-modal-bg')).to.equal('task-worse-modal-bg');
  });

  test('returns bad task edit-modal-bg class', () => {
    const task = { type: 'todo', value: -6 };
    expect(getTaskClasses(task, 'edit-modal-bg')).to.equal('task-bad-modal-bg');
  });

  test('returns neutral task edit-modal-bg class', () => {
    const task = { type: 'todo', value: 0 };
    expect(getTaskClasses(task, 'edit-modal-bg')).to.equal('task-neutral-modal-bg');
  });

  test('returns good task edit-modal-bg class', () => {
    const task = { type: 'todo', value: 2 };
    expect(getTaskClasses(task, 'edit-modal-bg')).to.equal('task-good-modal-bg');
  });

  test('returns better task edit-modal-bg class', () => {
    const task = { type: 'todo', value: 6 };
    expect(getTaskClasses(task, 'edit-modal-bg')).to.equal('task-better-modal-bg');
  });

  test('returns best task edit-modal-bg class', () => {
    const task = { type: 'todo', value: 12 };
    expect(getTaskClasses(task, 'edit-modal-bg')).to.equal('task-best-modal-bg');
  });

  test('returns best task edit-modal-text class', () => {
    const task = { type: 'todo', value: 12 };
    expect(getTaskClasses(task, 'edit-modal-text')).to.equal('task-best-modal-text');
  });

  test('returns best task edit-modal-icon class', () => {
    const task = { type: 'todo', value: 12 };
    expect(getTaskClasses(task, 'edit-modal-icon')).to.equal('task-best-modal-icon');
  });

  test('returns best task edit-modal-option-disabled class', () => {
    const task = { type: 'todo', value: 12 };
    expect(getTaskClasses(task, 'edit-modal-option-disabled')).to.equal('task-best-modal-option-disabled');
  });

  test('returns best task edit-modal-control-disabled class', () => {
    const task = { type: 'todo', value: 12 };
    expect(getTaskClasses(task, 'edit-modal-habit-control-disabled')).to.equal('task-best-modal-habit-control-disabled');
  });

  test('returns create-modal-bg class', () => {
    const task = { type: 'todo' };
    expect(getTaskClasses(task, 'create-modal-bg')).to.equal('task-purple-modal-bg');
  });

  test('returns create-modal-text class', () => {
    const task = { type: 'todo' };
    expect(getTaskClasses(task, 'create-modal-text')).to.equal('task-purple-modal-text');
  });

  test('returns create-modal-icon class', () => {
    const task = { type: 'todo' };
    expect(getTaskClasses(task, 'create-modal-icon')).to.equal('task-purple-modal-icon');
  });

  test('returns create-modal-option-disabled class', () => {
    const task = { type: 'todo' };
    expect(getTaskClasses(task, 'create-modal-option-disabled')).to.equal('task-purple-modal-option-disabled');
  });

  test('returns create-modal-habit-control-disabled class', () => {
    const task = { type: 'todo' };
    expect(getTaskClasses(task, 'create-modal-habit-control-disabled')).to.equal('task-purple-modal-habit-control-disabled');
  });

  test('returns completed todo classes', () => {
    const task = { type: 'todo', value: 2, completed: true };
    expect(getTaskClasses(task, 'control')).to.deep.equal({
      bg: 'task-disabled-daily-todo-control-bg',
      checkbox: 'task-disabled-daily-todo-control-checkbox',
      inner: 'task-disabled-daily-todo-control-inner',
      content: 'task-disabled-daily-todo-control-content',
    });
  });

  test('returns good todo classes', () => {
    const task = { type: 'todo', value: 2 };
    expect(getTaskClasses(task, 'control')).to.deep.equal({
      bg: 'task-good-control-bg',
      checkbox: 'task-good-control-checkbox',
      inner: 'task-good-control-inner-daily-todo',
      icon: 'task-good-control-icon',
    });
  });

  test('returns reward classes', () => {
    const task = { type: 'reward' };
    expect(getTaskClasses(task, 'control')).to.deep.equal({
      bg: 'task-reward-control-bg',
    });
  });

  test('returns habit up classes', () => {
    const task = { type: 'habit', value: 2, up: true };
    expect(getTaskClasses(task, 'control')).to.deep.equal({
      up: {
        bg: 'task-good-control-bg',
        inner: 'task-good-control-inner-habit',
        icon: 'task-good-control-icon',
      },
      down: {
        bg: 'task-disabled-habit-control-bg',
        inner: 'task-disabled-habit-control-inner',
        icon: 'task-good-control-icon',
      },
    });
  });

  test('returns noninteractive classes and padlock icons for group board tasks', () => {
    const task = {
      type: 'todo',
      value: 2,
      group: {
        id: 'group-id',
        assignedUsers: ['not-me'],
      },
    };
    expect(getTaskClasses(task, 'control')).to.deep.equal({
      bg: 'task-good-control-bg-noninteractive',
      checkbox: 'task-good-control-checkbox',
      inner: 'task-good-control-inner-daily-todo',
      icon: 'task-good-control-icon',
    });
  });
});
