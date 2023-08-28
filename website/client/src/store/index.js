import axios from 'axios';
import moment from 'moment';
import Store from '@/libs/store';
import deepFreeze from '@/libs/deepFreeze';
import content from '@/../../common/script/content/index';
import * as commonConstants from '@/../../common/script/constants';
import { DAY_MAPPING } from '@/../../common/script/cron';
import { asyncResourceFactory } from '@/libs/asyncResource';
import { setUpAxios } from '@/libs/auth';

import actions from './actions';
import getters from './getters';

const IS_TEST = process.env.NODE_ENV === 'test'; // eslint-disable-line no-process-env

// Load user auth parameters and determine if it's logged in
// before trying to load data
let isUserLoggedIn = false;

// eg, -240 - this will be converted on server as (offset/60)
const browserTimezoneUtcOffset = moment().utcOffset();

axios.defaults.headers.common['x-client'] = 'habitica-web';

let AUTH_SETTINGS = window.localStorage.getItem('habit-mobile-settings');
if (AUTH_SETTINGS) {
  AUTH_SETTINGS = JSON.parse(AUTH_SETTINGS);
  isUserLoggedIn = setUpAxios(AUTH_SETTINGS);
}

const i18nData = window && window['habitica-i18n'];

let availableLanguages = [];
let selectedLanguage = {};

if (i18nData) {
  availableLanguages = i18nData.availableLanguages;
  selectedLanguage = i18nData.language;
}

// Export a function that generates the store and not the store directly
// so that we can regenerate it multiple times for testing, when not testing
// always export the same route

let existingStore;
export default function () {
  if (!IS_TEST && existingStore) return existingStore;

  existingStore = new Store({
    actions,
    getters,
    state: {
      serverAppVersion: null,
      title: 'Habitica',
      isUserLoggedIn,
      // Means the user and the user's tasks are ready
      // @TODO use store.user.loaded since it's an async resource?
      isUserLoaded: false,
      isAmazonReady: false, // Whether the Amazon Payments lib can be used
      user: asyncResourceFactory(),
      // Keep track of the ids of notifications that have been removed
      // to make sure they don't get shown again. It happened due to concurrent requests
      // which in some cases could result in a read notification showing up again
      // see https://github.com/HabitRPG/habitica/issues/9242
      notificationsRemoved: [],
      worldState: asyncResourceFactory(),
      credentials: isUserLoggedIn ? {
        API_ID: AUTH_SETTINGS.auth.apiId,
        API_TOKEN: AUTH_SETTINGS.auth.apiToken,
      } : {},
      // store the timezone offset in case it's different than the one in
      // user.preferences.timezoneOffset and change it after the user is synced
      // in app.vue
      browserTimezoneUtcOffset,
      tasks: asyncResourceFactory(), // user tasks
      // @TODO use asyncresource?
      completedTodosStatus: 'NOT_LOADED',
      party: asyncResourceFactory(),
      partyMembers: asyncResourceFactory(),
      shops: {
        market: asyncResourceFactory(),
        quests: asyncResourceFactory(),
        seasonal: asyncResourceFactory(),
        'time-travelers': asyncResourceFactory(),
      },
      myGuilds: [],
      groupFormOptions: {
        creatingParty: false,
        groupId: '',
      },
      avatarEditorOptions: {
        editingUser: false,
        startingPage: '',
        subPage: '',
      },
      challengeOptions: {
        cloning: false,
        tasksToClone: {},
        workingChallenge: {},
      },
      editingGroup: {}, // @TODO move to local state
      // content data, frozen to prevent Vue from modifying it since it's static and never changes
      // @TODO apply freezing to the entire codebase (the server) and not only to the client side?
      // NOTE this takes about 10-15ms on a fast computer
      content: deepFreeze(content),
      constants: deepFreeze({ ...commonConstants, DAY_MAPPING }),
      i18n: deepFreeze({
        availableLanguages,
        selectedLanguage,
      }),
      hideHeader: false,
      memberModalOptions: {
        viewingMembers: [],
        groupId: '',
        challengeId: '',
        group: {},
        loading: false,
      },
      openedItemRows: [],
      spellOptions: {
        castingSpell: false,
        spellDrawOpen: true,
      },
      profileOptions: {
        startingPage: '',
      },
      giftModalOptions: {
        startingPage: '',
      },
      rageModalOptions: {
        npc: '',
      },
      profileUser: {},
      upgradingGroup: {},
      notificationStore: [],
      modalStack: [],
      equipmentDrawerOpen: true,
      groupPlans: asyncResourceFactory(),
      isRunningYesterdailies: false,
      privateMessageOptions: {
        userIdToMessage: '',
        displayName: '',
        username: '',
        backer: {},
        contributor: {},
      },
      firstDropsOptions: {
        egg: '',
        hatchingPotion: '',
      },
      bugReportOptions: {
        question: false,
      },
    },
  });

  return existingStore;
}
