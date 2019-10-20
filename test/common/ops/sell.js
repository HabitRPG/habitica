import sell from '../../../website/common/script/ops/sell';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
  BadRequest,
  NotFound,
} from '../../../website/common/script/libs/errors';
import content from '../../../website/common/script/content/index';

describe('shared.ops.sell', () => {
  let user;
  const type = 'eggs';
  const key = 'Wolf';
  const acceptedTypes = ['eggs', 'hatchingPotions', 'food'];

  beforeEach(() => {
    user = generateUser();
    user.items[type][key] = 1;
  });

  it('returns an error when type is not provided', done => {
    try {
      sell(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('typeRequired'));
      done();
    }
  });

  it('returns an error when key is not provided', done => {
    try {
      sell(user, { params: { type } });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('missingKeyParam'));
      done();
    }
  });

  it('returns an error when non-sellable type is provided', done => {
    const nonSellableType = 'nonSellableType';

    try {
      sell(user, { params: { type: nonSellableType, key } });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('typeNotSellable', { acceptedTypes: acceptedTypes.join(', ') }));
      done();
    }
  });

  it('returns an error when key is not found with type provided', done => {
    const fakeKey = 'fakeKey';

    try {
      sell(user, { params: { type, key: fakeKey } });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotFound);
      expect(err.message).to.equal(i18n.t('userItemsKeyNotFound', { type }));
      done();
    }
  });

  it('returns an error when the requested amount is above the available amount', done => {
    try {
      sell(user, { params: { type, key }, query: { amount: 2 } });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotFound);
      expect(err.message).to.equal(i18n.t('userItemsNotEnough', { type }));
      done();
    }
  });

  it('returns an error when the requested amount is negative', done => {
    try {
      sell(user, { params: { type, key }, query: { amount: -42 } });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('positiveAmountRequired', { type }));
      done();
    }
  });

  it('returns error when trying to sell Saddle', done => {
    const foodType = 'food';
    const saddleKey = 'Saddle';
    user.items[foodType][saddleKey] = 1;
    try {
      sell(user, { params: { type: foodType, key: saddleKey } });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('foodSaddleSellWarningNote'));
      done();
    }
  });

  it('reduces item count from user', () => {
    sell(user, { params: { type, key } });

    expect(user.items[type][key]).to.equal(0);
  });

  it('increases user\'s gold', () => {
    sell(user, { params: { type, key } });

    expect(user.stats.gp).to.equal(content[type][key].value);
  });
});
