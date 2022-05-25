<template>
  <div class="row footer-row">
    <buy-gems-modal v-if="user" />
    <!--modify-inventory(v-if="isUserLoaded")-->
    <footer>
      <div class="row">
        <!-- Product -->
        <div class="col-6 col-sm">
          <h3>{{ $t('footerProduct') }}</h3>
          <ul>
            <li>
              <a
              href="https://itunes.apple.com/us/app/habitica/id994882113?ls=1&mt=8"
              target="_blank"
              >{{ $t('mobileIOS') }}</a>
            </li>
            <li>
              <a
              href="https://play.google.com/store/apps/details?id=com.habitrpg.android.habitica"
              target="_blank"
              >{{ $t('mobileAndroid') }}</a>
            </li>
            <li>
              <router-link to="/group-plans">
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
        <div class="col-6 col-sm">
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
              >{{ $t('companyBlog') }}</a>
            </li>
            <li>
              <a
              href="https://habitica.fandom.com/wiki/Whats_New"
              target="_blank"
              >{{ $t('oldNews') }}</a>
            </li>
          </ul>
        </div>
        <!-- Community -->
        <div class="col-6 col-sm">
          <h3>{{ $t('footerCommunity') }}</h3>
          <ul>
            <li>
              <a
                target="_blank"
                href="/static/community-guidelines"
              >{{ $t('communityGuidelines') }}</a>
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
              >{{ $t('companyContribute') }}</a>
            </li>
          </ul>
        </div>
        <!-- Support -->
        <div class="col-6 col-sm">
          <h3>{{ $t ('support') }}</h3>
            <ul>
              <li>
                <router-link to="/static/faq">
                  {{ $t('FAQ') }}
                </router-link>
              </li>
              <!-- link isn't underlined on hover for some reason... -->
              <li v-if="user">
                <a
                target="_blank"
                @click.prevent="openBugReportModal()"
                >
                {{ $t('reportBug') }}
              </a>
              </li>
              <li v-else>
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
                >{{ $t('requestFeature') }}</a>
              </li>
              <li>
                <a
                href="https://habitica.fandom.com/"
                target="_blank"
                >{{ $t('wiki') }}</a>
              </li>
            </ul>
        </div>
        <!-- Developers -->
        <div class="col-6 col-sm">
          <h3>{{ $t('footerDevs') }}</h3>
            <ul>
              <li>
                <a
                href="/apidoc"
                target="_blank"
                >{{ $t('APIv3') }}</a>
              </li>
              <li>
                <a
                :href="getDataDisplayToolUrl"
                target="_blank"
                >{{ $t('dataDisplayTool') }}</a>
              </li>
              <li>
                <a
                href="https://habitica.fandom.com/wiki/Guidance_for_Blacksmiths"
                target="_blank"
                >{{ $t('guidanceForBlacksmiths') }}</a>
              </li>
              <li>
                <a
                href="https://habitica.fandom.com/wiki/Extensions,_Add-Ons,_and_Customizations"
                target="_blank">
                {{ $t('communityExtensions') }}</a>
                <!-- v-html="$t('communityExtensions')"> -->
              </li>
            </ul>
          </div>
        </div>
        <div class="row justify-content d-flex">
          <!-- Help Support Habitica -->
          <div class="col-sm-7 support">
            <h3>{{ $t('helpSupportHabitica') }}</h3>
            <div class="donate-text">
              {{ $t('donateText3') }}
            </div>
          </div>
          <div class="col col-md-3">
            <button
              v-if="user"
              class="btn btn-contribute justify-content-between"
              @click="donate()"
            >
              <div class="text">
                💜 {{ $t('companyDonate') }}
              </div>
            </button>
            <div
              v-else
              class="btn btn-contribute justify-content-between"
            >
              <a
                href="https://habitica.fandom.com/wiki/Contributing_to_Habitica"
                target="_blank"
              >
                <div class="text">
                  💜 {{ $t('companyContribute') }}
                </div>
              </a>
            </div>
          </div>

        <!-- Social -->
          <div class="col col-md-2 social">
            <h3>{{ $t('footerSocial') }}</h3>
            <div class="icons align-items-center">
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
                href="https://twitter.com/habitica"
                target="_blank"
              >
                <div
                  class="social-icon svg-icon twitter"
                  v-html="icons.twitter"
                ></div>
              </a>
              <a
                class="social-circle"
                href="https://www.facebook.com/Habitica"
                target="_blank"
              >
                <div
                  class="social-icon facebook svg-icon"
                  v-html="icons.facebook"
                ></div>
              </a><a
                class="social-circle"
                href="https://www.tumblr.com/Habitica"
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
      <div class="row">
        <div class="col-12">
          <hr>
        </div>
      </div>
        <div class="row colophon align-items-center">
          <div class="col">
            © {{ currentYear }} Habitica. All rights reserved.
          </div>
          <div class="col align-items-end">
            <div
              class="logo svg-icon"
              v-html="icons.gryphon"
            ></div>
          </div>
          <div class="d-flex col justify-content-end">
            <span class="privacy-policy">
              <a
                target="_blank"
                href="/static/privacy"
              >{{ $t('privacy') }}</a>
            </span>
            <span class="">
              <a
                target="_blank"
                href="/static/terms"
              >{{ $t('terms') }}</a>
            </span>
          </div>
        </div>
        <div class="row">
          <div
            v-if="!IS_PRODUCTION && isUserLoaded"
            class="debug float-left"
          >
            <button
              class="btn btn-primary"
              @click="debugMenuShown = !debugMenuShown"
            >
              Toggle Debug Menu
            </button>
            <div
              v-if="debugMenuShown"
              class="debug-group"
            >
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

