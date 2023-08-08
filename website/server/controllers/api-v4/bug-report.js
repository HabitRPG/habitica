import { authWithHeaders } from '../../middlewares/auth';
import { bugReportLogic } from '../../libs/bug-report';

const api = {};

/**
 * @api {post} /api/v4/bug-report Report an issue
 * @apiName BugReport
 * @apiGroup BugReport
 * @apiDescription This POST method is used to send bug reports from the Website.
 * Since it needs the Users Data, it requires authentication.
 *
 * @apiParam (Body) {String} message Bug Report Message to sent
 * @apiParam (Body) {String} email User Email
 *
 * @apiSuccess {Object} data Result of this bug report
 * @apiSuccess {Boolean} data.ok Status of this report
 * @apiSuccess {String} data.message Status of this report
 *
 * @apiError (400) {BadRequest} emptyReportBugMessage The report message is missing.
 * @apiUse UserNotFound
 */
api.bugReport = {
  method: 'POST',
  url: '/bug-report',
  middlewares: [authWithHeaders()],
  async handler (req, res) {
    req.checkBody('message', res.t('emptyReportBugMessage')).notEmpty();
    req.checkBody('email', res.t('missingEmail')).notEmpty();
    req.checkBody('email', res.t('notAnEmail')).isEmail();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { message, email, question } = req.body;
    const { user } = res.locals;
    const BROWSER_UA = req.get('User-Agent');

    const {
      emailData, sendMailResult,
    } = bugReportLogic(
      user, email, message, BROWSER_UA, question,
    );

    res.status(200).send({
      ok: true,
      emailData,
      sendMailResult,
    });
  },
};

export default api;
