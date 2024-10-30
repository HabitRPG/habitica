<template>
  <div>
    <div
      v-if="loading"
      id="loading-screen-inapp"
    >
      <div class="row">
        <div class="col-12 text-center">
          <!-- eslint-disable max-len -->
          <svg
            id="melior"
            class="color svg svg-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 80 80"
          >
            // eslint-disable-next-line vue/html-self-closing
            <path
              xmlns="http://www.w3.org/2000/svg"
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M79.05 72.15c-.8-1.766-2.643-2.62-3.845-1.766-1.201.855-2.867.985-4.448.602-1.584-.385-1.885-4.01-1.543-8.195.342-4.184.909-5.795 1.267-7.314.404-1.524 2.191-1.404 2.405-.209.215 1.196 1.454 1.196 3.266-.979 1.811-2.175 1.543-8.52-.546-13.684-2.088-5.163.817-4.661 1.66-4.149.844.513 1.362-.255 1.156-3.2-.204-2.945-2.916-5.247-5.096-6.657-2.184-1.41-4.842-2.967-4.78-6.745.063-3.777 5.2-3.658 5.897-3.596.697.063 2.037-.233 1.264-4.157-.773-3.924-3.575-4.673-5.332-4.567-1.758.106-2.943 1.071-5.427.133-2.484-.938-4.136-.572-6.45-.057-2.313.515-5.343 1.94-9.112 2.959-1.989.545-2.661.683-4.828.718-1.33.02-1.885 1.633-.106 3.61 1.408 1.608 4.597 2.036 6.515 1.768 1.236-.174 1.521.645 1.407 1.85a20.023 20.023 0 0 0-.024 4.488c.198 1.5.45 4.051-.258 5.713-.35.817-1.361 1.693-2.449 1.633-1.413-.084-2.555-1.75-3.537-3.726-2.06-4.152-4.48-5.033-13.509-8.835-8.12-3.417-12.516-8.749-15.24-12.185-2.421-3.042-4.846-1.89-4.626.855.179 2.128 1.48 9.008 4.781 13.141 4.058 6.314 10.32 9.177 17.534 9.739 1.885.149 3.065.52 3.225 1.383.236 1.835-1.557 3.11-4.898 2.722-3.341-.39-4.768.22-4.103 2.121 2.123 4.477 7.021 4.672 9.058 4.857.686.122 3.114 0 4.41.355 1.51.418 1.836 2.514-.353 3.648-3.892 1.903-5.59 3.479-7.561 7.075-1.486 2.826-2.77 7.555-1.435 14.365 1.283 6.62-8.342 6.83-12.497 5.89-1.793-.377-3.675-3.778.716-6.625 3.553-2.305 4.269-3.724 4.111-6.642-.184-3.4-2.058-3.644-2.053-6.598v-7.05c0-.602-.488-1.088-1.087-1.088h-3.334a1.087 1.087 0 0 1-1.087-1.087v-4.25c0-.602-.488-1.087-1.088-1.087h-3.317a1.087 1.087 0 0 1-1.087-1.088v-3.81c0-.602-.489-1.087-1.088-1.087h-4.04a1.087 1.087 0 0 1-1.089-1.088V26.25c0-.602-.488-1.088-1.087-1.088H1.088C.485 25.161 0 25.65 0 26.25v4.26c0 .602.488 1.087 1.088 1.087h4.049c.602 0 1.087.489 1.087 1.088v15.192c0 .602.489 1.087 1.088 1.087h4.277c.602 0 1.088.489 1.088 1.088v4.968c0 .602.488 1.087 1.087 1.087h6.005c1.836-.13 2.156 2.335 2.137 3.214-.04 2.007-2.308 2.652-3.382 3.487-2.861 2.21-5.077 4.459-3.78 8.781l.032.09c2.362 5.017 8.855 4.499 12.956 4.499h25.817c1.459 0 2.959.339 2.614-1.362-.342-1.7-1.063-4.024-3.162-4.024-2.1 0-1.758 1.166-3.81.57-2.054-.597-2.057-3.371 1.027-8.198 3.19-4.122 8.652-3.81 11.952-.895 3.301 2.915 2.325 7.978 1.633 10.885-.396 2.048.545 3.06 1.67 3.032H78.58c2.015-.035 1.62-1.391.464-4.035h.008z"
              fill="#fff"
            >
            </path>
          </svg>
          <!-- eslint-enable max-len -->
        </div>
      </div>
    </div>
    <snackbars />
    <router-view v-if="!isUserLoggedIn || isStaticPage" />
    <user-main v-else />
  </div>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  #loading-screen-inapp {
    #melior {
      color: $white;
      height: 80px;
      margin: 0 auto;
      object-fit: contain;
      width: 80px;
    }

    .row {
      width: 100%;
    }

    h2 {
      color: $white;
      font-size: 32px;
      font-weight: bold;
    }

    p {
      margin: 0 auto;
      width: 448px;
      font-size: 24px;
      color: #d5c8ff;
    }
  }

  .casting-spell {
    cursor: crosshair;
  }

  .container-fluid {
    flex: 1 0 auto;
  }

  .no-margin {
    margin-left: 0;
    margin-right: 0;
    padding-left: 0;
    padding-right: 0;
  }

  .notification {
    border-radius: 1000px;
    background-color: $green-10;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    padding: .5em 1em;
    color: $white;
    margin-top: .5em;
    margin-bottom: .5em;
  }
