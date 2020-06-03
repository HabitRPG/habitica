<template>
  <div class="row footer-row">
    <buy-gems-modal v-if="user" />
    <!--modify-inventory(v-if="isUserLoaded")-->
    <footer class="col-12 expanded">
      <div class="row">
        <div class="col-12 col-md-2">
          <h3>
            <a
              href="https://itunes.apple.com/us/app/habitica/id994882113?ls=1&mt=8"
              target="_blank"
            >{{ $t('mobileIOS') }}</a>
          </h3>
          <h3>
            <a
              href="https://play.google.com/store/apps/details?id=com.habitrpg.android.habitica"
              target="_blank"
            >{{ $t('mobileAndroid') }}</a>
          </h3>
        </div>
        <div class="col-12 col-md-2">
          <h3>{{ $t('footerCompany') }}</h3>
          <ul>
            <li>
              <router-link to="/static/features">
                {{ $t('companyAbout') }}
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
                href="http://blog.habitrpg.com/"
                target="_blank"
              >{{ $t('tumblr') }}</a>
            </li>
            <li>
              <router-link to="/static/faq">
                {{ $t('FAQ') }}
              </router-link>
            </li>
            <li>
              <a
                href="http://habitica.fandom.com/wiki/Whats_New"
                target="_blank"
              >{{ $t('oldNews') }}</a>
            </li>
            <!-- Commenting out merch page see https://github.com/HabitRPG/habitica/issues/12039
            <li>
              <router-link to="/static/merch">
                {{ $t('merch') }}
              </router-link>
            </li>
            -->
            <li>
              <router-link to="/static/press-kit">
                {{ $t('presskit') }}
              </router-link>
            </li>
            <li>
              <router-link to="/static/contact">
                {{ $t('contactUs') }}
              </router-link>
            </li>
          </ul>
        </div>
        <div class="col-12 col-md-2">
          <h3>{{ $t('footerCommunity') }}</h3>
          <ul>
            <li>
              <a
                target="_blanck"
                href="/static/community-guidelines"
              >{{ $t('communityGuidelines') }}</a>
            </li>
            <li>
              <router-link to="/hall/contributors">
                {{ $t('hall') }}
              </router-link>
            </li>
            <li>
              <router-link
                to="/groups/guild/a29da26b-37de-4a71-b0c6-48e72a900dac"
              >
                {{ $t('reportBug') }}
              </router-link>
            </li>
            <li>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScPhrwq_7P1C6PTrI3lbvTsvqGyTNnGzp1ugi1Ml0PFee_p5g/viewform?usp=sf_link"
                target="_blank"
              >{{ $t('requestFeature') }}</a>
            </li>
            <li v-html="$t('communityExtensions')"></li>
            <li v-html="$t('communityForum')"></li>
            <li>
              <a
                href="https://www.facebook.com/Habitica"
                target="_blank"
              >{{ $t('communityFacebook') }}</a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/habitica"
                target="_blank"
              >{{ $t('communityInstagram') }}</a>
            </li>
          </ul>
        </div>
        <div class="col-12 col-md-6">
          <div class="row">
            <div class="col-6">
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
                    href="http://habitica.fandom.com/wiki/Guidance_for_Blacksmiths"
                    target="_blank"
                  >{{ $t('guidanceForBlacksmiths') }}</a>
                </li>
              </ul>
            </div>
            <div class="col-6 social">
              <h3>{{ $t('footerSocial') }}</h3>
              <div class="icons">
                <a
                  class="social-circle"
                  href="https://twitter.com/habitica"
                  target="_blank"
                >
                  <div
                    class="social-icon svg-icon"
                    v-html="icons.twitter"
                  ></div>
                </a>
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
                  href="https://www.facebook.com/Habitica"
                  target="_blank"
                >
                  <div
                    class="social-icon facebook svg-icon"
                    v-html="icons.facebook"
                  ></div>
                </a>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-12 col-md-8">
              {{ $t('donateText3') }}
            </div>
            <div class="col-12 col-md-4">
              <button
                v-if="user"
                class="btn btn-contribute btn-front btn-flat"
                @click="donate()"
              >
                <div
                  class="svg-icon heart"
                  v-html="icons.heart"
                ></div>
                <div class="text">
                  {{ $t('companyDonate') }}
                </div>
              </button>
              <div
                v-else
                class="btn btn-contribute btn-front btn-flat"
              >
                <a
                  href="http://habitica.fandom.com/wiki/Contributing_to_Habitica"
                  target="_blank"
                >
                  <div
                    class="svg-icon heart"
                    v-html="icons.heart"
                  ></div>
                  <div class="text">{{ $t('companyContribute') }}</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <hr>
        </div>
      </div>
      <div class="row">
        <div class="col-12 col-md-5">
          © 2020 Habitica. All rights reserved.
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
              >Health = 1</a>
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
              <a
                class="btn btn-secondary"
                @click="openModifyInventoryModal()"
              >Modify Inventory</a>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-2 text-center">
          <div
            class="logo svg-icon"
            v-html="icons.gryphon"
          ></div>
        </div>
        <div class="col-12 col-md-5 text-right">
          <span class="ml-4">
            <a
              target="_blanck"
              href="/static/privacy"
            >{{ $t('privacy') }}</a>
          </span>
          <span class="ml-4">
            <a
              target="_blanck"
              href="/static/terms"
            >{{ $t('terms') }}</a>
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
  .footer-row {
    margin: 0;
    flex: 0 1 auto;
    z-index: 10;
  }

  footer {
    color: #c3c0c7;
    padding-bottom: 3em;

    a {
      color: #2995cd;
    }
  }

  h3 {
    color: #878190;
  }

  ul {
    padding-left: 0;
    list-style-type: none;
  }

  li {
    margin-bottom: .5em;
  }

  .social {
    h3 {
      text-align: right;
    }
  }

  .icons {
    display: flex;
    justify-content: flex-end;
    flex-shrink: 1;
  }

  // smaller than desktop
  @media only screen and (max-width: 992px) {
    .social-circle {
      height: 32px !important;
      width: 32px !important;

      margin-left: 0.75em !important;
    }
  }

  .social-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #c3c0c7;
    display: flex;
    margin-left: 1em;

    &:first-child {
      margin-left: 0;
    }

    &:hover {
      background-color: #a5a1ac;
    }

    .social-icon {
      color: #e1e0e3;
      width: 16px;
      margin: auto;
    }
  }

  .logo {
    width: 24px;
    height: 24px;
    margin: 0 auto;
    color: #e1e0e3;
  }

  .debug-group {
    position: absolute;
    background: #fff;
    top: -300px;
    border-radius: 2px;
    padding: 2em;
  }

  .btn-contribute {
    background: #c3c0c7;
    box-shadow: none;
    border-radius: 4px;
    font-family: Roboto Condensed,sans-serif;

    &:hover {
      background: #a5a1ac;

      .text {
        color: white;
      }
    }

    a {
      display: flex;
    }

    .heart {
      max-height: 25px;
      width: 18px;
      margin-right: .5em;
      margin-bottom: .2em;
    }

    .text, .heart {
      display: inline-block;
      vertical-align: bottom;
    }
  }
