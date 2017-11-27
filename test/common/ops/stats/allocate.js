import allocate from '../../../../website/common/script/ops/stats/allocate';
import {
  BadRequest,
  NotAuthorized,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import {
  generateUser,
} from '../../../helpers/common.helper';

describe('shared.ops.allocate', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('throws an error if an invalid attribute is supplied', (done) => {
    try {
      allocate(user, {
        query: {stat: 'notValid'},
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('invalidAttribute', {attr: 'notValid'}));
      done();
    }
  });

  it('throws an error if the user doesn\'t have attribute points', (done) => {
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
    allocate(user, {query: {stat: 'con'}});
    expect(user.stats.con).to.equal(1);
    expect(user.stats.points).to.equal(0);
  });

  it('increases mana when allocating to "int"', () => {
    expect(user.stats.int).to.equal(0);
    expect(user.stats.mp).to.equal(10);
    user.stats.points = 1;
    allocate(user, {query: {stat: 'int'}});
    expect(user.stats.int).to.equal(1);
    expect(user.stats.mp).to.equal(11);
  });
});
