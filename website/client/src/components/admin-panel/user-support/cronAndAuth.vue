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
      <div v-if="cronError">
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
      <div v-if="timezoneDiffError || timezoneMissingError">
        Time zone at previous cron:
        <strong>{{ preferences.timezoneOffsetAtLastCron | formatTimeZone }}</strong>

        <div class="errorMessage">
          <div v-if="timezoneDiffError">
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

          <div v-if="timezoneMissingError">
            ERROR: One of the player's time zones is missing.
            This is expected and okay if it's the "Time zone at previous cron"
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
import formatDate from '../filters/formatDate';

function resetData (self) {
  self.cronError = false;
  self.timezoneDiffError = false;
  self.timezoneMissingError = false;
  self.errorsOrWarningsExist = false;
  self.expand = false;

  const cronDate1 = moment(self.auth.timestamps.loggedin);
  const cronDate2 = moment(self.lastCron);
  const maxAllowableSecondsDifference = 60; // expect cron to take less than this many seconds
  if (Math.abs(cronDate1.diff(cronDate2, 'seconds')) > maxAllowableSecondsDifference) {
    self.cronError = true;
    self.errorsOrWarningsExist = true;
  }

  // compare the user's time zones to see if they're different
  if (self.preferences.timezoneOffset === undefined
    || self.preferences.timezoneOffsetAtLastCron === undefined) {
    self.timezoneMissingError = true;
    self.errorsOrWarningsExist = true;
  } else if (self.preferences.timezoneOffset !== self.preferences.timezoneOffsetAtLastCron) {
    self.timezoneDiffError = true;
    self.errorsOrWarningsExist = true;
  }
  self.expand = self.errorsOrWarningsExist;
}

export default {
  filters: {
    formatDate,
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
  props: {
    resetCounter: {
      type: Number,
      required: true,
    },
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
  watch: {
    resetCounter () {
      resetData(this);
    },
  },
  mounted () {
    resetData(this);
  },
  methods: {
    authMethodExists (authMethod) {
      if (this.auth[authMethod] && this.auth[authMethod].length !== 0) return true;
      return false;
    },
  },
};
</script>
