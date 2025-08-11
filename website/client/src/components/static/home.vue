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
    <privacy-banner
      class="privacy-banner"
    />
    <div class="bg-purple-300 white">
      <div>
        <div
          id="intro-signup"
        >
          <div class="d-flex justify-content-center">
            <div class="w-33 mr-5 mt-5">
              <img
                src="@/assets/images/home/home-main@3x.png"
                width="357px"
              >
              <h1>{{ $t('motivateYourself') }}</h1>
              <p class="section-main">
                {{ $t('timeToGetThingsDone', {userCountInMillions}) }}
              </p>
            </div>
            <div class="w-33 ml-5">
              <h3 class="text-center">
                {{ $t('singUpForFree') }}
              </h3>
              <form
                class="form pb-0"
                @submit.prevent.stop="proceed('local')"
              >
                <input
                  v-model="email"
                  class="form-control input-with-error dark"
                  type="email"
                  :placeholder="$t('email')"
                  :class="{
                    'mb-3': !emailError,
                    'input-valid': emailValid,
                    'input-invalid mb-2': emailError,
                  }"
                >
                <div
                  v-if="emailError"
                  class="input-error"
                >
                  {{ emailError }}
                </div>
                <input
                  v-model="password"
                  class="form-control input-with-error dark"
                  type="password"
                  :placeholder="$t('password')"
                  :class="{
                    'mb-3': !passwordInvalid,
                    'input-valid': passwordValid,
                    'input-invalid mb-2': passwordInvalid,
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
                  class="form-control input-with-error dark"
                  type="password"
                  :placeholder="$t('confirmPassword')"
                  :class="{
                    'mb-3': !passwordConfirmInvalid,
                    'input-invalid mb-2': passwordConfirmInvalid,
                    'input-valid': passwordConfirmValid}"
                >
                <div
                  v-if="passwordConfirmInvalid"
                  class="input-error"
                >
                  {{ $t('passwordConfirmationMatch') }}
                </div>
                <button
                  id="continue-button"
                  class="btn btn-block btn-info"
                  :disabled="!(emailValid && passwordValid && passwordConfirmValid)"
                  type="submit"
                >
                  {{ $t('continue') }}
                </button>
              </form>
              <div class="strike">
                <span>{{ $t('or') }}</span>
              </div>
              <div class="text-center">
                <button
                  class="social-button"
                  @click="proceed('google')"
                >
                  <div
                    class="svg-icon social-icon"
                    v-html="icons.googleIcon"
                  ></div>
                  <span>{{ $t('signUpWithSocial', {social: 'Google'}) }}</span>
                </button>
                <button
                  class="social-button"
                  @click="proceed('apple')"
                >
                  <div
                    class="svg svg-icon social-icon apple-icon color"
                    v-html="icons.appleIcon"
                  ></div>
                  <span>{{ $t('signUpWithSocial', {social: 'Apple'}) }}</span>
                </button>
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
          id="gamify-life"
          class="bg-purple-100 white"
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
                  src="@/assets/images/home/track-habits@3x.png"
                  width="354px"
                  height="228px"
                >
                <strong>{{ $t('trackYourGoals') }}</strong>
                <p>{{ $t('trackYourGoalsDesc') }}</p>
              </div>
              <div class="col-12 col-md-4">
                <img
                  src="@/assets/images/home/earn-rewards@3x.png"
                  width="316px"
                  height="244px"
                >
                <strong>{{ $t('earnRewards') }}</strong>
                <p>{{ $t('earnRewardsDesc') }}</p>
              </div>
              <div class="col-12 col-md-4">
                <img
                  src="@/assets/images/home/battle-monsters@3x.png"
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
          class="bg-purple-100 white"
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
                  src="@/assets/images/home/health-fitness@3x.png"
                  width="300px"
                  height="300px"
                >
                <strong>{{ $t('healthAndFitness') }}</strong>
                <p>{{ $t('healthAndFitnessDesc') }}</p>
              </div>
              <div class="col-12 col-sm-4">
                <img
                  src="@/assets/images/home/school-work@3x.png"
                  width="300px"
                  height="300px"
                >
                <strong>{{ $t('schoolAndWork') }}</strong>
                <p>{{ $t('schoolAndWorkDesc') }}</p>
              </div>
              <div class="col-12 col-sm-4">
                <img
                  src="@/assets/images/home/much-more@3x.png"
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
          class="bg-purple-50 white"
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
          class="purple-4 white"
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
    </div>
  </div>