footer {
  background-color: $gray-500;
  color: $gray-50;
  padding: 32px 142px 40px;
  a {
    color: $gray-50;
  }
  a:hover {
    color: $purple-300
  }
}

h3 {
  font-weight: bold;
}

ul {
  padding-left: 0;
  list-style-type: none;
}

li {
  margin-bottom: 8px;
}

hr {
  height: 1px;
  margin: 0 0 13px;
  background-color: $gray-400;
}

.social {
  padding-left: 36px;
}

.icons {
  display: flex;
  flex-shrink: 1;
  height: 32px;
}

.heart {
}

.donate-text{
  font-size: 0.75rem;
  font-color: $gray-100;
  line-height: 1.33;
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

.colophon {
  height: 24px;
  line-height: 1.71;
}

.logo {
  width: 24px;
  height: 24px;
  margin: 0px auto 5px;
  color: $gray-200;
}

.privacy-policy {
  padding-right: 16px;
}

.debug {
  margin-top: 16px;
}

.debug-group {
  top: -300px;
  background: $gray-600;
  border-radius: 2px;
  padding: 16px;
  width: 60%;
  box-shadow: 0 1px 3px 0 rgba(26, 24, 29, 0.12), 0 1px 2px 0 rgba(26, 24, 29, 0.24);
  margin-top: 8px;
}

 .debug-group .btn {
  margin: 2px
}

.btn-contribute {
  background: $white;
  box-shadow: none;
  border-radius: 2px;
  width: 175px;
  height: 32px;
  color: $gray-50;
  text-align: center;
  line-height: 1.71;
  font-weight: bold;
  font-size: 0.875rem;
  vertical-align: middle;
  padding: 0;
  margin: 32px 0 32px 24px;
  box-shadow: 0 1px 3px 0 rgba(26, 24, 29, 0.12), 0 1px 2px 0 rgba(26, 24, 29, 0.24);
  a {
    display: flex;
  }
  .heart {
    max-height: 25px;
    width: 18px;
    margin-right: 8px;
    margin-bottom: 3.2px;
  }
  .text,
  .heart {
    display: inline-block;
    vertical-align: bottom;
  }
}

// Extra small devices (portrait phones, less than 576px)
@media (max-width: 576px) {
  footer {
    padding-left: 10px;
    padding-right: 10px;
  }
  .support {
    flex-direction: row-reverse;
  }
}

// Small devices (landscape phones, less than 768px)
@media (max-width: 768px) {}

// Medium devices (tablets, less than 992px)
@media (max-width: 992px) {}

// Large devices (desktops, less than 1200px)
@media (max-width: 1440px) {
  .social {
    margin-left: -60px;
  }
}

// Extra large devices (large desktops)
// No media query since the extra-large breakpoint has no upper bound on its width

// bootstrap extra-large
@media (min-width: 1440.02px) {
  .social {
    padding-left: 20px;
  }
}

</style>

<style lang="scss">
.heart svg {
  margin-top: 1.6px;
}

// need to figure out how to do a hover here
.instagram svg {
  background-color: #e1e0e3;
  fill: #878190
}

.instagram svg:hover {
  fill: #6133B4 !important;
}
.twitter svg {
  background-color: #e1e0e3;
  fill: #878190
}

.facebook svg {
  background-color: #e1e0e3;
  fill: #878190;
  height: 24px;
  width: 24px;
}

svg:hover {
  fill: #6133B4;
}
.tumblr svg {
  background-color: #e1e0e3;
  fill: #878190
}


// footer {
//   &.expanded {
//     padding-left: 96px;
//     padding-right: 96px;
//     padding-top: 48px;
//     background: #E1E0E3;
//     color: #4E4A57;
//     min-height: 356px;
//     a {
//       color: #878190;
//     }
//     .logo {
//       color: #c3c0c7;
//     }
//     @media screen and (max-width: 770px) {
//       padding-left: 16px;
//       padding-right: 16px;
//     }
//   }
// }
</style>

<script>
// modules
import axios from 'axios';
import moment from 'moment';

// images
import gryphon from '@/assets/svg/gryphon.svg';
import twitter from '@/assets/svg/twitter.svg';
import facebook from '@/assets/svg/facebook.svg';
import instagram from '@/assets/svg/instagram.svg';
import tumblr from '@/assets/svg/tumblr.svg';
import heart from '@/assets/svg/heart.svg';

// components & modals
import { mapState } from '@/libs/store';
import buyGemsModal from './payments/buyGemsModal.vue';
import reportBug from '@/mixins/reportBug.js';

const IS_PRODUCTION = process.env.NODE_ENV === 'production'; // eslint-disable-line no-process-env
export default {
  components: {
    buyGemsModal,
  },
  mixins: [reportBug],
  data () {
    return {
      icons: Object.freeze({
        gryphon,
        twitter,
        facebook,
        instagram,
        tumblr,
        heart,
      }),
      debugMenuShown: false,
      IS_PRODUCTION,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    ...mapState(['isUserLoaded']),
    getDataDisplayToolUrl () {
      const base = 'https://oldgods.net/habitrpg/habitrpg_user_data_display.html';
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
