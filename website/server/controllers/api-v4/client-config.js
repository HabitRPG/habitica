import merge from 'lodash/merge';
import { v4 as uuid } from 'uuid';

import {
  authWithHeaders,
} from '../../middlewares/auth';
import { ensurePermission } from '../../middlewares/ensureAccessRight';
import { model as AppConfigOption } from '../../models/clientConfigOption';
import { NotFound } from '../../libs/errors';
import {
  CLIENT_PLATFORMS,
  getClientConfig,
  invalidateClientConfig,
} from '../../libs/clientConfig';

const api = {};

const CLIENT_HEADER_PLATFORMS = {
  'habitica-web': 'web',
  'habitica-ios': 'ios',
  'habitica-android': 'android',
};

api.retrieveClientConfig = {
  method: 'GET',
  url: '/client-config',
  noLanguage: true,
  async handler (req, res) {
    let { platform } = req.query;
    if (!CLIENT_PLATFORMS.includes(platform)) {
      platform = CLIENT_HEADER_PLATFORMS[req.headers['x-client']] || 'web';
      res.vary('x-client');
    }

    res.respond(200, await getClientConfig(platform));
  },
};

api.adminGetClientConfigs = {
  method: 'GET',
  url: '/admin/client-config',
  middlewares: [authWithHeaders(), ensurePermission('clientConfig')],
  async handler (req, res) {
    const clientConfigs = await AppConfigOption
      .find({ enabled: true })
      .lean()
      .exec();

    res.respond(200, clientConfigs);
  },
};

api.adminCreateClientConfig = {
  method: 'POST',
  url: '/admin/client-config',
  middlewares: [authWithHeaders(), ensurePermission('clientConfig')],
  async handler (req, res) {
    const id = uuid();
    const clientConfig = await AppConfigOption({
      _id: id,
      ...AppConfigOption.sanitize(req.body),
    }).save();
    await invalidateClientConfig();

    res.respond(200, clientConfig);
  },
};

api.adminUpdateClientConfig = {
  method: 'PUT',
  url: '/admin/client-config/:clientConfigId',
  middlewares: [authWithHeaders(), ensurePermission('clientConfig')],
  async handler (req, res) {
    req.checkParams('clientConfigId', res.t('clientConfigIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const clientConfig = await AppConfigOption.findById(req.params.clientConfigId).exec();
    if (!clientConfig) throw new NotFound(res.t('clientConfigNotFound'));

    const sanitized = AppConfigOption.sanitize(req.body);
    merge(clientConfig, sanitized);
    clientConfig.values = sanitized.values;
    const savedClientConfig = await clientConfig.save();
    await invalidateClientConfig();

    res.respond(200, savedClientConfig);
  },
};

api.adminDeleteClientConfig = {
  method: 'DELETE',
  url: '/admin/client-config/:clientConfigId',
  middlewares: [authWithHeaders(), ensurePermission('clientConfig')],
  async handler (req, res) {
    req.checkParams('clientConfigId', res.t('clientConfigIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const clientConfig = await AppConfigOption.findById(req.params.clientConfigId).exec();
    if (!clientConfig) throw new NotFound(res.t('clientConfigNotFound'));

    clientConfig.enabled = false;
    const savedClientConfig = await clientConfig.save();
    await invalidateClientConfig();

    res.respond(200, savedClientConfig);
  },
};

export default api;
