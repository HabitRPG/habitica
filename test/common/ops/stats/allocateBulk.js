import allocateBulk from '../../../../website/common/script/ops/stats/allocateBulk';
import {
  BadRequest,
  NotAuthorized,
} from '../../../../website/common/script/libs/errors';
import i18n from '../../../../website/common/script/i18n';
import {
  generateUser,
} from '../../../helpers/common.helper';

describe.only('shared.ops.allocateBulk', () => {
  let user;

  beforeEach(() => {
    user = generateUser();
  });

  it('throws an error if an invalid attribute is supplied', (done) => {
    try {
      allocateBulk(user, {
        query: {
          stats: {
            'invalid': 1,
            'str': 2,
          },
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('invalidAttribute', {attr: 'invalid'}));
      done();
    }
  });

  it('throws an error if the stats are not supplied', (done) => {
    try {
      allocateBulk(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('statsObjectRequired'));
      done();
    }
  });

  it('throws an error if the user doesn\'t have attribute points', (done) => {
    try {
      allocateBulk(user, {
        query: {
          stats: {
            'int': 1,
            'str': 2,
          },
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughAttrPoints'));
      done();
    }
  });

  it('throws an error if the user doesn\'t have enough attribute points', (done) => {
    user.stats.points = 1;
    try {
      allocateBulk(user, {
        query: {
          stats: {
            'int': 1,
            'str': 2,
          },
        },
      });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('notEnoughAttrPoints'));
      done();
    }
  });

  it('allocates attribute points', () => {
    user.stats.points = 3;
    expect(user.stats.int).to.equal(0);
    expect(user.stats.str).to.equal(0);

    allocateBulk(user, {
      query: {
        stats: {
          'int': 1,
          'str': 2,
        },
      },
    });

    expect(user.stats.str).to.equal(2);
    expect(user.stats.int).to.equal(1);
    expect(user.stats.points).to.equal(0);
  });
});
