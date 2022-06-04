import { authWithHeaders } from '../../middlewares/auth';
import { model as Webhook } from '../../models/webhook';
import { removeFromArray } from '../../libs/collectionManipulators';
import { NotFound, BadRequest } from '../../libs/errors';

const api = {};

/**
 * @apiDefine Webhook Webhook
 * Webhooks fire when a particular action is performed, such as updating a task,
 * or sending a message in a group.
 *
 * Your user's configured webhooks are stored as an `Array` on the user
 * object under the `webhooks` property.
 */

/**
 * @apiDefine WebhookNotFound
 * @apiError (404) {NotFound} WebhookNotFound The specified webhook could not be found.
 */

/**
 * @apiDefine WebhookBodyInvalid
 * @apiError (400) {BadRequest} WebhookBodyInvalid A body parameter passed in the
 *                                                 request did not pass validation.
 */

/**
 * @api {post} /api/v3/user/webhook Create a new webhook - BETA
 * @apiName AddWebhook
 * @apiGroup Webhook
 *
 * @apiParam (Body) {UUID} [id="Randomly Generated UUID"] The webhook's id
 * @apiParam (Body) {String} url The webhook's URL
 * @apiParam (Body) {String} [label] A label to remind you what this webhook does
 * @apiParam (Body) {Boolean} [enabled=true] If the webhook should be enabled
 * @apiParam (Body) {String="taskActivity","groupChatReceived",
                    "userActivity","questActivity"} [type="taskActivity"] The webhook's type.
 * @apiParam (Body) {Object} [options] The webhook's options. Will differ depending on type.
 *                                     Required for `groupChatReceived` type.
 *                                     If a webhook supports options, the default values
 *                                     are displayed in the examples below
 * @apiParamExample {json} Task Activity Example
 *   {
 *     "enabled": true, // default
 *     "url": "https://some-webhook-url.com",
 *     "label": "My Webhook",
 *     "type": "taskActivity", // default
 *     "options": {
 *       "created": false, // default
 *       "updated": false, // default
 *       "deleted": false, // default
 *       "scored": true // default
 *     }
 *   }
 * @apiParamExample {json} Group Chat Received Example
 *   {
 *     "enabled": true,
 *     "url": "https://some-webhook-url.com",
 *     "label": "My Chat Webhook",
 *     "type": "groupChatReceived",
 *     "options": {
 *       "groupId": "required-uuid-of-group"
 *     }
 *   }
 * @apiParamExample {json} User Activity Example
 *   {
 *     "enabled": true,
 *     "url": "https://some-webhook-url.com",
 *     "label": "My Activity Webhook",
 *     "type": "userActivity",
 *     "options": { // set at least one to true
 *       "petHatched": false,  // default
 *       "mountRaised": false, // default
 *       "leveledUp": false,   // default
 *     }
 *   }
 * @apiParamExample {json} Quest Activity Example
 *   {
 *     "enabled": true,
 *     "url": "https://some-webhook-url.com",
 *     "label": "My Quest Webhook",
 *     "type": "questActivity",
 *     "options": { // set at least one to true
 *       "questStarted": false,  // default
 *       "questFinished": false, // default
 *       "questInvited": false,  // default
 *     }
 *   }
 * @apiParamExample {json} Minimal Example
 *   {
 *     "url": "https://some-webhook-url.com"
 *   }
 *
 * @apiSuccess (201) {Object} data The created webhook
 * @apiSuccess (201) {UUID} data.id The uuid of the webhook
 * @apiSuccess (201) {String} data.url The url of the webhook
 * @apiSuccess (201) {String} data.label A label for you to keep track of what this webhooks is for
 * @apiSuccess (201) {Boolean} data.enabled Whether the webhook should be sent
 * @apiSuccess (201) {String} data.type The type of the webhook
 * @apiSuccess (201) {Object} data.options The options for the webhook (See examples)
 *
 * @apiUse WebhookBodyInvalid
 */
api.addWebhook = {
  method: 'POST',
  middlewares: [authWithHeaders()],
  url: '/user/webhook',
  async handler (req, res) {
    const { user } = res.locals;
    const webhook = new Webhook(Webhook.sanitize(req.body));

    const existingWebhook = user.webhooks.find(hook => hook.id === webhook.id);

    if (existingWebhook) {
      throw new BadRequest(res.t('webhookIdAlreadyTaken', { id: webhook.id }));
    }

    webhook.formatOptions(res);

    user.webhooks.push(webhook);

    await user.save();

    res.respond(201, webhook);
  },
};

