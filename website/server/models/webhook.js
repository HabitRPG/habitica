import mongoose from 'mongoose';
import validator from 'validator';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import nconf from 'nconf';
import baseModel from '../libs/baseModel';
import shared from '../../common';
import { BadRequest } from '../libs/errors';
import apiError from '../libs/apiError';

const IS_PRODUCTION = nconf.get('IS_PROD');
const { Schema } = mongoose;

const TASK_ACTIVITY_DEFAULT_OPTIONS = Object.freeze({
  created: false,
  updated: false,
  deleted: false,
  checklistScored: false,
  scored: true,
});

const USER_ACTIVITY_DEFAULT_OPTIONS = Object.freeze({
  petHatched: false,
  mountRaised: false,
  leveledUp: false,
});

const QUEST_ACTIVITY_DEFAULT_OPTIONS = Object.freeze({
  questStarted: false,
  questFinished: false,
  questInvited: false,
});

export const schema = new Schema({
  id: {
    $type: String,
    required: true,
    validate: [v => validator.isUUID(v), shared.i18n.t('invalidWebhookId')],
    default: uuid,
  },
  type: {
    $type: String,
    required: true,
    enum: [
      'globalActivity', // global webhooks send a request for every type of event
      'taskActivity', 'groupChatReceived',
      'userActivity', 'questActivity',
    ],
    default: 'taskActivity',
  },
  label: {
    $type: String,
    required: false,
    default: '',
  },
  url: {
    $type: String,
    required: true,
    validate: [v => validator.isURL(v, {
      require_tld: !!IS_PRODUCTION, // eslint-disable-line camelcase
      require_protocol: true,
      protocols: ['http', 'https'],
    }), shared.i18n.t('invalidUrl')],
  },
  enabled: { $type: Boolean, required: true, default: true },
  // How many times this webhook has failed, disabled after 10
  failures: { $type: Number, default: 0 },
  // When the last failure happened, if older than 1 month the number of failures is reset
  lastFailureAt: { $type: Date },
  options: {
    $type: Schema.Types.Mixed,
    required: true,
    default () {
      return {};
    },
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false,
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  noSet: ['_id', 'failures', 'lastFailureAt'],
  timestamps: true,
  _id: false,
});

schema.methods.formatOptions = function formatOptions (res) {
  if (this.type === 'taskActivity') {
    _.defaults(this.options, TASK_ACTIVITY_DEFAULT_OPTIONS);
    this.options = _.pick(this.options, Object.keys(TASK_ACTIVITY_DEFAULT_OPTIONS));

    const invalidOption = Object.keys(this.options)
      .find(option => typeof this.options[option] !== 'boolean');

    if (invalidOption) {
      throw new BadRequest(res.t('webhookBooleanOption', { option: invalidOption }));
    }
  } else if (this.type === 'groupChatReceived') {
    this.options = _.pick(this.options, 'groupId');

    if (!validator.isUUID(String(this.options.groupId))) {
      throw new BadRequest(apiError('groupIdRequired'));
    }
  } else if (this.type === 'userActivity') {
    _.defaults(this.options, USER_ACTIVITY_DEFAULT_OPTIONS);
    this.options = _.pick(this.options, Object.keys(USER_ACTIVITY_DEFAULT_OPTIONS));

    const invalidOption = Object.keys(this.options)
      .find(option => typeof this.options[option] !== 'boolean');

    if (invalidOption) {
      throw new BadRequest(res.t('webhookBooleanOption', { option: invalidOption }));
    }
  } else if (this.type === 'questActivity') {
    _.defaults(this.options, QUEST_ACTIVITY_DEFAULT_OPTIONS);
    this.options = _.pick(this.options, Object.keys(QUEST_ACTIVITY_DEFAULT_OPTIONS));

    const invalidOption = Object.keys(this.options)
      .find(option => typeof this.options[option] !== 'boolean');

    if (invalidOption) {
      throw new BadRequest(res.t('webhookBooleanOption', { option: invalidOption }));
    }
  } else {
    // Discard all options
    this.options = {};
  }
};

export const model = mongoose.model('Webhook', schema);