</style>

<style lang='scss'>
  @import '~@/assets/scss/colors.scss';

  .modal-backdrop {
    opacity: .9 !important;
    background-color: $purple-100 !important;
  }

  /* Push progress bar above modals */
  #nprogress .bar {
    z-index: 1600 !important; /* Must stay above nav bar */
  }
</style>

<script>
import axios from 'axios';

import * as Analytics from '@/libs/analytics';
import { mapState } from '@/libs/store';
import userMain from '@/pages/user-main';
import snackbars from '@/components/snackbars/notifications';

const COMMUNITY_MANAGER_EMAIL = process.env.EMAILS_COMMUNITY_MANAGER_EMAIL; // eslint-disable-line

export default {
  name: 'App',
  components: {
    snackbars,
    userMain,
  },
  data () {
    return {
      selectedItemToBuy: null,
      selectedSpellToBuy: null,

      audioSource: null,
      audioSuffix: null,

      loading: true,
      bannerHidden: false,
    };
  },
  computed: {
    ...mapState(['isUserLoggedIn', 'isUserLoaded', 'notificationsRemoved']),
    ...mapState({ user: 'user.data' }),
    isStaticPage () {
      return this.$route.meta.requiresLogin === false;
    },
  },
  created () {
    // Setup listener for title
    this.$store.watch(state => state.title, title => {
      document.title = title;
    });
    this.$store.watch(state => state.isUserLoaded, () => {
      if (this.isUserLoaded) {
        this.hideLoadingScreen();
      }
    });
    this.$nextTick(() => {
      // Load external scripts after the app has been rendered
      Analytics.load();
    });

    axios.interceptors.response.use(response => { // Set up Response interceptors
      // Verify that the user was not updated from another browser/app/client
      // If it was, sync
      const { url } = response.config;
      const { method } = response.config;

      const isApiCall = url.indexOf('api/v4') !== -1;
      const userV = response.data && response.data.userV;

      if (this.isUserLoaded && isApiCall && userV) {
        const oldUserV = this.user._v;
        this.user._v = userV;

        // Do not sync again if already syncing
        const isUserSync = url.indexOf('/api/v4/user') === 0 && method === 'get';
        const isTasksSync = url.indexOf('/api/v4/tasks/user') === 0 && method === 'get';
        // exclude chat seen requests because with real time chat they would be too many
        const isChatSeen = url.indexOf('/chat/seen') !== -1 && method === 'post';
        // exclude POST /api/v4/cron because the user is synced automatically after cron runs
        const isCron = url.indexOf('/api/v4/cron') === 0 && method === 'post';
        // exclude skills casting as they already return the synced user
        const isCast = url.indexOf('/api/v4/user/class/cast') !== -1 && method === 'post';

        // Something has changed on the user object that was not tracked here, sync the user
        if (
          userV - oldUserV > 1 && !isCron && !isChatSeen && !isUserSync && !isTasksSync && !isCast
        ) {
          Promise.all([
            this.$store.dispatch('user:fetch', { forceLoad: true }),
            this.$store.dispatch('tasks:fetchUserTasks', { forceLoad: true }),
          ]);
        }
      }

      // Store the app version from the server
      const serverAppVersion = response.data && response.data.appVersion;

      if (serverAppVersion && this.$store.state.serverAppVersion !== response.data.appVersion) {
        this.$store.state.serverAppVersion = serverAppVersion;
      }

      // Store the notifications, filtering those that have already been read
      // See store/index.js on why this is necessary
      if (this.user && response.data && response.data.notifications) {
        const filteredNotifications = response.data.notifications.filter(serverNotification => {
          if (this.notificationsRemoved.includes(serverNotification.id)) return false;
          return true;
        });
        this.$set(this.user, 'notifications', filteredNotifications);
      }

      return response;
    }, error => { // Set up Error interceptors
      if (error.response.status >= 400) {
        const isBanned = this.checkForBannedUser(error);
        if (isBanned === true) return null; // eslint-disable-line consistent-return

        // Don't show errors from getting user details. These users have delete their account,
        // but their chat message still exists.
        const configExists = Boolean(error.response) && Boolean(error.response.config);
        if (configExists && error.response.config.method === 'get' && error.response.config.url.indexOf('/api/v4/members/') !== -1) {
          // @TODO: We resolve the promise because we need our caching to cache this user as tried
          // Chat paging should help this, but maybe we can also find another solution..
          return Promise.resolve(error);
        }

        const errorData = error.response.data;
        const errorMessage = errorData.message || errorData;

        // Check for conditions to reset the user auth
        // TODO use a specific error like NotificationNotFound instead of checking for the string
        const invalidUserMessage = [this.$t('invalidCredentials'), 'Missing authentication headers.'];
        if (invalidUserMessage.indexOf(errorMessage) !== -1) {
          this.$store.dispatch('auth:logout', { redirectToLogin: true });
          return null;
        }

        // Most server errors should return is click to dismiss errors, with some exceptions
        let snackbarTimeout = false;
        if (error.response.status === 502) snackbarTimeout = true;

        const errorsToShow = [];
        // show only the first error for each param
        const paramErrorsFound = {};
        if (errorData.errors) {
          for (const e of errorData.errors) {
            if (!paramErrorsFound[e.param]) {
              errorsToShow.push(e.message);
              paramErrorsFound[e.param] = true;
            }
          }
        } else {
          errorsToShow.push(errorMessage);
        }

        // Ignore NotificationNotFound errors, see https://github.com/HabitRPG/habitica/issues/10391
        if (errorData.error !== 'NotificationNotFound') {
          // dispatch as one snackbar notification
          this.$store.dispatch('snackbars:add', {
            title: 'Habitica',
            text: errorsToShow.join(' '),
            type: 'error',
            timeout: snackbarTimeout,
          });
        }
      }

      return Promise.reject(error);
    });
  },
  mounted () {
    // Remove the index.html loading screen and now show the inapp loading
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) document.body.removeChild(loadingScreen);

    if (this.isStaticPage || !this.isUserLoggedIn) {
      this.hideLoadingScreen();
    }
  },
  methods: {
    hideLoadingScreen () {
      this.loading = false;
    },
    checkForBannedUser (error) {
      const AUTH_SETTINGS = localStorage.getItem('habit-mobile-settings');
      const parseSettings = JSON.parse(AUTH_SETTINGS);
      const errorMessage = error.response.data.message;

      // Case where user is not logged in
      if (!parseSettings) {
        return false;
      }

      const bannedMessage = this.$t('accountSuspended', {
        communityManagerEmail: COMMUNITY_MANAGER_EMAIL,
        userId: parseSettings.auth.apiId,
      });

      if (errorMessage !== bannedMessage) return false;

      this.$store.dispatch('auth:logout', { redirectToLogin: true });
      return true;
    },
  },
};
</script>

<style src="@/assets/scss/index.scss" lang="scss"></style>
<style src="@/assets/scss/sprites.scss" lang="scss"></style>
