import { authWithHeaders } from '../../middlewares/auth';
import common from '../../../../common';

let api = {};

/**
* @api {post} /api/v3/user/webhook Create a new webhook - BETA
* @apiName UserAddWebhook
* @apiGroup Webhook
*
* @apiParam {String} url Body parameter - The webhook's URL
* @apiParam {Boolean} enabled Body parameter - If the webhook should be enabled
* @apiParam {Sring="taskScored","taskCreated","groupChatReceived","questActivity"} type="taskScored" Body parameter - The webhook's type.
* @apiParam {Object} options Body parameter - The webhook's options. Wil differ depending on type. The options are enumerated below:
* @apiParamExample {json} Basic Example
*   {
*     "enabled": true,
*     "url": "http://some-webhook-url.com",
*   }
* @apiParamExample {json} Task Created Example
*   {
*     "enabled": true,
*     "url": "http://some-webhook-url.com",
*     "type": "taskCreated",
*   }
* @apiParamExample {json} Quest Activity Example
*   {
*     "enabled": true,
*     "url": "http://some-webhook-url.com",
*     "type": "questActivity",
*     "options": {
*       "onStart": false,
*       "onComplete": false,
*       "onInvitation": false
*     }
*   }
* @apiParamExample {json} Group Chat Received Example
*   {
*     "enabled": true,
*     "url": "http://some-webhook-url.com",
*     "type": "groupChatReceived",
*     "options": {
*       "groupId": "uuid-of-group",
*     }
*   }
*
* @apiSuccess {Object} data The created webhook
* @apiSuccess {UUID} data.id The uuid of the webhook
* @apiSuccess {String} data.url The url of the webhook
* @apiSuccess {Boolean} data.enabled Whether the webhook should be sent
* @apiSuccess {Number} data.sort The property to determine webhook order
* @apiSuccess {String} data.type The type of the webhook
* @apiSuccess {Object} data.options The options for the webhook (See examples)
*/
api.addWebhook = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/webhook',
  async handler (req, res) {
    let user = res.locals.user;
    let addWebhookRes = common.ops.addWebhook(user, req);
    await user.save();
    res.respond(201, ...addWebhookRes);
  },
};

/**
* @api {put} /api/v3/user/webhook/:id Edit a webhook - BETA
* @apiName UserUpdateWebhook
* @apiGroup Webhook
*
* @apiParam {UUID} id The id of the webhook to update
* @apiParam {String} url Body parameter - The webhook's URL
* @apiParam {Boolean} enabled Body parameter - If the webhook should be enabled
*
* @apiSuccess {Object} data The updated webhook
*/
api.updateWebhook = {
  method: 'PUT',
  middlewares: [authWithHeaders()],
  url: '/user/webhook/:id',
  async handler (req, res) {
    let user = res.locals.user;
    let updateWebhookRes = common.ops.updateWebhook(user, req);
    await user.save();
    res.respond(200, ...updateWebhookRes);
  },
};

/**
* @api {delete} /api/v3/user/webhook/:id Delete a webhook - BETA
* @apiName UserDeleteWebhook
* @apiGroup Webhook
*
* @apiParam {UUID} id The id of the webhook to delete
*
* @apiSuccess {Object} data The remaining webhooks for the user
*/
api.deleteWebhook = {
  method: 'DELETE',
  middlewares: [authWithHeaders()],
  url: '/user/webhook/:id',
  async handler (req, res) {
    let user = res.locals.user;
    let deleteWebhookRes = common.ops.deleteWebhook(user, req);
    await user.save();
    res.respond(200, ...deleteWebhookRes);
  },
};

module.exports = api;
