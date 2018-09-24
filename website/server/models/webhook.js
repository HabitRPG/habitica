import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../libs/baseModel';
import shared from '../../common';
import {v4 as uuid} from 'uuid';
import _ from 'lodash';
import { BadRequest } from '../libs/errors';
import nconf from 'nconf';
import apiError from '../libs/apiError';

const IS_PRODUCTION = nconf.get('IS_PROD');
const Schema = mongoose.Schema;

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
});

export let schema = new Schema({
  id: {
    type: String,
    required: true,
    validate: [validator.isUUID, shared.i18n.t('invalidWebhookId')],
    default: uuid,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'globalActivity', // global webhooks send a request for every type of event
      'taskActivity', 'groupChatReceived',
      'userActivity', 'questActivity',
    ],
    default: 'taskActivity',
  },
  label: {
    type: String,
    required: false,
    default: '',
  },
  url: {
    type: String,
    required: true,
    validate: [(v) => {
      return validator.isURL(v, {
        require_tld: IS_PRODUCTION ? true : false, // eslint-disable-line camelcase
      });
    }, shared.i18n.t('invalidUrl')],
  },
  enabled: { type: Boolean, required: true, default: true },
  options: {
    type: Schema.Types.Mixed,
    required: true,
    default () {
      return {};
    },
  },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  _id: false,
});

schema.plugin(baseModel, {
  noSet: ['_id'],
  timestamps: true,
  _id: false,
});

schema.methods.formatOptions = function formatOptions (res) {
  if (this.type === 'taskActivity') {
    _.defaults(this.options, TASK_ACTIVITY_DEFAULT_OPTIONS);
    this.options = _.pick(this.options, Object.keys(TASK_ACTIVITY_DEFAULT_OPTIONS));

    let invalidOption = Object.keys(this.options)
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

    let invalidOption = Object.keys(this.options)
      .find(option => typeof this.options[option] !== 'boolean');

    if (invalidOption) {
      throw new BadRequest(res.t('webhookBooleanOption', { option: invalidOption }));
    }
  } else if (this.type === 'questActivity') {
    _.defaults(this.options, QUEST_ACTIVITY_DEFAULT_OPTIONS);
    this.options = _.pick(this.options, Object.keys(QUEST_ACTIVITY_DEFAULT_OPTIONS));

    let invalidOption = Object.keys(this.options)
      .find(option => typeof this.options[option] !== 'boolean');

    if (invalidOption) {
      throw new BadRequest(res.t('webhookBooleanOption', { option: invalidOption }));
    }
  } else {
    // Discard all options
    this.options = {};
  }
};

export let model = mongoose.model('Webhook', schema);
