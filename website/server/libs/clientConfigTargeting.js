import { model as User } from '../models/user';

// Allow-list of user attributes segments can target.
// `fields` are the user paths that must be loaded to evaluate the attribute,
// `get` receives a lean user object.
export const ATTRIBUTES = {
  level: {
    name: 'Level',
    type: 'number',
    fields: ['stats.lvl'],
    get: user => (user.stats && user.stats.lvl) || 0,
  },
  loginIncentives: {
    name: 'Login incentives',
    type: 'number',
    fields: ['loginIncentives'],
    get: user => user.loginIncentives || 0,
  },
  subscriber: {
    name: 'Is subscriber',
    type: 'boolean',
    fields: ['purchased.plan'],
    get: user => User.isSubscribed(user),
  },
  username: {
    name: 'Username',
    type: 'string',
    fields: ['auth.local.username'],
    get: user => user.auth && user.auth.local && user.auth.local.username,
  },
  language: {
    name: 'Language',
    type: 'string',
    fields: ['preferences.language'],
    get: user => user.preferences && user.preferences.language,
  },
  inParty: {
    name: 'In a party',
    type: 'boolean',
    fields: ['party._id'],
    get: user => Boolean(user.party && user.party._id),
  },
};

export const OPERATORS = {
  number: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte'],
  boolean: ['eq'],
  string: ['eq', 'neq', 'in', 'nin', 'contains'],
};

const COMPARATORS = {
  eq: (a, b) => a === b,
  neq: (a, b) => a !== b,
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,
  in: (a, b) => b.includes(a),
  nin: (a, b) => !b.includes(a),
  contains: (a, b) => a.includes(b),
};

export const MAX_CONDITIONS = 10;

// Coerces a condition value into the type expected by the attribute and operator.
// Returns undefined if the value can't be coerced.
export function coerceConditionValue (attribute, operator, value) {
  const definition = ATTRIBUTES[attribute];
  if (!definition) return undefined;

  if (operator === 'in' || operator === 'nin') {
    const list = Array.isArray(value) ? value : String(value).split(',');
    return list.map(v => String(v).trim()).filter(v => v.length > 0);
  }
  if (definition.type === 'number') {
    const number = Number(value);
    return Number.isNaN(number) ? undefined : number;
  }
  if (definition.type === 'boolean') {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  }
  return value === undefined || value === null ? undefined : String(value);
}

export function isValidCondition ({ attribute, operator, value } = {}) {
  const definition = ATTRIBUTES[attribute];
  if (!definition || !OPERATORS[definition.type].includes(operator)) return false;
  if (operator === 'in' || operator === 'nin') return Array.isArray(value);
  return typeof value === definition.type; // eslint-disable-line valid-typeof
}

export function compileSegment (segment) {
  const tests = (segment.conditions || []).map(condition => {
    if (!isValidCondition(condition)) return () => false;
    const { get } = ATTRIBUTES[condition.attribute];
    const compare = COMPARATORS[condition.operator];
    return user => compare(get(user), condition.value);
  });

  return user => tests.every(test => test(user));
}

export function getSegmentUserFields (segment) {
  const fields = ['_id'];
  (segment.conditions || []).forEach(({ attribute }) => {
    if (ATTRIBUTES[attribute]) fields.push(...ATTRIBUTES[attribute].fields);
  });
  return fields;
}

// Attribute definitions without the getters, for the admin UI
export function getAttributeDefinitions () {
  return Object.keys(ATTRIBUTES).map(key => ({
    key,
    name: ATTRIBUTES[key].name,
    type: ATTRIBUTES[key].type,
    operators: OPERATORS[ATTRIBUTES[key].type],
  }));
}
