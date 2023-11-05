import { authWithHeaders } from '../../middlewares/auth';
import { ensurePermission } from '../../middlewares/ensureAccessRight';
import { TransactionModel as Transaction } from '../../models/transaction';

const api = {};

/**
 * @api {get} /api/v4/user/purchase-history Get users purchase history
 * @apiName UserGetPurchaseHistory
 * @apiGroup User
 *
 */
api.purchaseHistory = {
  method: 'GET',
  middlewares: [authWithHeaders(), ensurePermission('userSupport')],
  url: '/members/:memberId/purchase-history',
  async handler (req, res) {
    req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();
    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;
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

export default api;