</style>

<style lang="scss">
  .heart svg {
    margin-top: .1em;
  }

  .facebook svg {
    width: 10px;
    margin: 0 auto;
  }

  footer {
    &.expanded {
      padding-left: 6em;
      padding-right: 6em;
      padding-top: 3em;
      background: #e1e0e3;
      color: #878190;
      min-height: 408px;

      a {
        color: #878190;
      }

      .logo {
        color: #c3c0c7;
      }
    }
  }
</style>

<script>
import axios from 'axios';
import moment from 'moment';
import { mapState } from '@/libs/store';
import * as Analytics from '@/libs/analytics';

import gryphon from '@/assets/svg/gryphon.svg';
import twitter from '@/assets/svg/twitter.svg';
import facebook from '@/assets/svg/facebook.svg';
import instagram from '@/assets/svg/instagram.svg';
import heart from '@/assets/svg/heart.svg';

import buyGemsModal from './payments/buyGemsModal';

const IS_PRODUCTION = process.env.NODE_ENV === 'production'; // eslint-disable-line no-process-env

export default {
  components: {
    buyGemsModal,
  },
  data () {
    return {
      icons: Object.freeze({
        gryphon,
        twitter,
        facebook,
        instagram,
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
      if (!window.confirm(`Are you sure you want to reset the day by ${numberOfDays} day(s)?`)) return;

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
    async makeAdmin  () {
      await axios.post('/api/v4/debug/make-admin');

      // @TODO: Notification.text('You are now an admin!
      // Go to the Hall of Heroes to change your contributor level.');
      // @TODO: sync()
    },
    openModifyInventoryModal  () {
      this.$root.$emit('bv::show::modal', 'modify-inventory');
    },
    donate () {
      Analytics.track({
        hitType: 'event',
        eventCategory: 'button',
        eventAction: 'click',
        eventLabel: 'Gems > Donate',
      });
      this.$root.$emit('bv::show::modal', 'buy-gems', { alreadyTracked: true });
    },
  },
};
</script>
