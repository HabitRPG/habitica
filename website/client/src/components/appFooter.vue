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
                rel="noopener noreferrer"
                target="_blank"
              >{{ $t('mobileIOS') }}
              </a>
            </li>
            <li>
              <a
                href="https://play.google.com/store/apps/details?id=com.habitrpg.android.habitica"
                rel="noopener noreferrer"
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
                rel="noopener noreferrer"
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
                rel="noopener noreferrer"
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
                rel="noopener noreferrer"
              >{{ $t('companyContribute') }}
              </a>
            </li>
            <li>
              <a
                href="https://translate.habitica.com/"
                target="_blank"
                rel="noopener noreferrer"
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
                rel="noopener noreferrer"
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
                rel="noopener noreferrer"
              >
                {{ $t('reportBug') }}
              </a>
            </li>
            <li>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScPhrwq_7P1C6PTrI3lbvTsvqGyTNnGzp1ugi1Ml0PFee_p5g/viewform?usp=sf_link"
                target="_blank"
                rel="noopener noreferrer"
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
                href="https://apidoc.habitica.com"
                target="_blank"
                rel="noopener noreferrer"
              >{{ $t('APIv3') }}
              </a>
            </li>
            <li>
              <a
                :href="getDataDisplayToolUrl"
                target="_blank"
                rel="noopener noreferrer"
              >{{ $t('dataDisplayTool') }}
              </a>
            </li>
            <li>
              <a
                href="https://habitica.fandom.com/wiki/Guidance_for_Blacksmiths"
                target="_blank"
                rel="noopener noreferrer"
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
                  rel="noopener noreferrer"
                >
                  <div
                    class="social-icon svg-icon"
                    v-html="icons.instagram"
                  ></div>
                </a>
                <a
                  href="https://www.instagram.com/habitica/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ $t('communityInstagram') }}
                </a>
              </div>
              <div class="d-flex align-items-center mb-1">
                <a
                  class="social-circle mr-2"
                  href="https://bsky.app/profile/habitica.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div
                    class="social-icon svg-icon"
                    v-html="icons.bluesky"
                  ></div>
                </a>
                <a
                  href="https://bsky.app/profile/habitica.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Bluesky
                </a>
              </div>
              <div class="d-flex align-items-center mb-1">
                <a
                  class="social-circle mr-2"
                  href="https://www.facebook.com/Habitica/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div
                    class="social-icon svg-icon"
                    v-html="icons.facebook"
                  ></div>
                </a>
                <a
                  href="https://www.facebook.com/Habitica/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ $t('communityFacebook') }}
                </a>
              </div>
              <div class="d-flex align-items-center">
                <a
                  class="social-circle mr-2"
                  href="http://blog.habitrpg.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div
                    class="social-icon svg-icon"
                    v-html="icons.tumblr"
                  ></div>
                </a>
                <a
                  href="http://blog.habitrpg.com/"
                  target="_blank"
                  rel="noopener noreferrer"
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
                rel="noopener noreferrer"
                href="/static/privacy"
              >{{ $t('privacy') }}</a>
            </span>
            <span class="terms">
              <a
                target="_blank"
                rel="noopener noreferrer"
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
              rel="noopener noreferrer"
              href="/static/privacy"
            >{{ $t('privacy') }}</a>
          </div>
          <div class="mobile-terms mx-auto mb-2">
            <a
              target="_blank"
              rel="noopener noreferrer"
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
        <time-travel v-if="TIME_TRAVEL_ENABLED" />
        <debug-menu v-if="DEBUG_ENABLED" />
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

const DEBUG_ENABLED = import.meta.env.DEBUG_ENABLED === 'true';
const TIME_TRAVEL_ENABLED = import.meta.env.TIME_TRAVEL_ENABLED === 'true';

export default {
  components: {
    buyGemsModal,
    privacyModal,
    // only fetched when rendered, so prod builds never load them
    timeTravel: () => import('./timeTravel.vue'),
    debugMenu: () => import('./debugMenu.vue'),
  },
  mixins: [
    reportBug,
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
      DEBUG_ENABLED,
      TIME_TRAVEL_ENABLED,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
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
    donate () {
      this.$root.$emit('bv::show::modal', 'buy-gems', { alreadyTracked: true });
    },
    showBailey () {
      this.$root.$emit('bv::show::modal', 'new-stuff');
    },
  },
};
</script>
