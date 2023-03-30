<template>
  <div
    id="front"
    class="static-view"
  >
    <noscript class="banner">
      {{ $t('jsDisabledHeadingFull') }}
      <br />
      <a href="https://www.enable-javascript.com/" target="_blank">{{ $t('jsDisabledLink') }}</a>
    </noscript>
    <div
      id="intro-signup"
      class="purple-1"
    >
      <div class="container">
        <div class="row">
          <div class="col-12 col-md-6 col-lg-6">
            <img
              src="~@/assets/images/home/home-main@3x.png"
              width="357px"
            >
            <h1>{{ $t('motivateYourself') }}</h1>
            <p class="section-main">
              {{ $t('timeToGetThingsDone', {userCountInMillions}) }}
            </p>
          </div>
          <div class="col-12 col-md-6 col-lg-6">
            <h3 class="text-center">
              {{ $t('singUpForFree') }}
            </h3>
            <form
              class="form"
              @submit.prevent.stop="register()"
            >
              <p class="form-text">
                {{ $t('usernameLimitations') }}
              </p>
              <input
                id="usernameInput"
                v-model="username"
                class="form-control input-with-error"
                type="text"
                :placeholder="$t('username')"
                :class="{'input-valid': usernameValid, 'input-invalid': usernameInvalid}"
              >
              <!-- eslint-disable vue/require-v-for-key -->
              <div
                v-for="issue in usernameIssues"
                class="input-error"
              >
                <!-- eslint-enable vue/require-v-for-key -->
                {{ issue }}
              </div>
              <input
                v-model="email"
                class="form-control"
                type="email"
                :placeholder="$t('email')"
                :class="{'input-invalid': emailInvalid, 'input-valid': emailValid}"
              >
              <input
                v-model="password"
                class="form-control input-with-error"
                type="password"
                :placeholder="$t('password')"
                :class="{
                  'input-valid': passwordValid,
                  'input-invalid': passwordInvalid,
                }"
              >
              <div
                v-if="passwordInvalid"
                class="input-error"
              >
                {{ $t('minPasswordLength') }}
              </div>
              <input
                v-model="passwordConfirm"
                class="form-control input-with-error"
                type="password"
                :placeholder="$t('confirmPassword')"
                :class="{
                  'input-invalid': passwordConfirmInvalid,
                  'input-valid': passwordConfirmValid}"
              >
              <div
                v-if="passwordConfirmInvalid"
                class="input-error"
              >
                {{ $t('passwordConfirmationMatch') }}
              </div>
              <p
                v-once
                class="form-text"
                v-html="$t('termsAndAgreement')"
              ></p>
              <button
                class="btn btn-block btn-info sign-up"
                :disabled="signupFormInvalid"
                type="submit"
              >
                {{ $t('signup') }}
              </button>
            </form>
            <div class="strike">
              <span>{{ $t('or') }}</span>
            </div>
            <div class="text-center">
              <button
                class="social-button"
                @click="socialAuth('google')"
              >
                <div
                  class="svg-icon social-icon"
                  v-html="icons.googleIcon"
                ></div>
                <span>{{ $t('signUpWithSocial', {social: 'Google'}) }}</span>
              </button>
              <button
                class="social-button"
                @click="socialAuth('apple')"
              >
                <div
                  class="svg-icon social-icon apple-icon"
                  v-html="icons.appleIcon"
                ></div>
                <span>{{ $t('signUpWithSocial', {social: 'Apple'}) }}</span>
              </button>
            </div>
          </div>
          <div class="col-12">
            <div
              class="spacer svg-icon"
              v-html="icons.spacer"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div
      id="gamify-life"
      class="purple-2"
    >
      <div class="container-fluid">
        <div
          class="pixel-horizontal svg-icon"
          v-html="icons.pixelHorizontal"
        ></div>
      </div>
      <div class="container">
        <div class="row">
          <div class="col-12 col-sm-6 col-md-6 col-lg-6 offset-sm-3 text-center">
            <h2>{{ $t('gamifyYourLife') }}</h2>
            <p class="section-main">
              {{ $t('aboutHabitica') }}
            </p>
          </div>
        </div>
        <div class="row">
          <div class="col-12 col-md-4">
            <img
              class="track-habits"
              src="~@/assets/images/home/track-habits@3x.png"
              width="354px"
              height="228px"
            >
            <strong>{{ $t('trackYourGoals') }}</strong>
            <p>{{ $t('trackYourGoalsDesc') }}</p>
          </div>
          <div class="col-12 col-md-4">
            <img
              src="~@/assets/images/home/earn-rewards@3x.png"
              width="316px"
              height="244px"
            >
            <strong>{{ $t('earnRewards') }}</strong>
            <p>{{ $t('earnRewardsDesc') }}</p>
          </div>
          <div class="col-12 col-md-4">
            <img
              src="~@/assets/images/home/battle-monsters@3x.png"
              width="303px"
              height="244px"
            >
            <strong>{{ $t('battleMonsters') }}</strong>
            <p>{{ $t('battleMonstersDesc') }}</p>
          </div>
        </div>
      </div>
      <div class="col-12">
        <div
          class="spacer svg-icon"
          v-html="icons.spacer"
        ></div>
      </div>
    </div>
    <div
      id="use-cases"
      class="purple-2"
    >
      <div class="container text-center">
        <div class="row">
          <div class="col-12">
            <h2>{{ $t('playersUseToImprove') }}</h2>
          </div>
        </div>
        <div class="row">
          <div class="col-12 col-sm-4">
            <img
              src="~@/assets/images/home/health-fitness@3x.png"
              width="300px"
              height="300px"
            >
            <strong>{{ $t('healthAndFitness') }}</strong>
            <p>{{ $t('healthAndFitnessDesc') }}</p>
          </div>
          <div class="col-12 col-sm-4">
            <img
              src="~@/assets/images/home/school-work@3x.png"
              width="300px"
              height="300px"
            >
            <strong>{{ $t('schoolAndWork') }}</strong>
            <p>{{ $t('schoolAndWorkDesc') }}</p>
          </div>
          <div class="col-12 col-sm-4">
            <img
              src="~@/assets/images/home/much-more@3x.png"
              width="300px"
              height="300px"
            >
            <strong>{{ $t('muchmuchMore') }}</strong>
            <p>{{ $t('muchmuchMoreDesc') }}</p>
          </div>
        </div>
      </div>
      <div class="col-12">
        <div
          class="spacer svg-icon"
          v-html="icons.spacer"
        ></div>
      </div>
      <div class="container-fluid">
        <div
          class="pixel-horizontal-2 svg-icon"
          v-html="icons.pixelHorizontal2"
        ></div>
      </div>
    </div>
    <div
      id="level-up-anywhere"
      class="purple-3"
    >
      <div class="container">
        <div class="row">
          <div class="col-12 col-md-6 col-lg-6">
            <div class="iphones"></div>
          </div>
          <div class="col-12 col-md-6 col-lg-6 text-column">
            <h2>{{ $t('levelUpAnywhere') }}</h2>
            <p>{{ $t('levelUpAnywhereDesc') }}</p>
            <a
              class="app svg-icon"
              href="https://play.google.com/store/apps/details?id=com.habitrpg.android.habitica"
              target="_blank"
              v-html="icons.googlePlay"
            ></a>
            <a
              class="app svg-icon"
              href="https://itunes.apple.com/us/app/habitica-gamified-task-manager/id994882113?mt=8"
              target="_blank"
              v-html="icons.iosAppStore"
            ></a>
          </div>
        </div>
      </div>
      <div class="container-fluid">
        <div
          class="pixel-horizontal-3 svg-icon"
          v-html="icons.pixelHorizontal3"
        ></div>
      </div>
    </div>
    <div
      id="call-to-action"
      class="purple-4"
    >
      <div class="container featured">
        <div class="row text-center">
          <h3 class="col-12">
            {{ $t('joinMany', {userCountInMillions}) }}
          </h3>
        </div>
        <div class="row">
          <div class="col-12 text-center">
            <button
              class="btn btn-primary btn-front join-button"
              @click="playButtonClick()"
            >
              {{ $t('joinToday') }}
            </button>
          </div>
        </div>
        <div class="row featured">
          <div class="col-12 text-center">
            <strong>{{ $t('featuredIn') }}</strong>
          </div>
        </div>
      </div>
      <div class="container-fluid featured">
        <div class="row">
          <div class="col-12 text-center">
            <div
              class="lifehacker svg-icon"
              v-html="icons.lifehacker"
            ></div>
            <div
              class="thenewyorktimes svg-icon"
              v-html="icons.thenewyorktimes"
            ></div>
            <div
              class="makeuseof svg-icon"
              v-html="icons.makeuseof"
            ></div>
            <div
              class="forbes svg-icon"
              v-html="icons.forbes"
            ></div>
            <div
              class="cnet svg-icon"
              v-html="icons.cnet"
            ></div>
            <div
              class="kickstarter svg-icon"
              v-html="icons.kickstarter"
            ></div>
            <div
              class="fast-company svg-icon"
              v-html="icons.fastCompany"
            ></div>
            <div
              class="discover svg-icon"
              v-html="icons.discover"
            ></div>
          </div>
        </div>
      </div>
      <div class="container-fluid">
        <div class="row seamless_stars_varied_opacity_repeat"></div>
      </div>
    </div>
  </div>
