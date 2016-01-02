import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('POST /tasks', () => {
  let user;

  before(async () => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  context('validates params', () => {
    it('returns an error if req.body.type is absent', async () => {
      return expect(user.post('/tasks', {
        notType: 'habit',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidTaskType'),
      });
    });

    it('returns an error if req.body.type is not valid', async () => {
      return expect(user.post('/tasks', {
        type: 'habitF',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidTaskType'),
      });
    });

    it('returns an error if one object inside an array is invalid', async () => {
      return expect(user.post('/tasks', [
        {type: 'habitF'},
        {type: 'habit'},
      ])).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidTaskType'),
      });
    });

    it('returns an error if req.body.text is absent', async () => {
      return expect(user.post('/tasks', {
        type: 'habit',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'habit validation failed',
      });
    });

    it('automatically sets "task.userId" to user\'s uuid', async () => {
      let task = await user.post('/tasks', {
        text: 'test habit',
        type: 'habit',
      });

      expect(task.userId).to.equal(user._id);
    });

    it(`ignores setting userId, history, createdAt,
                        updatedAt, challenge, completed, streak,
                        dateCompleted fields`, async () => {
      let task = await user.post('/tasks', {
        text: 'test daily',
        type: 'daily',
        userId: 123,
        history: [123],
        createdAt: 'yesterday',
        updatedAt: 'tomorrow',
        challenge: 'no',
        completed: true,
        streak: 25,
        dateCompleted: 'never',
      });

      expect(task.userId).to.equal(user._id);
      expect(task.history).to.eql([]);
      expect(task.createdAt).not.to.equal('yesterday');
      expect(task.updatedAt).not.to.equal('tomorrow');
      expect(task.challenge).not.to.equal('no');
      expect(task.completed).to.equal(false);
      expect(task.streak).to.equal(0);
      expect(task.streak).not.to.equal('never');
    });

    it('ignores invalid fields', async () => {
      let task = await user.post('/tasks', {
        text: 'test daily',
        type: 'daily',
        notValid: true,
      });

      expect(task).not.to.have.property('notValid');
    });
  });

  context('habits', () => {
    it('creates a habit', async () => {
      let task = await user.post('/tasks', {
        text: 'test habit',
        type: 'habit',
        up: false,
        down: true,
        notes: 1976,
      });

      expect(task.userId).to.equal(user._id);
      expect(task.text).to.eql('test habit');
      expect(task.notes).to.eql('1976');
      expect(task.type).to.eql('habit');
      expect(task.up).to.eql(false);
      expect(task.down).to.eql(true);
    });

    it('creates multiple habits', async () => {
      let [task, task2] = await user.post('/tasks', [{
        text: 'test habit',
        type: 'habit',
        up: false,
        down: true,
        notes: 1976,
      }, {
        text: 'test habit 2',
        type: 'habit',
        up: true,
        down: false,
        notes: 1977,
      }]);

      expect(task.userId).to.equal(user._id);
      expect(task.text).to.eql('test habit');
      expect(task.notes).to.eql('1976');
      expect(task.type).to.eql('habit');
      expect(task.up).to.eql(false);
      expect(task.down).to.eql(true);

      expect(task2.userId).to.equal(user._id);
      expect(task2.text).to.eql('test habit 2');
      expect(task2.notes).to.eql('1977');
      expect(task2.type).to.eql('habit');
      expect(task2.up).to.eql(true);
      expect(task2.down).to.eql(false);
    });

    it('defaults to setting up and down to true', async () => {
      let task = await user.post('/tasks', {
        text: 'test habit',
        type: 'habit',
        notes: 1976,
      });

      expect(task.up).to.eql(true);
      expect(task.down).to.eql(true);
    });

    it('cannot create checklists', async () => {
      let task = await user.post('/tasks', {
        text: 'test habit',
        type: 'habit',
        checklist: [
          {_id: 123, completed: false, text: 'checklist'},
        ],
      });

      expect(task).not.to.have.property('checklist');
    });
  });

  context('todos', () => {
    it('creates a todo', async () => {
      let task = await user.post('/tasks', {
        text: 'test todo',
        type: 'todo',
        notes: 1976,
      });

      expect(task.userId).to.equal(user._id);
      expect(task.text).to.eql('test todo');
      expect(task.notes).to.eql('1976');
      expect(task.type).to.eql('todo');
    });

    it('creates multiple todos', async () => {
      let [task, task2] = await user.post('/tasks', [{
        text: 'test todo',
        type: 'todo',
        notes: 1976,
      }, {
        text: 'test todo 2',
        type: 'todo',
        notes: 1977,
      }]);

      expect(task.userId).to.equal(user._id);
      expect(task.text).to.eql('test todo');
      expect(task.notes).to.eql('1976');
      expect(task.type).to.eql('todo');

      expect(task2.userId).to.equal(user._id);
      expect(task2.text).to.eql('test todo 2');
      expect(task2.notes).to.eql('1977');
      expect(task2.type).to.eql('todo');
    });

    it('can create checklists', async () => {
      let task = await user.post('/tasks', {
        text: 'test todo',
        type: 'todo',
        checklist: [
          {completed: false, text: 'checklist'},
        ],
      });

      expect(task.checklist).to.be.an('array');
      expect(task.checklist.length).to.eql(1);
      expect(task.checklist[0]).to.be.an('object');
      expect(task.checklist[0].text).to.eql('checklist');
      expect(task.checklist[0].completed).to.eql(false);
      expect(task.checklist[0]._id).to.be.a('string');
    });
  });

  context('dailys', () => {
    it('creates a daily', async () => {
      let now = new Date();

      let task = await user.post('/tasks', {
        text: 'test daily',
        type: 'daily',
        notes: 1976,
        frequency: 'daily',
        everyX: 5,
        startDate: now,
      });

      expect(task.userId).to.equal(user._id);
      expect(task.text).to.eql('test daily');
      expect(task.notes).to.eql('1976');
      expect(task.type).to.eql('daily');
      expect(task.frequency).to.eql('daily');
      expect(task.everyX).to.eql(5);
      expect(new Date(task.startDate)).to.eql(now);
    });

    it('creates multiple dailys', async () => {
      let [task, task2] = await user.post('/tasks', [{
        text: 'test daily',
        type: 'daily',
        notes: 1976,
      }, {
        text: 'test daily 2',
        type: 'daily',
        notes: 1977,
      }]);

      expect(task.userId).to.equal(user._id);
      expect(task.text).to.eql('test daily');
      expect(task.notes).to.eql('1976');
      expect(task.type).to.eql('daily');

      expect(task2.userId).to.equal(user._id);
      expect(task2.text).to.eql('test daily 2');
      expect(task2.notes).to.eql('1977');
      expect(task2.type).to.eql('daily');
    });

    it('defaults to a weekly frequency, with every day set', async () => {
      let task = await user.post('/tasks', {
        text: 'test daily',
        type: 'daily',
      });

      expect(task.frequency).to.eql('weekly');
      expect(task.everyX).to.eql(1);
      expect(task.repeat).to.eql({
        m: true,
        t: true,
        w: true,
        th: true,
        f: true,
        s: true,
        su: true,
      });
    });

    it('allows repeat field to be configured', async () => {
      let task = await user.post('/tasks', {
        text: 'test daily',
        type: 'daily',
        repeat: {
          m: false,
          w: false,
          su: false,
        },
      });

      expect(task.repeat).to.eql({
        m: false,
        t: true,
        w: false,
        th: true,
        f: true,
        s: true,
        su: false,
      });
    });

    it('defaults startDate to today', async () => {
      let today = (new Date()).getDay();

      let task = await user.post('/tasks', {
        text: 'test daily',
        type: 'daily',
      });

      expect((new Date(task.startDate)).getDay()).to.eql(today);
    });

    it('can create checklists', async () => {
      let task = await user.post('/tasks', {
        text: 'test daily',
        type: 'daily',
        checklist: [
          {completed: false, text: 'checklist'},
        ],
      });

      expect(task.checklist).to.be.an('array');
      expect(task.checklist.length).to.eql(1);
      expect(task.checklist[0]).to.be.an('object');
      expect(task.checklist[0].text).to.eql('checklist');
      expect(task.checklist[0].completed).to.eql(false);
      expect(task.checklist[0]._id).to.be.a('string');
    });
  });

  context('rewards', () => {
    it('creates a reward', async () => {
      let task = await user.post('/tasks', {
        text: 'test reward',
        type: 'reward',
        notes: 1976,
        value: 10,
      });

      expect(task.userId).to.equal(user._id);
      expect(task.text).to.eql('test reward');
      expect(task.notes).to.eql('1976');
      expect(task.type).to.eql('reward');
      expect(task.value).to.eql(10);
    });

    it('creates multiple rewards', async () => {
      let [task, task2] = await user.post('/tasks', [{
        text: 'test reward',
        type: 'reward',
        notes: 1976,
        value: 11,
      }, {
        text: 'test reward 2',
        type: 'reward',
        notes: 1977,
        value: 12,
      }]);

      expect(task.userId).to.equal(user._id);
      expect(task.text).to.eql('test reward');
      expect(task.notes).to.eql('1976');
      expect(task.type).to.eql('reward');
      expect(task.value).to.eql(11);

      expect(task2.userId).to.equal(user._id);
      expect(task2.text).to.eql('test reward 2');
      expect(task2.notes).to.eql('1977');
      expect(task2.type).to.eql('reward');
      expect(task2.value).to.eql(12);
    });

    it('defaults to a 0 value', async () => {
      let task = await user.post('/tasks', {
        text: 'test reward',
        type: 'reward',
      });

      expect(task.value).to.eql(0);
    });

    it('requires value to be coerced into a number', async () => {
      let task = await user.post('/tasks', {
        text: 'test reward',
        type: 'reward',
        value: '10',
      });

      expect(task.value).to.eql(10);
    });

    it('cannot create checklists', async () => {
      let task = await user.post('/tasks', {
        text: 'test reward',
        type: 'reward',
        checklist: [
          {_id: 123, completed: false, text: 'checklist'},
        ],
      });

      expect(task).not.to.have.property('checklist');
    });
  });
});
