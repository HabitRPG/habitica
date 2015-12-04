import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';
import { v4 as generateRandomUserName } from 'uuid';
import { each } from 'lodash';

describe('POST /tasks', () => {
  let user, api;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
      api = requester(user);
    });
  });

  context('validates params', () => {
    it('returns an error if req.body.type is absent', () => {
      return expect(api.post('/tasks', {
        notType: 'habit',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('returns an error if req.body.type is not valid', () => {
      return expect(api.post('/tasks', {
        type: 'habitF',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('returns an error if req.body.text is absent');

    it('ignores setting userId field');

    it('automatically sets "task.userId" to user\'s uuid', () => {
      return api.post('/tasks', {
        text: 'test habit',
        type: 'habit',
      }).then((task) => {
        expect(task.userId).to.equal(user._id);
      });
    });

    it('ignores setting history field');

    it('ignores setting createdAt field');

    it('ignores setting updatedAt field');

    it('ignores setting challenge field');

    it('ignores setting value field');

    it('ignores setting completed field');

    it('ignores setting streak field');

    it('ignores setting dateCompleted field');

    it('ignores invalid fields');
  });

  context('habits', () => {
    it('creates a habit', () => {
      return api.post('/tasks', {
        text: 'test habit',
        type: 'habit',
        up: false,
        down: true,
        notes: 1976,
      }).then((task) => {
        expect(task.userId).to.equal(user._id);
        expect(task.text).to.eql('test habit');
        expect(task.notes).to.eql('1976');
        expect(task.type).to.eql('habit');
        expect(task.up).to.eql(false);
        expect(task.down).to.eql(true);
      });
    });

    it('defaults to setting up and down to true');

    it('cannot create checklists');
  });

  context('todos', () => {
    it('creates a todo', () => {
      return api.post('/tasks', {
        text: 'test todo',
        type: 'todo',
        notes: 1976,
      }).then((task) => {
        expect(task.userId).to.equal(user._id);
        expect(task.text).to.eql('test todo');
        expect(task.notes).to.eql('1976');
        expect(task.type).to.eql('todo');
      });
    });

    it('can create checklists');
  });

  context('dailys', () => {
    it('creates a daily', () => {
      let now = new Date();

      return api.post('/tasks', {
        text: 'test daily',
        type: 'daily',
        notes: 1976,
        frequency: 'daily',
        everyX: 5,
        startDate: now,
      }).then((task) => {
        expect(task.userId).to.equal(user._id);
        expect(task.text).to.eql('test daily');
        expect(task.notes).to.eql('1976');
        expect(task.type).to.eql('daily');
        expect(task.frequency).to.eql('daily');
        expect(task.everyX).to.eql(5);
        expect(task.startDate).to.eql(now);
      });
    });

    it('defaults to a weekly frequency, with every day set');

    it('allows repeat field to be configured');

    it('defaults startDate to today');

    it('can create checklists');
  });

  context('rewards', () => {
    it('creates a reward', () => {
      return api.post('/tasks', {
        text: 'test reward',
        type: 'reward',
        notes: 1976,
        value: 10,
      }).then((task) => {
        expect(task.userId).to.equal(user._id);
        expect(task.text).to.eql('test reward');
        expect(task.notes).to.eql('1976');
        expect(task.type).to.eql('reward');
        expect(task.value).to.eql(10);
      });
    });

    it('defaults to a 0 value');

    it('requires value to be coerced into a number');

    it('cannot create checklists');
  });
});