</template>

<style lang='scss'>
@import '~@/assets/scss/static.scss';
  #front .form-text a {
    color: $white !important;
  }
</style>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

@import url('https://fonts.googleapis.com/css?family=Varela+Round');

  #front {
    .container-fluid {
      margin: 0;
    }

    .container {
      padding-top: 5em;
      padding-bottom: 5em;
    }

    .purple-1, .purple-2, .purple-3, .purple-4, h1, h2, h3, h4, h5 {
      color: $white;
    }

    .purple-1 {
      background-color: $purple-300;
    }

    .purple-2 {
      background-color: $purple-100;
    }

    .purple-3 {
      background-color: $purple-50;
    }

    .purple-4 {
      background-color: $header-dark-background;
    }

    p.section-main {
      font-size: 18px;
      line-height: 1.33;
    }

    h2 {
      font-size: 48px;
      line-height: 1.33;
    }

    .spacer {
      width: 24px;
      height: 24px;
      margin: 0 auto;
      margin-top: 2em;
    }

    .pixel-horizontal {
      color: $purple-300;
    }

    .pixel-horizontal-2 {
      color: $purple-100;
    }

    .pixel-horizontal-3 {
      color: $header-dark-background;
    }

    h1, h2, h3, h4, h5, h6, button, .strike > span, input {
      font-family: 'Varela Round', sans-serif;
      font-weight: normal;
    }
  }

  #intro-signup {
    background-image: url('~@/assets/svg/for-css/confetti.svg');

    img {
      margin: 0 auto;
      display: block;
    }

    h1 {
      font-size: 56px;
      line-height: 1.14;
    }

    h3 {
      font-size: 32px;
    }

    .social-button {
      border-radius: 2px;
      border: solid 2px $purple-500;
      width: 100%;
      min-height: 40px;
      padding: .5em;
      background: transparent;
      margin-bottom: .5em;
      color: $purple-500;
      transition: .5s;

      span {
        transition: none;
      }
    }

    .social-button:hover {
      cursor: pointer;
      border-color: $white;
      color: $white;
    }

    .social-icon {
      margin-right: 1em;
      width: 18px;
      height: 18px;
      display: inline-block;
      vertical-align: top;
      margin-top: .1em;
    }

    .apple-icon {
      margin-top: -1px;
    }

    .strike {
      display: block;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      margin-top: 1.5em;
      margin-bottom: 1.5em;
    }

    .strike > span {
      position: relative;
      display: inline-block;
      line-height: 1.14;
    }

    .strike > span:before,
    .strike > span:after {
      content: "";
      position: absolute;
      top: 50%;
      width: 9999px;
      height: 1px;
      background: #fff;
    }

    .strike > span:before {
      right: 100%;
      margin-right: 15px;
    }

    .strike > span:after {
      left: 100%;
      margin-left: 15px;
    }

    .form {
      padding-top: 1em;
      padding-bottom: 1em;
    }

    input {
      margin-bottom: 1em;
      border-radius: 2px;
      background-color: $purple-100;
      border-color: $purple-100;
      color: $purple-400;
      border: solid 2px transparent;
      transition-timing-function: ease;
      transition: border .5s, color .5s;
    }

    .input-invalid.input-with-error {
      margin-bottom: 0.5em;
    }

    .input-valid {
      color: $white;
    }

    input:focus {
      border: solid 2px $purple-400;
      color: #fff;
      background-color: $purple-50;
    }

    input:hover {
      background-color: $purple-50;
    }

    .sign-up {
      padding-top: 11px;
      padding-bottom: 11px;
    }

    ::-webkit-input-placeholder { /* Chrome/Opera/Safari */
      color: $purple-400;
    }
    ::-moz-placeholder { /* Firefox 19+ */
      color: $purple-400;
    }
    :-ms-input-placeholder { /* IE 10+ */
      color: $purple-400;
    }
    :-moz-placeholder { /* Firefox 18- */
      color: $purple-400;
    }
    ::placeholder { //  Standard browsers
      color: $purple-400;
    }
  }

  #gamify-life {
    text-align: center;

    img {
      max-width: 100%;
      display: block;
      margin: 0 auto;
      margin-top: 1em;
      margin-bottom: 1.5em;
    }

    .track-habits {
      margin-bottom: 2.5em;
    }

    strong {
      font-size: 24px;
      font-family: 'Varela Round', sans-serif;
      line-height: 1.33;
    }
  }

  #use-cases {
    strong {
      font-size: 24px;
      font-family: 'Varela Round', sans-serif;
      line-height: 1.33;
    }

    img {
      display: block;
      height: 200px;
      width: 200px;
      margin: 0 auto;
      margin-top: 2em;
      margin-bottom: 2em;
    }
  }

  #level-up-anywhere {
    .app {
      display: inline-block;
      width: 135px;
      margin-right: .5em;
    }

    .app {
      cursor: pointer;
    }

    .iphones {
      width: 436px;
      height: 520px;
      max-width: 100%;
      background-repeat: no-repeat;
      background-size: 100%;
      background-image: url('~@/assets/images/home/mobile-preview@3x.png');
    }

    .text-column {
      padding-top: 9em;
    }
  }

  #call-to-action {
    .row {
      margin-top: 1em;
      margin-bottom: 1em;
    }

    h3 {
      font-size: 32px;
    }

    .btn-primary {
      width: 411px;
      height: 48px;
      border-radius: 2px;
      background-color: $purple-400;
      box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.24), 0 1px 4px 0 rgba(26, 24, 29, 0.16);
      margin-bottom: 5em;
    }

    .container.featured {
      padding-bottom: 0;
    }

    .container-fluid.featured {
      padding-bottom: 5em;
    }

    .join-button {
      cursor: pointer;

      &:hover {
        background-color: $purple-50;
        box-shadow: 0 4px 4px 0 rgba(26, 24, 29, 0.16), 0 1px 8px 0 rgba(26, 24, 29, 0.12);
      }
    }

    .featured .row {
      margin-top: 0;
    }

    .featured {
      text-align: center;
      font-family: 'Varela Round', sans-serif;

      strong {
        font-size: 12px;
      }

      .svg-icon {
        vertical-align: bottom;
        color: $purple-600;
        display: inline-block;
        margin-right: 1em;
      }

      .lifehacker {
        width: 116.7px;
        height: 32px;
      }

      .thenewyorktimes {
        width: 170.4px;
        height: 24px;
      }

      .makeuseof {
        width: 59.7px;
        height: 32px;
      }

      .forbes {
        width: 91.7px;
        height: 24px;
      }

      .kickstarter {
        width: 205px;
        height: 24px;
      }

      .discover {
        width: 119.6px;
        height: 24px;
      }

      .cnet {
        width: 40px;
        height: 40px;
        padding-top: .5em;
        margin-right: 1em;
      }

      .fast-company {
        width: 161.3px;
        height: 24px;
      }

      img {
        max-height: 30px;
        max-width: 120px;
        vertical-align: middle;
        margin: 20px;
        -moz-filter: brightness(0) invert(1);
        -ms-filter: brightness(0) invert(1);
        -o-filter: brightness(0) invert(1);
        filter: brightness(0) invert(1);
        -webkit-filter: brightness(0) invert(1);
      }
    }

    .seamless_stars_varied_opacity_repeat {
      background-image: url('~@/assets/images/auth/seamless_stars_varied_opacity.png');
      background-repeat: repeat-x;
      position: absolute;
      height: 500px;
      width: 100%;
      opacity: .5;
      pointer-events: none;
    }
  }

  @media only screen and (max-width: 768px) {
    #call-to-action .btn-primary {
      width: 95%;
    }

    #call-to-action .featured .svg-icon {
      display: block;
      margin: 0 auto;
      margin-bottom: .5em;
    }
  }

  .input-error {
    color: $white;
    font-size: 90%;
    width: 100%;
    margin-bottom: 1em;
  }
