import merge from 'lodash/merge';
import { v4 as uuid } from 'uuid';

import {
  authWithHeaders,
} from '../../middlewares/auth';
import { ensurePermission } from '../../middlewares/ensureAccessRight';
import { model as AppConfigOption } from '../../models/clientConfigOption';
import { NotFound } from '../../libs/errors';

const api = {};

api.retrieveClientConfig = {
  method: 'POST',
  url: '/client-config',
  middlewares: [authWithHeaders({
    optional: true,
  })],
  async handler (req, res) {
    try {
      const appConfigOptions = await AppConfigOption.find({ enabled: true });
      res.respond(200, { data: appConfigOptions });
    } catch (error) {
      res.respond(500, { error: error.message });
    }
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

    merge(clientConfig, AppConfigOption.sanitize(req.body));
    const savedClientConfig = await clientConfig.save();

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

    res.respond(200, savedClientConfig);
  },
};

export default api;
