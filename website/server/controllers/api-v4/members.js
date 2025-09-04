import { sendJob } from '../../libs/worker';
import { param , validationResult } from 'express-validator';
import { authWithHeaders } from '../../middlewares/auth';
import { ensurePermission } from '../../middlewares/ensureAccessRight';
import { TransactionModel as Transaction } from '../../models/transaction';

const api = {};

/**
 * @api {get} /api/v4/members/:memberId/purchase-history Get members purchase history
 * @apiName MemberGetPurchaseHistory
 * @apiGroup Member
 *
 */
api.purchaseHistory = {
  method: 'GET',
  middlewares: [authWithHeaders(), ensurePermission('userSupport')],
  url: '/members/:memberId/purchase-history',
  async handler (req, res) {
    await param('memberId', res.t('memberIdRequired')).notEmpty().isUUID().run(req)
    const validationErrors = validationResult(req).array();
    if (validationErrors && validationErrors.length > 0) throw validationErrors;
    let transactions = await Transaction
      .find({ userId: req.params.memberId })
      .sort({ createdAt: -1 })
      .exec();

    if (!res.locals.user.hasPermission('userSupport')) {
      transactions = transactions.filter(t => t.transactionType !== 'create_bank_challenge');
    }

    res.respond(200, transactions);
  },
};

/**
 * @api {delete} /api/v4/members/:memberId Delete a user
 * @apiName DeleteMember
 * @apiGroup Member
 *
 */
api.deleteMember = {
  method: 'DELETE',
  middlewares: [authWithHeaders(), ensurePermission('userSupport')],
  url: '/members/:memberId',
  async handler (req, res) {
    req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();
    req.checkQuery('deleteAccount').optional().isIn(['true', 'false']);
    req.checkQuery('deleteAmplitude').optional().isIn(['true', 'false']);
    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;
    sendJob('delete-user', {
      data: {
        userId: req.params.memberId,
        deleteAccount: req.query.deleteAccount === 'true',
        deleteAmplitude: req.query.deleteAmplitude === 'true',
      },
    });
    res.respond(200, {});
  },
};

export default api;