</style>

<script>
import hello from 'hellojs';
import debounce from 'lodash/debounce';
import isEmail from 'validator/lib/isEmail';
import { buildAppleAuthUrl } from '../../libs/auth';
import googlePlay from '@/assets/images/home/google-play-badge.svg';
import iosAppStore from '@/assets/images/home/ios-app-store.svg';
import iphones from '@/assets/images/home/iphones.svg';
import spacer from '@/assets/images/home/spacer.svg';
import pixelHorizontal from '@/assets/images/home/pixel-horizontal.svg';
import pixelHorizontal2 from '@/assets/images/home/pixel-horizontal-2.svg';
import pixelHorizontal3 from '@/assets/images/home/pixel-horizontal-3.svg';
import facebookSquareIcon from '@/assets/svg/facebook-square.svg';
import googleIcon from '@/assets/svg/google.svg';
import appleIcon from '@/assets/svg/apple.svg';
import cnet from '@/assets/svg/cnet.svg';
import fastCompany from '@/assets/svg/fast-company.svg';
import discover from '@/assets/images/home/discover.svg';
import forbes from '@/assets/images/home/forbes.svg';
import kickstarter from '@/assets/images/home/kickstarter.svg';
import lifehacker from '@/assets/images/home/lifehacker.svg';
import makeuseof from '@/assets/images/home/make-use-of.svg';
import thenewyorktimes from '@/assets/images/home/the-new-york-times.svg';
import { MINIMUM_PASSWORD_LENGTH } from '@/../../common/script/constants';

