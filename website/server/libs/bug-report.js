import nconf from 'nconf';
import { convertVariableObjectToArray, sendTxn } from './email';

export async function bugReportLogic (
  user, userEmail, message, BROWSER_UA, question,
) {
  const emailData = {
    USER_ID: user._id,
    USER_EMAIL: userEmail,
    USER_USERNAME: user.auth.local.username,
    USER_LEVEL: user.stats.lvl,
    USER_CLASS: user.stats.class,
    USER_DAILIES_PAUSED: user.preferences.sleep ? 'true' : 'false',
    USER_COSTUME: user.preferences.costume ? 'true' : 'false',
    USER_CUSTOM_DAY: user.preferences.dayStart,
    USER_TIMEZONE_OFFSET: user.preferences.timezoneOffset,
    USER_SUBSCRIPTION: user.purchased.plan.planId,
    USER_PAYMENT_PLATFORM: user.purchased.plan.paymentMethod,
    USER_CUSTOMER_ID: user.purchased.plan.customerId,
    USER_CONSECUTIVE_MONTHS: user.purchased.plan.consecutive.count,
    USER_OFFSET_MONTHS: user.purchased.plan.consecutive.offset,
    USER_HOURGLASSES: user.purchased.plan.consecutive.trinkets,
    REPORT_MSG: message,
    BROWSER_UA,
  };

  const adminMail = { email: nconf.get('ADMIN_EMAIL') };

  const sendMailResult = await sendTxn(
    adminMail,
    question ? 'ask-a-question' : 'report-a-bug',
    convertVariableObjectToArray(emailData),
  );

  return {
    sendMailResult,
    emailData,
  };
}
