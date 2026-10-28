import merge from 'lodash/merge';
import { v4 as uuid } from 'uuid';

import {
  authWithHeaders,
} from '../../middlewares/auth';
import { ensurePermission } from '../../middlewares/ensureAccessRight';
import { model as AppConfigOption } from '../../models/clientConfigOption';
import { model as ClientConfigSegment } from '../../models/clientConfigSegment';
import { BadRequest, NotFound } from '../../libs/errors';
import {
  CLIENT_PLATFORMS,
  getClientConfig,
  getTargetingUserFields,
  hasTargeting,
  invalidateClientConfig,
  loadClientConfig,
} from '../../libs/clientConfig';
import { getAttributeDefinitions } from '../../libs/clientConfigTargeting';

const api = {};

const CLIENT_HEADER_PLATFORMS = {
  'habitica-web': 'web',
  'habitica-ios': 'ios',
  'habitica-android': 'android',
};

const authForTargeting = authWithHeaders({
  optional: true,
  leanUser: true,
  userFieldsToInclude: getTargetingUserFields,
});

// Only load the user when some option is targeted at a segment,
// otherwise the config is the same for everyone on a platform.
async function authIfTargeted (req, res, next) {
  try {
    await loadClientConfig();
  } catch (err) {
    return next(err);
  }
  if (!hasTargeting()) return next();
  res.vary('x-api-user');
  // Invalid credentials shouldn't prevent clients from getting the untargeted config
  return authForTargeting(req, res, () => next());
}

async function validateSegmentReferences (values) {
  const segmentIds = (values || []).map(v => v.segment).filter(Boolean);
  if (segmentIds.length === 0) return;
  const count = await ClientConfigSegment.countDocuments({ _id: { $in: segmentIds } }).exec();
  if (count !== new Set(segmentIds).size) throw new BadRequest('Unknown client config segment');
}

api.retrieveClientConfig = {
  method: 'GET',
  url: '/client-config',
  noLanguage: true,
  allowCache: true,
  middlewares: [authIfTargeted],
  async handler (req, res) {
    let { platform } = req.query;
    if (!CLIENT_PLATFORMS.includes(platform)) {
      platform = CLIENT_HEADER_PLATFORMS[req.headers['x-client']] || 'web';
      res.vary('x-client');
    }

    const { user } = res.locals;
    if (user) {
      // Targeted responses must not be stored by shared caches,
      // clients can still revalidate them using the ETag
      res.set('Cache-Control', 'private, no-cache');
    }

    // Keep the body (and ETag) dependent only on the resolved config
    res.respond(200, await getClientConfig(platform, user), undefined, { includeUserData: false });
  },
};

api.adminGetClientConfigs = {
  method: 'GET',
  url: '/admin/client-config',
  middlewares: [authWithHeaders(), ensurePermission('clientConfig')],
  async handler (req, res) {
    const clientConfigs = await AppConfigOption
      .find()
      .sort({ name: 1 })
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
    const sanitized = AppConfigOption.sanitize(req.body);
    await validateSegmentReferences(sanitized.values);
    const clientConfig = await AppConfigOption({
      _id: id,
      ...sanitized,
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
    await validateSegmentReferences(sanitized.values);
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

    const deleteResult = await AppConfigOption.deleteOne({ _id: req.params.clientConfigId }).exec();
    if (deleteResult.deletedCount === 0) throw new NotFound(res.t('clientConfigNotFound'));

    await invalidateClientConfig();

    res.respond(200, { _id: req.params.clientConfigId });
  },
};

api.adminGetClientConfigAttributes = {
  method: 'GET',
  url: '/admin/client-config-attributes',
  middlewares: [authWithHeaders(), ensurePermission('clientConfig')],
  async handler (req, res) {
    res.respond(200, getAttributeDefinitions());
  },
};

api.adminGetClientConfigSegments = {
  method: 'GET',
  url: '/admin/client-config-segments',
  middlewares: [authWithHeaders(), ensurePermission('clientConfig')],
  async handler (req, res) {
    const segments = await ClientConfigSegment
      .find()
      .sort({ name: 1 })
      .lean()
      .exec();

    res.respond(200, segments);
  },
};

api.adminCreateClientConfigSegment = {
  method: 'POST',
  url: '/admin/client-config-segments',
  middlewares: [authWithHeaders(), ensurePermission('clientConfig')],
  async handler (req, res) {
    const segment = await ClientConfigSegment({
      _id: uuid(),
      ...ClientConfigSegment.sanitize(req.body),
    }).save();
    await invalidateClientConfig();

    res.respond(200, segment);
  },
};

api.adminUpdateClientConfigSegment = {
  method: 'PUT',
  url: '/admin/client-config-segments/:segmentId',
  middlewares: [authWithHeaders(), ensurePermission('clientConfig')],
  async handler (req, res) {
    req.checkParams('segmentId', res.t('segmentIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const segment = await ClientConfigSegment.findById(req.params.segmentId).exec();
    if (!segment) throw new NotFound(res.t('segmentNotFound'));

    const sanitized = ClientConfigSegment.sanitize(req.body);
    merge(segment, sanitized);
    if (sanitized.conditions) segment.conditions = sanitized.conditions;
    const savedSegment = await segment.save();
    await invalidateClientConfig();

    res.respond(200, savedSegment);
  },
};

api.adminDeleteClientConfigSegment = {
  method: 'DELETE',
  url: '/admin/client-config-segments/:segmentId',
  middlewares: [authWithHeaders(), ensurePermission('clientConfig')],
  async handler (req, res) {
    req.checkParams('segmentId', res.t('segmentIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const usedBy = await AppConfigOption.findOne({ 'values.segment': req.params.segmentId })
      .select('key').lean().exec();
    if (usedBy) throw new BadRequest(res.t('segmentInUse', { key: usedBy.key }));

    const deleteResult = await ClientConfigSegment
      .deleteOne({ _id: req.params.segmentId }).exec();
    if (deleteResult.deletedCount === 0) throw new NotFound(res.t('segmentNotFound'));

    await invalidateClientConfig();

    res.respond(200, { _id: req.params.segmentId });
  },
};

export default api;
