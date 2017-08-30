import Store from 'client/libs/store';
import deepFreeze from 'client/libs/deepFreeze';
import content from 'common/script/content/index';
import * as commonConstants from 'common/script/constants';
import { DAY_MAPPING } from 'common/script/cron';
import { asyncResourceFactory } from 'client/libs/asyncResource';
import axios from 'axios';

import actions from './actions';
import getters from './getters';

const IS_TEST = process.env.NODE_ENV === 'test'; // eslint-disable-line no-process-env

// Load user auth parameters and determine if it's logged in
// before trying to load data
let isUserLoggedIn = false;
axios.defaults.headers.common['x-client'] = 'habitica-web';

let AUTH_SETTINGS = localStorage.getItem('habit-mobile-settings');

if (AUTH_SETTINGS) {
  AUTH_SETTINGS = JSON.parse(AUTH_SETTINGS);
  axios.defaults.headers.common['x-api-user'] = AUTH_SETTINGS.auth.apiId;
  axios.defaults.headers.common['x-api-key'] = AUTH_SETTINGS.auth.apiToken;
  isUserLoggedIn = true;
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
      title: 'Habitica',
      isUserLoggedIn,
      user: asyncResourceFactory(),
      tasks: asyncResourceFactory(), // user tasks
      completedTodosStatus: 'NOT_LOADED',
      party: {
        quest: {},
        members: asyncResourceFactory(),
      },
      shops: {
        market: asyncResourceFactory(),
        quests: asyncResourceFactory(),
        seasonal: asyncResourceFactory(),
        'time-travelers': asyncResourceFactory(),
      },
      myGuilds: [],
      publicGuilds: [],
      groupFormOptions: {
        creatingParty: false,
        groupId: '',
      },
      avatarEditorOptions: {
        editingUser: false,
        startingPage: '',
        subPage: '',
      },
      flagChatOptions: {
        message: {},
        groupId: '',
      },
      editingGroup: {}, // TODO move to local state
      // content data, frozen to prevent Vue from modifying it since it's static and never changes
      // TODO apply freezing to the entire codebase (the server) and not only to the client side?
      // NOTE this takes about 10-15ms on a fast computer
      content: deepFreeze(content),
      constants: deepFreeze({...commonConstants, DAY_MAPPING}),
      i18n: deepFreeze({
        availableLanguages,
        selectedLanguage,
      }),
      hideHeader: false,
      memberModalOptions: {
        viewingMembers: [],
        groupId: '',
        group: {},
      },
      openedItemRows: [],
      spellOptions: {
        castingSpell: false,
        spellDrawOpen: true,
      },
      profileOptions: {
        startingPage: '',
      },
      profileUser: {},
      upgradingGroup: {},
      notificationStore: [],
    },
  });

  return existingStore;
}
