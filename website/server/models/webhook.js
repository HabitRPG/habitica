import mongoose from 'mongoose';
import validator from 'validator';
import baseModel from '../libs/baseModel';
import shared from '../../common';
import {v4 as uuid} from 'uuid';
import _ from 'lodash';
import { BadRequest } from '../libs/errors';

const Schema = mongoose.Schema;

const TASK_ACTIVITY_DEFAULT_OPTIONS = Object.freeze({
  created: false,
  updated: false,
  deleted: false,
  scored: true,
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
    enum: ['taskActivity', 'groupChatReceived'],
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
    validate: [validator.isURL, shared.i18n.t('invalidUrl')],
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
    this.options = _(this.options).defaults(TASK_ACTIVITY_DEFAULT_OPTIONS).pick('created', 'updated', 'deleted', 'scored').value();

    let invalidOption = Object.keys(this.options)
      .find(option => typeof this.options[option] !== 'boolean');

    if (invalidOption) {
      throw new BadRequest(res.t('webhookBooleanOption', { option: invalidOption }));
    }
  } else if (this.type === 'groupChatReceived') {
    this.options = _(this.options).pick('groupId').value();

    if (!validator.isUUID(this.options.groupId)) {
      throw new BadRequest(res.t('groupIdRequired'));
    }
  }
};

export let model = mongoose.model('Webhook', schema);
