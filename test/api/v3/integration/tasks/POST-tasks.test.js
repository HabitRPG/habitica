import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('POST /tasks', () => {
  let user;

  before(() => {
    return generateUser().then((generatedUser) => {
      user = generatedUser;
    });
  });

  context('validates params', () => {
    it('returns an error if req.body.type is absent', () => {
      return expect(user.post('/tasks', {
        notType: 'habit',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('returns an error if req.body.type is not valid', () => {
      return expect(user.post('/tasks', {
        type: 'habitF',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: t('invalidReqParams'),
      });
    });

    it('returns an error if req.body.text is absent', () => {
      return expect(user.post('/tasks', {
        type: 'habit',
      })).to.eventually.be.rejected.and.eql({
        code: 400,
        error: 'BadRequest',
        message: 'habit validation failed',
      });
    });

    it('automatically sets "task.userId" to user\'s uuid', () => {
      return user.post('/tasks', {
        text: 'test habit',
        type: 'habit',
      }).then((task) => {
        expect(task.userId).to.equal(user._id);
      });
    });

    it(`ignores setting userId, history, createdAt,
                        updatedAt, challenge, completed, streak,
                        dateCompleted fields`, () => {
      return user.post('/tasks', {
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
      }).then((task) => {
        expect(task.userId).to.equal(user._id);
        expect(task.history).to.eql([]);
        expect(task.createdAt).not.to.equal('yesterday');
        expect(task.updatedAt).not.to.equal('tomorrow');
        expect(task.challenge).not.to.equal('no');
        expect(task.completed).to.equal(false);
        expect(task.streak).to.equal(0);
        expect(task.streak).not.to.equal('never');
      });
    });

    it('ignores invalid fields', () => {
      return user.post('/tasks', {
        text: 'test daily',
        type: 'daily',
        notValid: true,
      }).then((task) => {
        expect(task).not.to.have.property('notValid');
      });
    });
  });

  context('habits', () => {
    it('creates a habit', () => {
      return user.post('/tasks', {
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

    it('defaults to setting up and down to true', () => {
      return user.post('/tasks', {
        text: 'test habit',
        type: 'habit',
        notes: 1976,
      }).then((task) => {
        expect(task.up).to.eql(true);
        expect(task.down).to.eql(true);
      });
    });

    it('cannot create checklists', () => {
      return user.post('/tasks', {
        text: 'test habit',
        type: 'habit',
        checklist: [
          {_id: 123, completed: false, text: 'checklist'},
        ],
      }).then((task) => {
        expect(task).not.to.have.property('checklist');
      });
    });
  });

  context('todos', () => {
    it('creates a todo', () => {
      return user.post('/tasks', {
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

    it('can create checklists', () => {
      return user.post('/tasks', {
        text: 'test todo',
        type: 'todo',
        checklist: [
          {completed: false, text: 'checklist'},
        ],
      }).then((task) => {
        expect(task.checklist).to.be.an('array');
        expect(task.checklist.length).to.eql(1);
        expect(task.checklist[0]).to.be.an('object');
        expect(task.checklist[0].text).to.eql('checklist');
        expect(task.checklist[0].completed).to.eql(false);
        expect(task.checklist[0]._id).to.be.a('string');
      });
    });
  });

  context('dailys', () => {
    it('creates a daily', () => {
      let now = new Date();

      return user.post('/tasks', {
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
        expect(new Date(task.startDate)).to.eql(now);
      });
    });

    it('defaults to a weekly frequency, with every day set', () => {
      return user.post('/tasks', {
        text: 'test daily',
        type: 'daily',
      }).then((task) => {
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
    });

    it('allows repeat field to be configured', () => {
      return user.post('/tasks', {
        text: 'test daily',
        type: 'daily',
        repeat: {
          m: false,
          w: false,
          su: false,
        },
      }).then((task) => {
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
    });

    it('defaults startDate to today', () => {
      let today = (new Date()).getDay();

      return user.post('/tasks', {
        text: 'test daily',
        type: 'daily',
      }).then((task) => {
        expect((new Date(task.startDate)).getDay()).to.eql(today);
      });
    });

    it('can create checklists', () => {
      return user.post('/tasks', {
        text: 'test daily',
        type: 'daily',
        checklist: [
          {completed: false, text: 'checklist'},
        ],
      }).then((task) => {
        expect(task.checklist).to.be.an('array');
        expect(task.checklist.length).to.eql(1);
        expect(task.checklist[0]).to.be.an('object');
        expect(task.checklist[0].text).to.eql('checklist');
        expect(task.checklist[0].completed).to.eql(false);
        expect(task.checklist[0]._id).to.be.a('string');
      });
    });
  });

  context('rewards', () => {
    it('creates a reward', () => {
      return user.post('/tasks', {
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

    it('defaults to a 0 value', () => {
      return user.post('/tasks', {
        text: 'test reward',
        type: 'reward',
      }).then((task) => {
        expect(task.value).to.eql(0);
      });
    });

    it('requires value to be coerced into a number', () => {
      return user.post('/tasks', {
        text: 'test reward',
        type: 'reward',
        value: '10',
      }).then((task) => {
        expect(task.value).to.eql(10);
      });
    });

    it('cannot create checklists', () => {
      return user.post('/tasks', {
        text: 'test reward',
        type: 'reward',
        checklist: [
          {_id: 123, completed: false, text: 'checklist'},
        ],
      }).then((task) => {
        expect(task).not.to.have.property('checklist');
      });
    });
  });
});
