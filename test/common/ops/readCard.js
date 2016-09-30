import readCard from '../../../website/common/script/ops/readCard';
import i18n from '../../../website/common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  BadRequest,
  NotAuthorized,
} from '../../../website/common/script/libs/errors';

describe('shared.ops.readCard', () => {
  let user;
  let cardType = 'greeting';

  beforeEach(() => {
    user = generateUser();
    user.items.special[`${cardType}Received`] = [true];
    user.flags.cardReceived = true;
  });

  it('returns an error when cardType is not provided', (done) => {
    try {
      readCard(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('cardTypeRequired'));
      done();
    }
  });

  it('returns an error when unknown cardType is provided', (done) => {
    try {
      readCard(user, {params: {cardType: 'randomCardType'}});
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('cardTypeNotAllowed'));
      done();
    }
  });

  it('reads a card', () => {
    let [, message] = readCard(user, {params: {cardType: 'greeting'}});

    expect(message).to.equal(i18n.t('readCard', {cardType}));
    expect(user.items.special[`${cardType}Received`]).to.be.empty;
    expect(user.flags.cardReceived).to.be.false;
  });
});
