export const MAX_HEALTH = 50;
export const MAX_LEVEL = 100;
export const MAX_STAT_POINTS = MAX_LEVEL;
export const ATTRIBUTES = ['str', 'int', 'con', 'per'];
export const MAX_INCENTIVES = 500;

export const TAVERN_ID = '00000000-0000-4000-A000-000000000000';
export const LARGE_GROUP_COUNT_MESSAGE_CUTOFF = 5000;
export const MAX_SUMMARY_SIZE_FOR_GUILDS = 250;
export const MAX_SUMMARY_SIZE_FOR_CHALLENGES = 250;
export const MIN_SHORTNAME_SIZE_FOR_CHALLENGES = 3;

export const CHAT_FLAG_LIMIT_FOR_HIDING = 2; // hide posts that have this many flags
export const CHAT_FLAG_FROM_MOD = 5; // a flag from a moderator counts as this many flags
export const CHAT_FLAG_FROM_SHADOW_MUTE = 10; // a shadow-muted user's post starts with this many flags
// @TODO use those constants to replace hard-coded numbers

export const SUPPORTED_SOCIAL_NETWORKS = [
  {key: 'facebook', name: 'Facebook'},
  {key: 'google', name: 'Google'},
];

export const GUILDS_PER_PAGE = 30; // number of guilds to return per page when using pagination

export const PARTY_LIMIT_MEMBERS = 30;