export default {
  data () {
    return {
      icons: Object.freeze({
        googlePlay,
        iosAppStore,
        iphones,
        spacer,
        pixelHorizontal,
        pixelHorizontal2,
        pixelHorizontal3,
        facebookIcon: facebookSquareIcon,
        googleIcon,
        appleIcon,
        cnet,
        fastCompany,
        discover,
        forbes,
        kickstarter,
        lifehacker,
        makeuseof,
        thenewyorktimes,
      }),
      userCountInMillions: 4,
      username: '',
      password: '',
      passwordConfirm: '',
      email: '',
      usernameIssues: [],
    };
  },
  computed: {
    emailValid () {
      if (this.email.length < 1) return false;
      return isEmail(this.email);
    },
    emailInvalid () {
      if (this.email.length < 1) return false;
      return !isEmail(this.email);
    },
    usernameValid () {
      if (this.username.length < 1) return false;
      return this.usernameIssues.length === 0;
    },
    usernameInvalid () {
      if (this.username.length < 1) return false;
      return !this.usernameValid;
    },
    passwordValid () {
      if (this.password.length <= 0) return false;
      return this.password.length >= MINIMUM_PASSWORD_LENGTH;
    },
    passwordInvalid () {
      if (this.password.length <= 0) return false;
      return this.password.length < MINIMUM_PASSWORD_LENGTH;
    },
    passwordConfirmValid () {
      if (this.passwordConfirm.length <= 3) return false;
      return this.passwordConfirm === this.password;
    },
    passwordConfirmInvalid () {
      if (this.passwordConfirm.length <= 3) return false;
      return this.passwordConfirm !== this.password;
    },
    signupFormInvalid () {
      return this.usernameInvalid
        || this.emailInvalid
        || this.passwordInvalid
        || this.passwordConfirmInvalid;
    },
  },
  watch: {
    username () {
      this.validateUsername(this.username);
    },
  },
  mounted () {
    hello.init({
      facebook: process.env.FACEBOOK_KEY, // eslint-disable-line
      // windows: WINDOWS_CLIENT_ID,
      google: process.env.GOOGLE_CLIENT_ID, // eslint-disable-line
    });
    this.$store.dispatch('common:setTitle', {
      fullTitle: 'Habitica - Gamify Your Life',
    });
  },
  methods: {
    // eslint-disable-next-line func-names
    validateUsername: debounce(function (username) {
      if (username.length < 1) {
        return;
      }

      this.$store.dispatch('auth:verifyUsername', {
        username: this.username,
      }).then(res => {
        if (res.issues !== undefined) {
          this.usernameIssues = res.issues;
        } else {
          this.usernameIssues = [];
        }
      });
    }, 500),
    // @TODO this is totally duplicate from the registerLogin component
    async register () {
      let groupInvite = '';
      if (this.$route.query && this.$route.query.p) {
        groupInvite = this.$route.query.p;
      }

      if (this.$route.query && this.$route.query.groupInvite) {
        groupInvite = this.$route.query.groupInvite;
      }

      await this.$store.dispatch('auth:register', {
        username: this.username,
        email: this.email,
        password: this.password,
        passwordConfirm: this.passwordConfirm,
        groupInvite,
      });

      window.location.href = this.$route.query.redirectTo || '/';
    },
    playButtonClick () {
      this.$router.push('/register');
    },
    // @TODO: Abstract hello in to action or lib
    async socialAuth (network) {
      if (network === 'apple') {
        window.location.href = buildAppleAuthUrl();
      } else {
        try {
          await hello(network).logout();
        } catch (e) {} // eslint-disable-line

        const redirectUrl = `${window.location.protocol}//${window.location.host}`;
        const auth = await hello(network).login({
          scope: 'email',
          // explicitly pass the redirect url or it might redirect to /home
          redirect_uri: redirectUrl, // eslint-disable-line camelcase
        });

        await this.$store.dispatch('auth:socialAuth', {
          auth,
        });

        window.location.href = '/';
      }
    },
  },
};
</script>
