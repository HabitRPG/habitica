import allocate from '../../../../website/common/script/ops/stats/allocate';
import {
  BadRequest,
  NotAuthorized,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import {
  generateUser,
} from '../../../helpers/common.helper';
import errorMessage from '../../../../website/common/script/libs/errorMessage';

describe('shared.ops.allocate', () => {
  let user;

  beforeEach(() => {
    user = generateUser({
      'stats.lvl': 10,
      'flags.classSelected': true,
      'preferences.disableClasses': false,
    });
  });

  it('throws an error if an invalid attribute is supplied', done => {
    try {
      allocate(user, {
        query: { stat: 'notValid' },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(errorMessage('invalidAttribute', { attr: 'notValid' }));
      done();
    }
  });

  it('throws an error if the user is below lvl 10', done => {
    user.stats.lvl = 9;
    try {
      allocate(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('classNotSelected'));
      done();
    }
  });

  it('throws an error if the user hasn\'t selected class', done => {
    user.flags.classSelected = false;
    try {
      allocate(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('classNotSelected'));
      done();
    }
  });

  it('throws an error if the user has disabled classes', done => {
    user.preferences.disableClasses = true;
    try {
      allocate(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('classNotSelected'));
      done();
    }
  });

  it('throws an error if the user doesn\'t have attribute points', done => {
    try {
      allocate(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughAttrPoints'));
      done();
    }
  });

  it('defaults to the "str" attribute', () => {
    expect(user.stats.str).to.equal(0);
    user.stats.points = 1;
    allocate(user);
    expect(user.stats.str).to.equal(1);
  });

  it('allocates attribute points', () => {
    expect(user.stats.con).to.equal(0);
    user.stats.points = 1;
    allocate(user, { query: { stat: 'con' } });
    expect(user.stats.con).to.equal(1);
    expect(user.stats.points).to.equal(0);
  });

  it('increases mana when allocating to "int"', () => {
    expect(user.stats.int).to.equal(0);
    expect(user.stats.mp).to.equal(10);
    user.stats.points = 1;
    allocate(user, { query: { stat: 'int' } });
    expect(user.stats.int).to.equal(1);
    expect(user.stats.mp).to.equal(11);
  });
});