/**
 * @api {get} /api/v3/user/webhook Get webhooks
 * @apiName UserGetWebhook
 * @apiGroup Webhook
 *
 * @apiSuccess {Array} data User's webhooks
 */
api.getWebhook = {
  method: 'GET',
  middlewares: [authWithHeaders()],
  url: '/user/webhook',
  async handler (req, res) {
    const { user } = res.locals;

    res.respond(200, user.webhooks);
  },
};

/**
 * @api {put} /api/v3/user/webhook/:id Edit a webhook - BETA
 * @apiName UserUpdateWebhook
 * @apiGroup Webhook
 * @apiDescription Can change `url`, `enabled`, `type`, and `options`
 * properties. Cannot change `id`.
 *
 * @apiParam (Path) {UUID} id URL parameter - The id of the webhook to update
 * @apiParam (Body) {String} [url] The webhook's URL
 * @apiParam (Body) {String} [label] A label to remind you what this webhook does
 * @apiParam (Body) {Boolean} [enabled] If the webhook should be enabled
 * @apiParam (Body) {String="taskActivity","groupChatReceived",
 *                  "userActivity","questActivity"} [type] The webhook's type.
 * @apiParam (Body) {Object} [options] The webhook's options. Will differ depending on type.
 *                                     The options are enumerated in the
 *                                     [add webhook examples](#api-Webhook-UserAddWebhook).
 * @apiParamExample {json} Update Enabled and Type Properties
 *   {
 *     "enabled": false,
 *     "type": "taskActivity"
 *   }
 * @apiParamExample {json} Update Group Id for Group Chat Receieved Webhook
 *   {
 *     "options": {
 *       "groupId": "new-uuid-of-group"
 *     }
 *   }
 *
 * @apiSuccess {Object} data The updated webhook
 * @apiSuccess {UUID} data.id The uuid of the webhook
 * @apiSuccess {String} data.url The url of the webhook
 * @apiSuccess {String} data.label A label for you to keep track of what this webhooks is for
 * @apiSuccess {Boolean} data.enabled Whether the webhook should be sent
 * @apiSuccess {String} data.type The type of the webhook
 * @apiSuccess {Object} data.options The options for the webhook (See webhook add examples)
 *
 * @apiUse WebhookNotFound
 * @apiUse WebhookBodyInvalid
 *
 */
api.updateWebhook = {
  method: 'PUT',
  middlewares: [authWithHeaders()],
  url: '/user/webhook/:id',
  async handler (req, res) {
    const { user } = res.locals;
    const { id } = req.params;
    const webhook = user.webhooks.find(hook => hook.id === id);
    const {
      url, label, type, enabled, options,
    } = req.body;

    if (!webhook) {
      throw new NotFound(res.t('noWebhookWithId', { id }));
    }

    if (url) {
      webhook.url = url;
    }

    // using this check to allow the setting of empty labels
    if (label !== null && label !== undefined) {
      webhook.label = label;
    }

    if (type) {
      webhook.type = type;
    }

    if (enabled !== undefined) {
      webhook.enabled = enabled;
    }

    if (options) {
      webhook.options = Object.assign(webhook.options, options);
    }

    webhook.formatOptions(res);

    // Tell Mongoose that the webhook's options have been modified
    // so it actually commits the options changes to the database
    webhook.markModified('options');

    await user.save();
    res.respond(200, webhook);
  },
};

/**
* @api {delete} /api/v3/user/webhook/:id Delete a webhook - BETA
* @apiName UserDeleteWebhook
* @apiGroup Webhook
*
* @apiParam (Path) {UUID} id The id of the webhook to delete
*
* @apiSuccess {Array} data The remaining webhooks for the user
* @apiUse WebhookNotFound
*/
api.deleteWebhook = {
  method: 'DELETE',
  middlewares: [authWithHeaders()],
  url: '/user/webhook/:id',
  async handler (req, res) {
    const { user } = res.locals;
    const { id } = req.params;

    const webhook = user.webhooks.find(hook => hook.id === id);

    if (!webhook) {
      throw new NotFound(res.t('noWebhookWithId', { id }));
    }

    removeFromArray(user.webhooks, webhook);

    await user.save();

    res.respond(200, user.webhooks);
  },
};

export default api;
