import {
  generateUser,
  translate as t,
} from '../../../../helpers/api-integration/v3';

describe('POST /user/read-card/:cardType', () => {
  let user;
  let cardType = 'greeting';

  beforeEach(async () => {
    user = await generateUser();
  });

  it('returns an error when unknown cardType is provded', async () => {
    await expect(user.post('/user/read-card/randomCardType'))
      .to.eventually.be.rejected.and.to.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('cardTypeNotAllowed'),
      });
  });

  // More tests in common code unit tests

  it('reads a card', async () => {
    await user.update({
      'items.special.greetingReceived': [true],
      'flags.cardReceived': true,
    });

    let response = await user.post(`/user/read-card/${cardType}`);
    await user.sync();

    expect(response.message).to.equal(t('readCard', {cardType}));
    expect(user.items.special[`${cardType}Received`]).to.be.empty;
    expect(user.flags.cardReceived).to.be.false;
  });
});
