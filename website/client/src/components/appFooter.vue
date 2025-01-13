<template>
  <div>
    <buy-gems-modal v-if="user" />
    <footer>
      <!-- Product -->
      <div class="product">
        <h3>{{ $t('footerProduct') }}</h3>
        <ul>
          <li>
            <a
              href="https://itunes.apple.com/us/app/habitica/id994882113?ls=1&mt=8"
              target="_blank"
            >{{ $t('mobileIOS') }}
            </a>
          </li>
          <li>
            <a
              href="https://play.google.com/store/apps/details?id=com.habitrpg.android.habitica"
              target="_blank"
            >{{ $t('mobileAndroid') }}
            </a>
          </li>
          <li>
            <router-link :to="user ? '/group-plans' : '/static/group-plans'">
              {{ $t('groupPlans') }}
            </router-link>
          </li>
          <li>
            <router-link to="/static/features">
              {{ $t('companyAbout') }}
            </router-link>
          </li>
        </ul>
      </div>
      <!-- Company -->
      <div class="company">
        <h3>{{ $t('footerCompany') }}</h3>
        <ul>
          <li>
            <router-link to="/static/contact">
              {{ $t('contactUs') }}
            </router-link>
          </li>
          <li>
            <router-link to="/static/press-kit">
              {{ $t('presskit') }}
            </router-link>
          </li>
          <li>
            <a
              href="https://habitica.wordpress.com/"
              target="_blank"
            >{{ $t('companyBlog') }}
            </a>
          </li>
          <li>
            <a
              href="https://habitica.fandom.com/wiki/Whats_New"
              target="_blank"
            >{{ $t('oldNews') }}
            </a>
          </li>
        </ul>
      </div>
      <!-- Community -->
      <div class="community">
        <h3>{{ $t('footerCommunity') }}</h3>
        <ul>
          <li>
            <a
              target="_blank"
              href="/static/community-guidelines"
            >{{ $t('communityGuidelines') }}
            </a>
          </li>
          <li>
            <router-link to="/hall/contributors">
              {{ $t('hall') }}
            </router-link>
          </li>
          <li>
            <a
              href="https://habitica.fandom.com/wiki/Contributing_to_Habitica"
              target="_blank"
            >{{ $t('companyContribute') }}
            </a>
          </li>
          <li>
            <a
              href="https://translate.habitica.com/"
              target="_blank"
            >{{ $t('translateHabitica') }}
            </a>
          </li>
        </ul>
      </div>
      <!-- Support -->
      <div class="support">
        <h3>{{ $t ('support') }}</h3>
        <ul>
          <li>
            <router-link to="/static/faq">
              {{ $t('FAQ') }}
            </router-link>
          </li>
          <li
            v-if="user"
          >
            <a
              href=""
              target="_blank"
              @click.prevent="openBugReportModal()"
            >
              {{ $t('reportBug') }}
            </a>
          </li>
          <li
            v-else
          >
            <a
              href="mailto:admin@habitica.com?subject=Habitica Web Bug Report"
              target="_blank"
            >
              {{ $t('reportBug') }}
            </a>
          </li>
          <li>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScPhrwq_7P1C6PTrI3lbvTsvqGyTNnGzp1ugi1Ml0PFee_p5g/viewform?usp=sf_link"
              target="_blank"
            >{{ $t('requestFeature') }}
            </a>
          </li>
        </ul>
      </div>
      <!-- Developers -->
      <div class="developers">
        <h3>{{ $t('footerDevs') }}</h3>
        <ul>
          <li>
            <a
              href="/apidoc"
              target="_blank"
            >{{ $t('APIv3') }}
            </a>
          </li>
          <li>
            <a
              :href="getDataDisplayToolUrl"
              target="_blank"
            >{{ $t('dataDisplayTool') }}
            </a>
          </li>
          <li>
            <a
              href="https://habitica.fandom.com/wiki/Guidance_for_Blacksmiths"
              target="_blank"
            >{{ $t('guidanceForBlacksmiths') }}
            </a>
          </li>
          <li>
            <a
              href="https://habitica.fandom.com/wiki/Extensions,_Add-Ons,_and_Customizations"
              target="_blank"
            >{{ $t('communityExtensions') }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Help Support Habitica -->
      <div class="donate">
        <div>
          <h3>{{ $t('helpSupportHabitica') }}</h3>
          <p class="donate-text">
            {{ $t('donateText3') }}
          </p>
        </div>
      </div>
      <div class="donate-button">
        <button
          class="btn button btn-secondary btn-contribute"
          @click="donate()"
        >
          <div class="text">
            💜 {{ $t('companyDonate') }}
          </div>
        </button>
      </div>

      <!-- Social - Desktop/Tablet -->
      <div class="social">
        <div>
          <h3>{{ $t('footerSocial') }}</h3>
          <div class="icons">
            <a
              class="social-circle"
              href="https://www.instagram.com/habitica/"
              target="_blank"
            >
              <div
                class="social-icon svg-icon instagram"
                v-html="icons.instagram"
              ></div>
            </a>
            <a
              class="social-circle"
              href="https://twitter.com/habitica/"
              target="_blank"
            >
              <div
                class="social-icon svg-icon twitter"
                v-html="icons.twitter"
              ></div>
            </a>
            <a
              class="social-circle"
              href="https://www.facebook.com/Habitica/"
              target="_blank"
            >
              <div
                class="social-icon facebook svg-icon"
                v-html="icons.facebook"
              ></div>
            </a><a
              class="social-circle"
              href="http://blog.habitrpg.com/"
              target="_blank"
            >
              <div
                class="social-icon tumblr svg-icon"
                v-html="icons.tumblr"
              ></div>
            </a>
          </div>
        </div>
      </div>

      <div class="hr">
        <div>
          <hr>
        </div>
      </div>
      <!-- Colophon -->
      <div class=" copyright">
        <div>
          © {{ currentYear }} Habitica. All rights reserved.
        </div>
      </div>
      <div class="melior">
        <div
          class="logo svg svg-icon color"
          v-html="icons.melior"
        ></div>
      </div>
      <!-- DESKTOP PRIVACY & TERMS -->
      <div class="privacy-terms">
        <span class="privacy-policy">
          <a
            target="_blank"
            href="/static/privacy"
          >{{ $t('privacy') }}</a>
        </span>
        <span class="terms">
          <a
            target="_blank"
            href="/static/terms"
          >{{ $t('terms') }}</a>
        </span>
      </div>
      <!-- MOBILE PRIVACY & TERMS -->
      <div class="privacy-policy mobile desktop">
        <a
          target="_blank"
          href="/static/privacy"
        >{{ $t('privacy') }}</a>
      </div>
      <div class="mobile-terms mobile desktop">
        <a
          target="_blank"
          href="/static/terms"
        >{{ $t('terms') }}</a>
      </div>

      <div
        class="time-travel"
        v-if="TIME_TRAVEL_ENABLED && user?.permissions?.fullAccess"
        :key="lastTimeJump"
      >
        <a
          class="btn btn-secondary mr-1"
          @click="jumpTime(-1)"
        >-1 Day</a>
        <a
          class="btn btn-secondary mr-1"
          @click="jumpTime(-7)"
        >-7 Days</a>
        <a
          class="btn btn-secondary mr-1"
          @click="jumpTime(-30)"
        >-30 Days</a>
        <div class="my-2">
          Time Traveling! It is {{ new Date().toLocaleDateString() }}
          <a
            class="btn btn-small"
            @click="resetTime()"
          >
            Reset
        </a>
        </div>
        <a
          class="btn btn-secondary mr-1"
          @click="jumpTime(1)"
        >+1 Day</a>
        <a
          class="btn btn-secondary mr-1"
          @click="jumpTime(7)"
        >+7 Days</a>
        <a
          class="btn btn-secondary mr-1"
          @click="jumpTime(30)"
        >+30 Days</a>
      </div>

      <div
        v-if="DEBUG_ENABLED && isUserLoaded"
        class="debug-toggle"
      >
        <button
          class="debug btn-primary"
          @click="debugMenuShown = !debugMenuShown"
        >
          Toggle Debug Menu
        </button>
        <div
          v-if="debugMenuShown"
          class="btn debug-toggle debug-group"
        >
          <div class="debug-pop">
            <a
              class="btn btn-secondary"
              @click="setHealthLow()"
            >Reduce Health to 1</a>
            <a
              class="btn btn-secondary"
              @click="addMissedDay(1)"
            >+1 Missed Day</a>
            <a
              class="btn btn-secondary"
              @click="addMissedDay(2)"
            >+2 Missed Days</a>
            <a
              class="btn btn-secondary"
              @click="addMissedDay(8)"
            >+8 Missed Days</a>
            <a
              class="btn btn-secondary"
              @click="addMissedDay(32)"
            >+32 Missed Days</a>
            <a
              class="btn btn-secondary"
              @click="addTenGems()"
            >+10 Gems</a>
            <a
              class="btn btn-secondary"
              @click="addHourglass()"
            >+1 Mystic Hourglass</a>
            <a
              class="btn btn-secondary"
              @click="addGold()"
            >+500GP</a>
            <a
              class="btn btn-secondary"
              @click="plusTenHealth()"
            >+ 10HP</a>
            <a
              class="btn btn-secondary"
              @click="addMana()"
            >+MP</a>
            <a
              class="btn btn-secondary"
              @click="addLevelsAndGold()"
            >+Exp +GP +MP</a>
            <a
              class="btn btn-secondary"
              @click="addExp()"
            >+Exp</a>
            <a
              class="btn btn-secondary"
              @click="addOneLevel()"
            >+1 Level</a>
            <a
              class="btn btn-secondary"
              tooltip="+1000 to boss quests. 300 items to collection quests"
              @click="addQuestProgress()"
            >Quest Progress Up</a>
            <a
              class="btn btn-secondary"
              @click="bossRage()"
            >+ Boss Rage 😡</a>
            <a
              class="btn btn-secondary"
              @click="makeAdmin()"
            >Make Admin</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
.footer-row {
  margin: 0;
  flex: 0 1 auto;
  z-index: 10;
}

button {
  border: none;
  border-radius: 4px;
  text-align: center;
  line-height: 1.71;
  font-weight: 700;
  font-size: .875rem;
  margin-bottom: 1rem;
  padding: .5rem 1rem;
  box-shadow: 0 1px 3px 0 rgb(26 24 29 / 12%), 0 1px 2px 0 rgb(26 24 29 / 24%);
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

li {
  margin: 0 0 .5rem 0;
  padding: 0;
}

.product { grid-area: product; }
.company { grid-area: company; }
.community { grid-area: community; }
.support { grid-area: support; }
.developers { grid-area: developers; }

// row 2
.donate {
  align-items: flex-end;
  display: flex;
  justify-content: flex-start;
  grid-area: donate;
  padding-top: 12px;
}
.donate-text {
  grid-area: donate-text;
  font-size: 0.75rem;
  color: $gray-100;
  line-height: 1.33;
  display: flex;
  flex-shrink: 1;
}
.donate-button {
  grid-area: donate-button;
  padding-top: 44px;
 }
.social {
  align-items: flex-start;
  display: flex;
  justify-content: flex-start;
  grid-area: social;
  padding-top: 12px;
}

// row 3
.hr {
  color: $gray-400;
  grid-area: hr;
}

// row 4
.copyright {
  grid-area: copyright;
  line-height: 1.71;
}
.melior { grid-area: melior; }
.privacy-terms {
  grid-area: privacy-terms;
  display: flex;
  justify-content: flex-end;
  line-height: 1.71;
}
.terms {
  padding-left: 16px;
  }
  .mobile {
    display: none;
  }

// row 5
.debug-toggle { grid-area: debug-toggle;}
.debog-pop {
  grid-area: debug-pop;
   }

.time-travel {
  grid-area: time-travel;

  a:hover {
    text-decoration: none !important;
  }

}

footer {
  background-color: $gray-500;
  color: $gray-50;
  padding: 32px 142px 40px;
  a {
    color: $gray-50;
  }
  a:hover {
    color: $purple-300;
    text-decoration: underline;
  }

  column-gap: 1.5rem;
  display: grid;
  grid-template-areas:
    "product company community support developers"
    "donate donate donate donate-button social"
    "donate-text donate-text donate-text donate-button social"
    "hr hr hr hr hr"
    "copyright copyright melior privacy-terms privacy-terms"
    "time-travel time-travel time-travel time-travel time-travel"
    "debug-toggle debug-toggle debug-toggle debug-toggle debug-toggle";
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: auto;

}

h3 {
  font-weight: bold;
}

.icons {
  display: flex;
  height: 24px;
  padding-top: 4px;
}

.social-circle {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: $gray-50;
  display: flex;
  margin: 0 8px 0 8px;
  &:first-child {
    margin-left: 0;
  }
  &:last-child {
    margin-right: 0;
  }
}

.logo {
  color: $gray-200;
  height: 24px;
  margin: 0px auto 5px;
  width: 24px;
}

.terms {
  padding-left: 16px;
  display: flex;
  justify-content: flex-end;
}

.desktop {
  display: none;
}

.debug {
  border: 2px solid transparent;
  box-shadow: 0 1px 3px 0 rgba($black, 0.12), 0 1px 2px 0 rgba($black, 0.24);
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding: 2px 12px;

  &:hover {
    box-shadow: 0 3px 6px 0 rgba($black, 0.12), 0 3px 6px 0 rgba($black, 0.24);
  }
  &:focus  {
    border: 2px solid $purple-400 !important;
    box-shadow: 0 3px 6px 0 rgba($black, 0.12), 0 3px 6px 0 rgba($black, 0.24);
  }
  :active {
    border: 2px solid $purple-600 !important;
    box-shadow: none;
  }
}

.debug-group {
  background-color: $gray-600;
  border: 2px solid transparent;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 rgba($black, 0.12), 0 1px 2px 0 rgba($black, 0.24);
  font-weight: 700;
  padding: 8px 16px;

 .btn {
  margin: 2px;
  }

  a:hover {
    border: 2px solid transparent;
    box-shadow: 0 1px 3px 0 rgba($black, 0.12), 0 1px 2px 0 rgba($black, 0.24);
    text-decoration: none !important;
  }
}

.btn-small {
  background-color: $maroon-100;
  border: 2px solid transparent;
  color: $white !important;
  line-height: 18px;
  &:hover {
    background-color: $maroon-100;
    text-decoration: none !important;
    border: 2px solid $maroon-100;
  }
}
.btn-secondary {
  padding: 2px 12px;
}
.btn-secondary a:hover {
  text-decoration: none !important;
}

.btn-contribute {
  border: 2px solid transparent;

  a {
    display: flex;
  }

  .text{
    display: inline-block;
    vertical-align: bottom;
    text-overflow: hidden;
  }
}

// media breakpoints

// Small devices (landscape phones, 576px and under)
@media (max-width: 767.99px) {

  // row 1
  .product {
    grid-area: product;
    padding-top: 12px;
     }
  .company {
    grid-area: company;
    padding-top: 12px;
  }

  //row 2
  .community {
    grid-area: community;
    padding-top: 12px;
  }
  .support {
    grid-area: support;
    padding-top: 12px;
  }

  //row 3
  .developers {
    grid-area: developers;
    padding-top: 12px;
  }
  .social {
    grid-area: social;
    padding-top: 12px;
  }

  // row 4
  .donate {
    grid-area: donate;
  }
  // row 5
  .donate-text {
    grid-area: donate-text;
  }
  //row 6
  .donate-button {
    grid-area: donate-button;
    padding-top: 0px;
   }

  // row 7
  .hr {
    grid-area: hr;
    padding-top: 8px;
  }

  // row 8
  .copyright {
    grid-area: copyright;
    display: flex;
    justify-content: center;
  }
  // row 9
  .privacy-terms {
    display: none;
  }
  .desktop {
    display: none;
  }
  .privacy-policy {
    grid-area: privacy-policy;
    display: grid;
    justify-content: center;
    line-height: 1.71;
    padding-top: 10px;
  }
  //row 10
  .mobile-terms {
    grid-area: mobile-terms;
    display:grid;
    justify-content: center;
    padding: 8px 0px 16px 0px;
  }
  // row 11
  .melior { grid-area: melior; }

  // row 12
  .debug-toggle {
    grid-area: debug-toggle;
    width: 100%;
  }

  footer {
    padding: 24px 16px;
    column-gap: 1.5rem;
    display: grid;
    grid-template-areas:
      "product company"
      "community support"
      "developers social"
      "donate donate"
      "donate-text donate-text"
      "donate-button donate-button"
      "hr hr"
      "copyright copyright"
      "privacy-policy privacy-policy"
      "mobile-terms mobile-terms"
      "melior melior"
      "time-travel time-travel"
      "debug-toggle debug-toggle";
    grid-template-columns: repeat(2, 2fr);
    grid-template-rows: auto;
    }
  .btn-contribute {
    width: 100%;
  }
  .debug {
    width: 100%;
  }
  .social-circle {
    margin: 0 6px 0 6px;
      &:first-child {
    margin-left: 0;
    }
      &:last-child {
    margin-right: 0;
    }
  }
}

// Medium devices (tablets, 768px and under)
@media (max-width: 1024px) and (min-width: 768px) {
  footer {
    padding: 24px 24px;
  }

  .desktop {
   display: none;
  }
 }
</style>

<style lang="scss">
.instagram svg {
  background-color: #e1e0e3;
  fill: #878190;
  height: 24px;
  width: 24px;
    &:hover {
    fill: #6133B4;
  }
}

.twitter svg {
  background-color: #e1e0e3;
  fill: #878190;
  height: 24px;
  width: 24px;
    &:hover {
    fill: #6133B4;
  }
}

.facebook svg {
  background-color: #e1e0e3;
  fill: #878190;
  height: 24px;
  width: 24px;
    &:hover {
    fill: #6133B4;
  }
}

.tumblr svg {
  background-color: #e1e0e3;
  fill: #878190;
  height: 24px;
  width: 24px;
      &:hover {
    fill: #6133B4;
  }
}
</style>

<script>
// modules
import axios from 'axios';
import moment from 'moment';
import Vue from 'vue';

// images
import melior from '@/assets/svg/melior.svg';
import twitter from '@/assets/svg/twitter.svg';
import facebook from '@/assets/svg/facebook.svg';
import instagram from '@/assets/svg/instagram.svg';
import tumblr from '@/assets/svg/tumblr.svg';
import heart from '@/assets/svg/heart.svg';

// components & modals
import { mapState } from '@/libs/store';
import buyGemsModal from './payments/buyGemsModal.vue';
import reportBug from '@/mixins/reportBug.js';
import { worldStateMixin } from '@/mixins/worldState';

const DEBUG_ENABLED = process.env.DEBUG_ENABLED === 'true'; // eslint-disable-line no-process-env
const TIME_TRAVEL_ENABLED = process.env.TIME_TRAVEL_ENABLED === 'true'; // eslint-disable-line no-process-env
let sinon;
if (TIME_TRAVEL_ENABLED) {
  // eslint-disable-next-line global-require
  sinon = await import('sinon');
}

export default {
  components: {
    buyGemsModal,
  },
  mixins: [
    reportBug,
    worldStateMixin,
  ],
  data () {
    return {
      icons: Object.freeze({
        melior,
        twitter,
        facebook,
        instagram,
        tumblr,
        heart,
      }),
      debugMenuShown: false,
      DEBUG_ENABLED,
      TIME_TRAVEL_ENABLED,
      lastTimeJump: null,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    ...mapState(['isUserLoaded']),
    getDataDisplayToolUrl () {
      const base = 'https://tools.habitica.com/';
      if (!this.user) return null;
      return `${base}?uuid=${this.user._id}`;
    },
    currentYear () {
      const currentDate = new Date();
      return currentDate.getFullYear();
    },
  },
  methods: {
    plusTenHealth () {
      this.$store.dispatch('user:set', {
        'stats.hp': this.user.stats.hp += 10,
      });
    },
    setHealthLow () {
      this.$store.dispatch('user:set', {
        'stats.hp': 1,
      });
    },
    async addMissedDay (numberOfDays) {
      if (!window.confirm(`Are you sure you want to reset the day by ${numberOfDays} day(s)?`)) return; // eslint-disable-line no-alert
      const date = moment(this.user.lastCron).subtract(numberOfDays, 'days').toDate();
      await axios.post('/api/v4/debug/set-cron', {
        lastCron: date,
      });
      // @TODO: Notification.text('-' + numberOfDays + ' day(s), remember to refresh');
      // @TODO: Sync user?
    },
    async addTenGems () {
      await axios.post('/api/v4/debug/add-ten-gems');
      // @TODO: Notification.text('+10 Gems!');
      this.user.balance += 2.5;
    },
    async addHourglass () {
      await axios.post('/api/v4/debug/add-hourglass');
      // @TODO: Sync?
    },
    addGold () {
      this.$store.dispatch('user:set', {
        'stats.gp': this.user.stats.gp + 500,
      });
    },
    addMana () {
      this.$store.dispatch('user:set', {
        'stats.mp': this.user.stats.mp + 500,
      });
    },
    addLevelsAndGold () {
      this.$store.dispatch('user:set', {
        'stats.exp': this.user.stats.exp + 10000,
        'stats.gp': this.user.stats.gp + 10000,
        'stats.mp': this.user.stats.mp + 10000,
      });
    },
    async jumpTime (amount) {
      const response = await axios.post('/api/v4/debug/jump-time', { offsetDays: amount });
      if (amount > 0) {
        Vue.config.clock.jump(amount * 24 * 60 * 60 * 1000);
      } else {
        Vue.config.clock.setSystemTime(moment().add(amount, 'days').toDate());
      }
      this.lastTimeJump = response.data.data.time;
      this.triggerGetWorldState(true);
    },
    async resetTime () {
      const response = await axios.post('/api/v4/debug/jump-time', { reset: true });
      const time = new Date(response.data.data.time);
      Vue.config.clock.restore();
      Vue.config.clock = sinon.useFakeTimers({
        now: time,
        shouldAdvanceTime: true,
      });
      this.lastTimeJump = response.data.data.time;
      this.triggerGetWorldState(true);
    },
    addExp () {
      // @TODO: Name these variables better
      let exp = 0;
      const five = 10 * this.user.stats.lvl;
      const four = (this.user.stats.lvl ** 2) * 0.25;
      const three = four + five + 139.75;
      const two = three / 10;
      const one = Math.round(two) * 10;
      exp = this.user.stats.exp + one;
      this.$store.dispatch('user:set', {
        'stats.exp': exp,
      });
    },
    addOneLevel () {
      this.$store.dispatch('user:set', {
        'stats.lvl': this.user.stats.lvl + 1,
      });
    },
    async addQuestProgress () {
      await axios.post('/api/v4/debug/quest-progress');
      //  @TODO:  Notification.text('Quest progress increased');
      //  @TODO:  User.sync();
    },
    async bossRage () {
      await axios.post('/api/v4/debug/boss-rage');
    },

    async makeAdmin () {
      await axios.post('/api/v4/debug/make-admin');
      // @TODO: Notification.text('You are now an admin!
      // Reload the website then go to Help > Admin Panel to set contributor level, etc.');
      // @TODO: sync()
    },
    donate () {
      this.$root.$emit('bv::show::modal', 'buy-gems', { alreadyTracked: true });
    },
  },
};
</script>