</template>

<style lang='scss'>
@import '@/assets/scss/static.scss';
  #front {
    .form-text a {
      color: $white !important;
    }
    .privacy-banner p {
      font-size: 14px;
    }
  }
</style>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';
@import '@/assets/scss/privacy.scss';

@import url('https://fonts.googleapis.com/css?family=Varela+Round');

  .w-33 {
    width: 33%;
  }

  #front {
    .container-fluid {
      margin: 0;
    }

    .container {
      padding-top: 5em;
      padding-bottom: 5em;
    }

    .custom-control-label, h1, h2, h3, h4, h5 {
      color: $white;
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

    h1, h2, h3, h4, h5, h6, .strike > span {
      font-family: 'Varela Round', sans-serif;
      font-weight: normal;
    }

    .seamless_stars_varied_opacity_repeat {
      background-image: url('@/assets/images/auth/seamless_stars_varied_opacity.png');
      background-repeat: repeat-x;
      height: 500px;
      width: 100%;
    }
  }

  #intro-signup {
    background-image: url('@/assets/svg/for-css/confetti.svg?raw');

    img {
      @media only screen and (min-width: 992px) {
        margin-left: 15%;
      }
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
        font-weight: 700;
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
      color: $white;
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
      background-image: url('@/assets/images/home/mobile-preview@3x.png');
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
      border-radius: 4px;
      background-color: $purple-400;
      box-shadow: 0 2px 2px 0 rgba($black, 0.24), 0 1px 4px 0 rgba($black, 0.16);
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
        box-shadow: 0 4px 4px 0 rgba($black, 0.16), 0 1px 8px 0 rgba($black, 0.12);
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
      background-image: url('@/assets/images/auth/seamless_stars_varied_opacity.png');
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
    margin-bottom: 1em;
  }
</style>

<script>
import notifications from '@/mixins/notifications';
import accountCreation from '@/mixins/accountCreation';
import PrivacyBanner from '@/components/header/banners/privacy';
import googlePlay from '@/assets/images/home/google-play-badge.svg?raw';
import iosAppStore from '@/assets/images/home/ios-app-store.svg?raw';
import iphones from '@/assets/images/home/iphones.svg?raw';
import spacer from '@/assets/images/home/spacer.svg?raw';
import pixelHorizontal from '@/assets/images/home/pixel-horizontal.svg?raw';
import pixelHorizontal2 from '@/assets/images/home/pixel-horizontal-2.svg?raw';
import pixelHorizontal3 from '@/assets/images/home/pixel-horizontal-3.svg?raw';
import facebookSquareIcon from '@/assets/svg/facebook-square.svg?raw';
import googleIcon from '@/assets/svg/google.svg?raw';
import appleIcon from '@/assets/svg/apple_black.svg?raw';
import cnet from '@/assets/svg/cnet.svg?raw';
import fastCompany from '@/assets/svg/fast-company.svg?raw';
import discover from '@/assets/images/home/discover.svg?raw';
import forbes from '@/assets/images/home/forbes.svg?raw';
import kickstarter from '@/assets/images/home/kickstarter.svg?raw';
import lifehacker from '@/assets/images/home/lifehacker.svg?raw';
import makeuseof from '@/assets/images/home/make-use-of.svg?raw';
import thenewyorktimes from '@/assets/images/home/the-new-york-times.svg?raw';

export default {
  components: {
    PrivacyBanner,
  },
  mixins: [accountCreation, notifications],
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
    };
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      fullTitle: 'Habitica - Gamify Your Life',
    });
  },
  methods: {
    playButtonClick () {
      this.$router.push('/register');
    },
  },
};
</script>
