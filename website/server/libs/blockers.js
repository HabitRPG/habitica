import nconf from 'nconf';
import { model as Blocker } from '../models/blocker';
import { registerReloader, reload, invalidate } from './cacheInvalidation';

const CACHE_TYPE = 'blockers';
const RELOAD_INTERVAL = nconf.get('BLOCKERS_RELOAD_INTERVAL') || 60 * 1000;

let blockedIps = new Set();
let blockedClients = new Set();
let blockedEmails = [];

async function reloadBlockers () {
  const blockers = await Blocker
    .find({ disabled: false, area: 'full' })
    .select('type value')
    .lean()
    .exec();

  const valuesOfType = type => blockers
    .filter(blocker => blocker.type === type && blocker.value)
    .map(blocker => blocker.value);

  blockedIps = new Set(valuesOfType('ipaddress'));
  blockedClients = new Set(valuesOfType('client'));
  blockedEmails = valuesOfType('email');
}

registerReloader(CACHE_TYPE, reloadBlockers, { interval: RELOAD_INTERVAL });

export function reloadBlockersNow () {
  return reload(CACHE_TYPE);
}

reloadBlockersNow();

export function isIpBlocked (ip) {
  return blockedIps.has(ip);
}

export function isClientBlocked (client) {
  return blockedClients.has(client);
}

export function isEmailBlocked (email) {
  const lowercaseEmail = email.toLowerCase();
  return blockedEmails.some(block => lowercaseEmail.indexOf(block) !== -1);
}

export function invalidateBlockers () {
  return invalidate(CACHE_TYPE);
}
