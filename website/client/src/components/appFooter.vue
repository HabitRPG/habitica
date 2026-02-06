<template>
  <div>
    <buy-gems-modal v-if="user" />
    <privacy-modal />
    <footer>
      <div class="columns d-flex w-100 justify-content-between">
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
              <a href="mailto:admin@habitica.com">
                {{ $t('contactUs') }}
              </a>
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
                @click="showBailey()"
              >
                {{ $t('oldNews') }}
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
                href="https://github.com/HabitRPG/habitica/wiki/Contributing-to-Habitica"
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
          </ul>
        </div>
        <!-- Social - Desktop/Tablet -->
        <div class="social">
          <div>
            <h3>{{ $t('footerSocial') }}</h3>
            <div>
              <div class="d-flex align-items-center mb-1">
                <a
                  class="social-circle mr-2"
                  href="https://www.instagram.com/habitica/"
                  target="_blank"
                >
                  <div
                    class="social-icon svg-icon"
                    v-html="icons.instagram"
                  ></div>
                </a>
                <a
                  href="https://www.instagram.com/habitica/"
                  target="_blank"
                >
                  {{ $t('communityInstagram') }}
                </a>
              </div>
              <div class="d-flex align-items-center mb-1">
                <a
                  class="social-circle mr-2"
                  href="https://bsky.app/profile/habitica.com"
                  target="_blank"
                >
                  <div
                    class="social-icon svg-icon"
                    v-html="icons.bluesky"
                  ></div>
                </a>
                <a
                  href="https://bsky.app/profile/habitica.com"
                  target="_blank"
                >
                  Bluesky
                </a>
              </div>
              <div class="d-flex align-items-center mb-1">
                <a
                  class="social-circle mr-2"
                  href="https://www.facebook.com/Habitica/"
                  target="_blank"
                >
                  <div
                    class="social-icon svg-icon"
                    v-html="icons.facebook"
                  ></div>
                </a>
                <a
                  href="https://www.facebook.com/Habitica/"
                  target="_blank"
                >
                  {{ $t('communityFacebook') }}
                </a>
              </div>
              <div class="d-flex align-items-center">
                <a
                  class="social-circle mr-2"
                  href="http://blog.habitrpg.com/"
                  target="_blank"
                >
                  <div
                    class="social-icon svg-icon"
                    v-html="icons.tumblr"
                  ></div>
                </a>
                <a
                  href="http://blog.habitrpg.com/"
                  target="_blank"
                >
                  {{ $t('tumblr') }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="hr">
          <div>
            <hr>
          </div>
        </div>
        <!-- DESKTOP LEGAL -->
        <div class="desktop d-flex justify-content-between align-items-center">
          <div class="copyright">
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
        </div>
        <!-- MOBILE LEGAL -->
        <div class="mobile">
          <div class="copyright mx-auto mb-2">
            <div>
              © {{ currentYear }} Habitica. All rights reserved.
            </div>
          </div>
          <div class="privacy-policy mx-auto mb-2">
            <a
              target="_blank"
              href="/static/privacy"
            >{{ $t('privacy') }}</a>
          </div>
          <div class="mobile-terms mx-auto mb-2">
            <a
              target="_blank"
              href="/static/terms"
            >{{ $t('terms') }}</a>
          </div>
          <div class="melior">
            <div
              class="logo svg svg-icon color"
              v-html="icons.melior"
            ></div>
          </div>
        </div>
        <div
          v-if="TIME_TRAVEL_ENABLED && user?.permissions?.fullAccess"
          :key="lastTimeJump"
          class="time-travel"
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
              <div class="d-flex align-items-center mt-2">
                <input
                  v-model.number="partyChatCount"
                  type="number"
                  min="1"
                  class="form-control form-control-sm mr-2"
                  style="width: 80px;"
                >
                <a
                  class="btn btn-secondary"
                  @click="seedPartyChat()"
                >Send Party Chat Messages</a>
              </div>
              <div class="d-flex align-items-center mt-2">
                <input
                  v-model.number="inboxCount"
                  type="number"
                  min="1"
                  class="form-control form-control-sm mr-2"
                  style="width: 80px;"
                >
                <a
                  class="btn btn-secondary"
                  @click="seedInbox()"
                >Send Inbox Messages</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';
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
.social {
  align-items: flex-start;
  display: flex;
  justify-content: flex-start;
  grid-area: social;

  ::v-deep svg {
    background-color: $gray-500;
    fill: $gray-200;
    height: 24px;
    width: 24px;
  }

  .d-flex:hover {
    a {
      color: $purple-300;
    }
    ::v-deep svg {
      fill: $purple-300;
    }
  }
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
  a, a:not([href]) {
    color: $gray-50;
  }
  a:hover {
    color: $purple-300;
    text-decoration: underline;
  }
}

h3 {
  font-weight: bold;
  margin-bottom: 4px;
}

.social-circle {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: $gray-50;
  display: flex;

  + a {
    margin-top: 1px;
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

  .text {
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

  // row 7
  .hr {
    grid-area: hr;
    padding-top: 8px;
  }

  .desktop {
    .copyright, .melior, .privacy-terms {
      display: none;
    }
  }

  .mobile {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  // row 12
  .debug-toggle {
    grid-area: debug-toggle;
    width: 100%;
  }

  footer {
    padding: 24px 16px;

    .columns {
      column-gap: 1.5rem;
      display: grid !important;
      grid-template-areas:
        "product company"
        "community support"
        "developers social"
        "time-travel time-travel"
        "debug-toggle debug-toggle";
      grid-template-columns: repeat(2, 2fr);
      grid-template-rows: auto;
    }
  }
  .btn-contribute {
    width: 100%;
  }
  .debug {
    width: 100%;
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

<script>
// modules
import axios from 'axios';
import moment from 'moment';
import Vue from 'vue';

// images
import melior from '@/assets/svg/melior.svg?raw';
import bluesky from '@/assets/svg/bluesky.svg?raw';
import facebook from '@/assets/svg/facebook.svg?raw';
import instagram from '@/assets/svg/instagram.svg?raw';
import tumblr from '@/assets/svg/tumblr.svg?raw';
import heart from '@/assets/svg/heart.svg?raw';

// components & modals
import { mapState } from '@/libs/store';
import buyGemsModal from './payments/buyGemsModal.vue';
import privacyModal from './settings/privacyModal.vue';
import reportBug from '@/mixins/reportBug.js';
import { worldStateMixin } from '@/mixins/worldState';

const DEBUG_ENABLED = import.meta.env.DEBUG_ENABLED === 'true';
const TIME_TRAVEL_ENABLED = import.meta.env.TIME_TRAVEL_ENABLED === 'true';

let sinon;
if (import.meta.env.TIME_TRAVEL_ENABLED === 'true') {
  (async () => {
    sinon = await import('sinon');
  })();
}

export default {
  components: {
    buyGemsModal,
    privacyModal,
  },
  mixins: [
    reportBug,
    worldStateMixin,
  ],
  data () {
    return {
      icons: Object.freeze({
        melior,
        bluesky,
        facebook,
        instagram,
        tumblr,
        heart,
      }),
      debugMenuShown: false,
      DEBUG_ENABLED,
      TIME_TRAVEL_ENABLED,
      lastTimeJump: null,
      partyChatCount: 450,
      inboxCount: 450,
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
      setTimeout(() => {
        if (amount > 0) {
          Vue.config.clock.jump(amount * 24 * 60 * 60 * 1000);
        } else {
          Vue.config.clock.setSystemTime(moment().add(amount, 'days').toDate());
        }
        this.lastTimeJump = response.data.data.time;
        this.triggerGetWorldState(true);
      }, 1000);
    },
    async resetTime () {
      const response = await axios.post('/api/v4/debug/jump-time', { reset: true });
      const time = new Date(response.data.data.time);
      setTimeout(() => {
        Vue.config.clock.restore();
        Vue.config.clock = sinon.useFakeTimers({
          now: time,
          shouldAdvanceTime: true,
        });
        this.lastTimeJump = response.data.data.time;
        this.triggerGetWorldState(true);
      }, 1000);
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
    async seedPartyChat () {
      try {
        const count = this.partyChatCount;
        if (!Number.isInteger(count) || count < 1) {
          window.alert('Please enter a positive integer'); // eslint-disable-line no-alert
          return;
        }
        await axios.post('/api/v4/debug/seed-party-chat', { messageCount: count });
        window.alert(`Successfully sent ${count} messages to your party chat!`); // eslint-disable-line no-alert
      } catch (e) {
        window.alert(e.response?.data?.message || 'Error sending party chat messages'); // eslint-disable-line no-alert
      }
    },
    async seedInbox () {
      try {
        const count = this.inboxCount;
        if (!Number.isInteger(count) || count < 1) {
          window.alert('Please enter a positive integer'); // eslint-disable-line no-alert
          return;
        }
        await axios.post('/api/v4/debug/seed-inbox', { messageCount: count });
        window.alert(`Successfully sent ${count} messages to your inbox!`); // eslint-disable-line no-alert
      } catch (e) {
        window.alert(e.response?.data?.message || 'Error sending inbox messages'); // eslint-disable-line no-alert
      }
    },
    donate () {
      this.$root.$emit('bv::show::modal', 'buy-gems', { alreadyTracked: true });
    },
    showBailey () {
      this.$root.$emit('bv::show::modal', 'new-stuff');
    },
  },
};
</script>
