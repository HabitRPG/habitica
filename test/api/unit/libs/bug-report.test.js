/* eslint-disable global-require */
import nconf from 'nconf';
import { generateUser } from '../../../helpers/api-unit.helper';
import * as emailLib from '../../../../website/server/libs/email';
import { bugReportLogic } from '../../../../website/server/libs/bug-report';

describe('bug-report', () => {
  beforeEach(() => {
    sandbox.stub(emailLib, 'sendTxn').returns(Promise.resolve());

    const nconfGetStub = sandbox.stub(nconf, 'get');
    nconfGetStub.withArgs('ADMIN_EMAIL').returns('true');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('sends a mail using sendTxn', async () => {
    const userId = '2b58daeb-bc50-4a83-b5d3-4ac52c7c0608';
    const userMail = 'me@me.com';
    const userMessage = 'The power is over 9000, please fix it';
    const userAgent = 'The UserAgent with a bunch of weird browser engine levels';

    const user = generateUser({
      _id: userId,
    });

    const result = await bugReportLogic(
      user, userMail, userMessage, userAgent,
    );

    expect(emailLib.sendTxn).to.be.called;
    expect(result).to.deep.equal({
      sendMailResult: undefined,
      emailData: {
        BROWSER_UA: userAgent,
        REPORT_MSG: userMessage,
        USER_CLASS: 'warrior',
        USER_CONSECUTIVE_MONTHS: 0,
        USER_COSTUME: 'false',
        USER_CUSTOMER_ID: undefined,
        USER_CUSTOM_DAY: 0,
        USER_DAILIES_PAUSED: 'false',
        USER_EMAIL: userMail,
        USER_HOURGLASSES: 0,
        USER_ID: userId,
        USER_LEVEL: 1,
        USER_OFFSET_MONTHS: 0,
        USER_PAYMENT_PLATFORM: undefined,
        USER_SUBSCRIPTION: undefined,
        USER_TIMEZONE_OFFSET: 0,
        USER_USERNAME: undefined,
      },
    });
  });
});
