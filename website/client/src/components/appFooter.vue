<template>
  <div class="row footer-row">
    <buy-gems-modal v-if="user" />
    <!--modify-inventory(v-if="isUserLoaded")-->
    <footer>
      <div class="row row-one">
        <!-- Product -->
        <div class="col-xs-6 col-sm product">
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
        <div class="col-xs-6 col-sm company">
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
        <div class="col-xs-6 col-sm community">
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
          </ul>
        </div>
        <!-- Support -->
        <div class="col-xs-6 col-sm support">
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
            <li>
              <a
                href="https://habitica.fandom.com/"
                target="_blank"
              >{{ $t('wiki') }}
              </a>
            </li>
          </ul>
        </div>
        <!-- Developers -->
        <div class="col-xs-6 col-sm developers">
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
        <!-- Social - Phone -->
        <div class="col-xs-6 col-sm social display-invisible phone-visible">
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
      <div class="row row-two">
        <!-- Help Support Habitica -->
        <div class="col-sm-7 support">
          <h3>{{ $t('helpSupportHabitica') }}</h3>
          <div class="donate-text">
            {{ $t('donateText3') }}
          </div>
        </div>
        <div class="col col-md-2 offset-sm-0">
          <button
            class="btn btn-contribute justify-content-between"
            @click="donate()"
          >
            <div class="text">
              💜 {{ $t('companyDonate') }}
            </div>
          </button>
        </div>

        <!-- Social - Desktop/Tablet -->
        <div class="col offset-col-6 col-xs-1 social display-visible phone-invisible">
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
      <div class="row row-three">
        <div class="col-12">
          <hr>
        </div>
      </div>
      <div class="row row-four colophon align-items-center display-visible phone-invisible">
        <div class="col-lg-3 col-xs-12 copyright">
          © {{ currentYear }} Habitica. All rights reserved.
        </div>
        <div class="col-lg-6 col-xs-12 align-items-end melior">
          <div
            class="logo svg-icon"
            v-html="icons.gryphon"
          ></div>
        </div>
        <div class="col-lg-3 col-xs-12 d-flex justify-content-end">
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
      <div class="row row-four colophon align-items-center display-invisible phone-visible">
        <div class="copyright">
          © {{ currentYear }} Habitica. All rights reserved.
        </div>
        <div class="melior">
          <div
            class="logo svg-icon"
            v-html="icons.gryphon"
          ></div>
        </div>
        <div class="terms">
          <a
            target="_blank"
            href="/static/terms"
          >{{ $t('terms') }}</a>
        </div>
        <div class="privacy-policy">
          <a
            target="_blank"
            href="/static/privacy"
          >{{ $t('privacy') }}</a>
        </div>
      </div>
      <div class="row row-five">
        <div
          v-if="!IS_PRODUCTION && isUserLoaded"
        >
          <button
            class="debug btn btn-primary"
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
    color: $purple-300;
    text-decoration: underline;
  }

  // needed to make "report a bug"'s hover state correct
  a:not([href]):not([class]):hover {
  color: $purple-300;
  text-decoration: underline;
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
  margin: 0 0 13px;
  background-color: $gray-400;
}

.display-invisible {
  visibility: hidden !important;
  display: none;
}

.display-visible {
  visibility: visible !important;
}

.icons {
  display: flex;
  flex-shrink: 1;
  height: 32px;
}

.donate-text {
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
  display: flex;
}

.terms {
  padding-left: 16px;
  display:flex;
  justify-content: end;
}

.debug {
  margin-top: 16px;
  display: flex;
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

  .text{
    display: inline-block;
    vertical-align: bottom;
  }
}

// media breakpoints

// extra-large
@media (min-width: 1440.02px) {
  .social {
    right: -80px;
  }
}

// Laptops
@media (max-width: 1440px) {
  .social {
    right: -60px;
  }
}

// Tablets
@media (max-width: 810px) {
  .social {
    right: 0px;
  }
}

// Phones
@media (max-width: 428px) {
  footer {
    padding: 24px 16px;
  }

  .phone-invisible {
    visibility: hidden !important;
    display: none;
    margin-top: -24px;
  }

  .phone-visible {
    visibility: visible !important;
    display: inherit;
  }

  .row-one {
    display: grid;
    grid-column-gap: 12px;
    grid-row-gap: 12px;
    grid-template-columns: 50%;

    li {
      margin-bottom: 4px;
    }

    .product {
      grid-row: 1 / 1;
      grid-column: 1 / 1;
    }
    .company {
      grid-row: 1 / 1;
      grid-column: 2 / 2;
      padding-left: 0px;
      margin-left: -8px;
    }
    .community {
      grid-row: 2 / 2;
      grid-column: 1 / 1;
    }
    .support {
      grid-row: 2 / 2;
      grid-column: 2 / 2;
      padding-left: 0px;
      margin-left: -8px;
    }
    .developers {
      grid-row: 3 / 3;
      grid-column: 1 / 2;
    }
    .social {
      grid-row: 3 / 3;
      grid-column: 2 / 2;
      vertical-align: top;
      padding-left: 0px;
      margin-left: -8px;
    }
    .icons {
      display: flex;
      height: auto;
      padding-left: 0px;
      padding-top: 8px;
      margin-top: -84px;
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

  .row-two {
    display: flex;

    .support {
      display: block;
      order: 0;
      margin-top: 0px;
      width: 100%;

      h3 {
        margin-bottom: 4px;
      }
    }
    .btn-contribute {
      order: 1;
      margin: 16px 0 24px 0;
      width: 288px;
    }
  }

  .row-three {
    display: flex;
  }

  .row-four{
    display: flex;
    justify-content: safe center;
    flex-direction: row;

    .copyright {
      order: 0;
      display: flex;
      justify-content: center;
      height: 24px;
    }
    .privacy-policy {
      order: 1;
      display: flex;
      justify-content: center;
      width: 100%;
      height: 20px;
      margin-top: 10px;
    }
    .terms {
      order: 2;
      display: flex;
      justify-content: center;
      width: 100%;
      padding-left: 0px;
      margin-top: 8px;
    }
    .melior {
      order: 4;
      justify-content: center;
      height: 44px;
      padding-top: 12px;
    }
  }

  .row-five{
    display:flex;
    margin: 108px 0 16px 0;
  }

  .debug {
    display: flex;
    width: 288px;
    text-align: center;
    padding-left: 84px;
  }

  .debug-group {
    background: $gray-600;
    border-radius: 2px;
    padding: 16px;
    width: 100%;
    box-shadow: 0 1px 3px 0 rgba(26, 24, 29, 0.12), 0 1px 2px 0 rgba(26, 24, 29, 0.24);
    margin-top: 8px;
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
