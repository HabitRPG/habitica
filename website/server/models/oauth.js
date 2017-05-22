import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';
import { v4 as uuid } from 'uuid';
import validator from 'validator';

const Schema = mongoose.Schema;

export let OAuthClientsSchema = new Schema({
  clientName: { type: String },
  clientId: {
    type: String,
    default: uuid,
    validate: [validator.isUUID, 'Invalid uuid.'],
    required: true,
  },
  clientSecret: {
    type: String,
    default: uuid,
    validate: [validator.isUUID, 'Invalid uuid.'],
    required: true,
  },
  redirectUri: { type: String },
});

export let OAuthCodeSchema = new Schema({
  accessCode: { type: String },
  clientId: { type: String, ref: 'OAuthClients', validate: [validator.isUUID, 'Invalid uuid.'] },
  redirectUri: { type: String },
  scope: { type: Array },
});

export let OAuthTokenSchema = new Schema({
  accessToken: { type: String },
  accessTokenExpiresOn: { type: Date },
  clientId: { type: String, ref: 'OAuthClients', validate: [validator.isUUID, 'Invalid uuid.'] },
  scope: { type: Array },
  refreshToken: { type: String },
  refreshTokenExpiresOn: { type: Date },
});

OAuthClientsSchema.plugin(baseModel, {
  noSet: ['_id', 'id', 'challenge'],
  timestamps: true,
  _id: false, // use id instead of _id
});

OAuthCodeSchema.plugin(baseModel, {
  noSet: ['_id', 'id', 'challenge'],
  timestamps: true,
  _id: false, // use id instead of _id
});

OAuthTokenSchema.plugin(baseModel, {
  noSet: ['_id', 'id', 'challenge'],
  timestamps: true,
  _id: false, // use id instead of _id
});


export let OAuthClients = mongoose.model('OAuthClients', OAuthClientsSchema);
export let OAuthCode = mongoose.model('OAuthCode', OAuthCodeSchema);
export let OAuthToken = mongoose.model('OAuthToken', OAuthTokenSchema);