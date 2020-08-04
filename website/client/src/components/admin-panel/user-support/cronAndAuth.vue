<template>
  <div class="accordion-group">
    <h3
      class="expand-toggle"
      :class="{'open': expand}"
      @click="expand = !expand"
    >
      Timestamps, Time Zone, Authentication, Email Address
      <span
      v-if="errorsOrWarningsExist"
      >- ERRORS / WARNINGS EXIST</span>
    </h3>
    <div v-if="expand">
      <p
        v-if="errorsOrWarningsExist"
        class="errorMessage"
      >
        See error(s) below.
      </p>

      <div>
        Account created:
        <strong>{{ auth.timestamps.created | formatDate }}</strong>
      </div>
      <div>
        Most recent cron:
        <strong>{{ auth.timestamps.loggedin | formatDate }}</strong>
        ("auth.timestamps.loggedin")
      </div>
      <div v-if="this.cronError">
        "lastCron" value:
        <strong>{{ lastCron | formatDate }}</strong>
        <br>
        <span class="errorMessage">
          ERROR: cron probably crashed before finishing
          ("auth.timestamps.loggedin" and "lastCron" dates are different).
        </span>
      </div>
      <div class="subsection-start">
        Time zone:
        <strong>{{ preferences.timezoneOffset | formatTimeZone }}</strong>
      </div>
      <div v-if="this.timezoneDiffError || this.timezoneMissingError">
        Time zone at previous cron:
        <strong>{{ preferences.timezoneOffsetAtLastCron | formatTimeZone }}</strong>

        <div class="errorMessage">
          <div v-if="this.timezoneDiffError">
            ERROR: the player's current time zone is different than their time zone when
            their previous cron ran. This can be because:
            <ul>
              <li>daylight savings started or stopped <sup>*</sup></li>
              <li>the player changed zones due to travel <sup>*</sup></li>
              <li>the player has devices set to different zones <sup>**</sup></li>
              <li>the player uses a VPN with varying zones <sup>**</sup></li>
              <li>something similarly unpleasant is happening. <sup>**</sup></li>
            </ul>
            <p>
              <em>* The problem should fix itself in about a day.</em><br>
              <em>** One of these causes is probably happening if the time zones stay
              different for more than a day.</em>
            </p>
          </div>

          <div v-if="this.timezoneMissingError">
            ERROR: One of the player's time zones is missing.
            This is expected and okay if it's their time zone at last cron
            AND if it's their first day in Habitica.
            Otherwise an error has occurred.
          </div>
        </div>
      </div>

      <div class="subsection-start">
        Local authentication:
        <span v-if="auth.local.email">Yes, &nbsp;
          <strong>{{ auth.local.email }}</strong></span>
        <span v-else><strong>None</strong></span>
      </div>
      <div>
        Google authentication:
        <pre v-if="authMethodExists('google')">{{ auth.google }}</pre>
        <span v-else><strong>None</strong></span>
      </div>
      <div>
        Facebook authentication:
        <pre v-if="authMethodExists('facebook')">{{ auth.facebook }}</pre>
        <span v-else><strong>None</strong></span>
      </div>
      <div>
        Apple ID authentication:
        <pre v-if="authMethodExists('apple')">{{ auth.apple }}</pre>
        <span v-else><strong>None</strong></span>
      </div>
      <div class="subsection-start">
        Full "auth" object for checking above is correct:
        <pre>{{ auth }}</pre>
      </div>
    </div>
  </div>

</template>

<script>
import moment from 'moment';

import filters from '../mixins/filters';

export default {
  mixins: [
    filters,
  ],
  props: {
    auth: {
      type: Object,
      required: true,
    },
    preferences: {
      type: Object,
      required: true,
    },
    lastCron: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      cronError: false,
      timezoneDiffError: false,
      timezoneMissingError: false,
      errorsOrWarningsExist: false,
      expand: false,
    };
  },
  filters: {
    formatTimeZone (timezoneOffset) {
      if (timezoneOffset === undefined) return 'No value recorded.';
      // convert reverse offset to time zone in "+/-H:MM UTC" format
      const sign = (timezoneOffset < 0) ? '+' : '-'; // reverse the sign
      const timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60);
      const timezoneMinutes = Math.floor((Math.abs(timezoneOffset) / 60 - timezoneHours) * 60);
      const timezoneMinutesDisplay = (timezoneMinutes) ? `:${timezoneMinutes}` : ''; // don't display :00
      return `${sign}${timezoneHours}${timezoneMinutesDisplay} UTC`;
    },
  },
  mounted () {
    const cronDate1 = moment(this.auth.timestamps.loggedin);
    const cronDate2 = moment(this.lastCron);
    const maxAllowableSecondsDifference = 60; // expect cron to take less than this many seconds
    if (Math.abs(cronDate1.diff(cronDate2, 'seconds')) > maxAllowableSecondsDifference) {
      this.cronError = true;
      this.errorsOrWarningsExist = true;
    }

    // compare the user's time zones to see if they're different
    if (this.preferences.timezoneOffset === undefined
      || this.preferences.timezoneOffsetAtLastCron === undefined) {
      this.timezoneMissingError = true;
      this.errorsOrWarningsExist = true;
    } else if (this.preferences.timezoneOffset !== this.preferences.timezoneOffsetAtLastCron) {
      this.timezoneDiffError = true;
      this.errorsOrWarningsExist = true;
    }
    this.expand = this.errorsOrWarningsExist;
  },
  methods: {
    authMethodExists (authMethod) {
      if (this.auth[authMethod] && this.auth[authMethod].length !== 0) return true;
      return false;
    },
  },
};
</script>
