<template>
  <form @submit.prevent="saveHero({ hero, msg: 'Authentication' })">
    <div class="card mt-2">
      <div class="card-header">
        <h3
          class="mb-0 mt-0"
          :class="{'open': expand}"
          @click="expand = !expand"
        >
          Timestamps, Time Zone, Authentication, Email Address
          <span
            v-if="errorsOrWarningsExist"
          >- ERRORS / WARNINGS EXIST</span>
        </h3>
      </div>
      <div
        v-if="expand"
        class="card-body"
      >
        <p
          v-if="errorsOrWarningsExist"
          class="errorMessage"
        >
          See error(s) below.
        </p>

        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Account created:</label>
          <strong class="col-sm-9 col-form-label">
            {{ hero.auth.timestamps.created | formatDate }}</strong>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Used third party tools:</label>

          <div class="col-sm-9 col-form-label">
            <strong v-if="hero.flags.thirdPartyTools">
              Yes - {{ hero.flags.thirdPartyTools | formatDate }}</strong>
            <strong v-else>No</strong>
          </div>
        </div>
        <div v-if="cronError" class="form-group row">
          <label class="col-sm-3 col-form-label">lastCron value:</label>
          <strong>{{ hero.lastCron | formatDate }}</strong>
          <br>
          <span class="errorMessage">
            ERROR: cron probably crashed before finishing
            ("auth.timestamps.loggedin" and "lastCron" dates are different).
          </span>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Most recent cron:</label>

          <div class="col-sm-9 col-form-label">
            <strong>
              {{ hero.auth.timestamps.loggedin | formatDate }}</strong>
            <button
              class="btn btn-warning btn-sm ml-4"
              @click="resetCron()"
            >
              Reset Cron to Yesterday
            </button>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Time zone:</label>
          <strong class="col-sm-9 col-form-label">
            {{ hero.preferences.timezoneOffset | formatTimeZone }}</strong>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Custom Day Start time (CDS)</label>
          <div class="col-sm-9">
            <input
              v-model="hero.preferences.dayStart"
              class="form-control levelField"
              type="number"
            >
          </div>
        </div>
        <div v-if="timezoneDiffError || timezoneMissingError">
          Time zone at previous cron:
          <strong>{{ hero.preferences.timezoneOffsetAtLastCron | formatTimeZone }}</strong>

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

        <div class="form-group row">
          <label class="col-sm-3 col-form-label">API Token</label>
          <div class="col-sm-9">
            <button
              value="Change API Token"
              class="btn btn-danger"
              @click="changeApiToken()"
            >
              Change API Token
            </button>
            <div
              v-if="tokenModified"
            >
              <strong>API Token has been changed. Tell the player something like this:</strong>
              <br>
              I've given you a new API Token.
              You'll need to log out of the website and mobile app then log back in
              otherwise they won't work correctly.
              If you have trouble logging out, for the website go to
              https://habitica.com/static/clear-browser-data and click the red button there,
              and for the Android app, clear its data.
              For the iOS app, if you can't log out you might need to uninstall it,
              reboot your phone, then reinstall it.
            </div>
          </div>
        </div>

        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Local Authentication E-Mail</label>
          <div class="col-sm-9">
            <input
              v-model="hero.auth.local.email"
              class="form-control"
              type="text"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Google authentication</label>
          <div class="col-sm-9">
            <pre v-if="authMethodExists('google')">{{ hero.auth.google }}</pre>
            <span v-else><strong>None</strong></span>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Facebook authentication</label>
          <div class="col-sm-9">
            <pre v-if="authMethodExists('facebook')">{{ hero.auth.facebook }}</pre>
            <span v-else><strong>None</strong></span>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Apple ID authentication</label>
          <div class="col-sm-9">
            <pre v-if="authMethodExists('apple')">{{ hero.auth.apple }}</pre>
            <span v-else><strong>None</strong></span>
          </div>
        </div>
        <div class="subsection-start">
          Full "auth" object for checking above is correct:
          <pre>{{ hero.auth }}</pre>
        </div>
      </div>
      <div
        v-if="expand"
        class="card-footer"
      >
        <input
          type="submit"
          value="Save"
          class="btn btn-primary mt-1"
        >
      </div>
    </div>
  </form>
</template>

<script>
import moment from 'moment';
import formatDate from '../filters/formatDate';
import saveHero from '../mixins/saveHero';

function resetData (self) {
  self.cronError = false;
  self.timezoneDiffError = false;
  self.timezoneMissingError = false;
  self.errorsOrWarningsExist = false;
  self.expand = false;

  const cronDate1 = moment(self.hero.auth.timestamps.loggedin);
  const cronDate2 = moment(self.hero.lastCron);
  const maxAllowableSecondsDifference = 60; // expect cron to take less than this many seconds
  if (Math.abs(cronDate1.diff(cronDate2, 'seconds')) > maxAllowableSecondsDifference) {
    self.cronError = true;
    self.errorsOrWarningsExist = true;
  }

  // compare the user's time zones to see if they're different
  const newTimezone = self.hero.preferences.timezoneOffset;
  const oldTimezone = self.hero.preferences.timezoneOffsetAtLastCron;
  if ((newTimezone === undefined || oldTimezone === undefined)
      && (self.cronError || self.hero.flags.cronCount > 0)) {
    self.timezoneMissingError = true;
    self.errorsOrWarningsExist = true;
  } else if (newTimezone !== oldTimezone) {
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
  mixins: [
    saveHero,
  ],
  props: {
    resetCounter: {
      type: Number,
      required: true,
    },
    hero: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      cronError: false,
      timezoneDiffError: false,
      timezoneMissingError: false,
      tokenModified: false,
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
      if (this.hero.auth[authMethod] && this.hero.auth[authMethod].length !== 0) return true;
      return false;
    },
    async changeApiToken () {
      this.hero.changeApiToken = true;
      await this.saveHero({ hero: this.hero, msg: 'API Token' });
      this.tokenModified = true;
    },
    resetCron () {
      this.hero.resetCron = true;
      this.saveHero({ hero: this.hero, msg: 'Last Cron', clearData: true });
    },
  },
};
</script>
