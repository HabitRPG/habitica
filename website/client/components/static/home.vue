<template lang="pug">
  #front.static-view
    noscript.banner {{ $t('jsDisabledHeadingFull') }}
      br
      a(href='http://www.enable-javascript.com/', target='_blank') {{ $t('jsDisabledLink') }}

    #intro-signup.purple-1
      .container
        .row
          .col-12.col-md-6.col-lg-6
            img(src='~assets/images/home/home-main@3x.png', width='357px')
            h1 {{$t('motivateYourself')}}
            p.section-main {{$t('timeToGetThingsDone', {userCountInMillions})}}
          .col-12.col-md-6.col-lg-6
            h3.text-center {{$t('singUpForFree')}}
            div.text-center
              button.social-button(@click='socialAuth("facebook")')
                .svg-icon.social-icon(v-html="icons.facebookIcon")
                span {{$t('signUpWithSocial', {social: 'Facebook'})}}
              button.social-button(@click='socialAuth("google")')
                .svg-icon.social-icon(v-html="icons.googleIcon")
                span {{$t('signUpWithSocial', {social: 'Google'})}}
            .strike
              span {{$t('or')}}
            .form(@keyup.enter="register()")
              p.form-text {{$t('usernameLimitations')}}
              input#usernameInput.form-control(type='text', :placeholder='$t("username")', v-model='username', :class='{"input-valid": usernameValid, "input-invalid": usernameInvalid}')
              .input-error(v-for="issue in usernameIssues") {{ issue }}
              input.form-control(type='email', :placeholder='$t("email")', v-model='email', :class='{"input-invalid": emailInvalid, "input-valid": emailValid}')
              input.form-control(type='password', :placeholder='$t("password")', v-model='password', :class='{"input-valid": password.length > 3}')
              input.form-control(type='password', :placeholder='$t("confirmPassword")', v-model='passwordConfirm', :class='{"input-invalid": passwordConfirmInvalid, "input-valid": passwordConfirmValid}')
              p.form-text(v-once, v-html="$t('termsAndAgreement')")
              button.sign-up(@click="register()") {{$t('signup')}}
          .col-12
            .spacer.svg-icon(v-html='icons.spacer')

    #gamify-life.purple-2
      .container-fluid
        .pixel-horizontal.svg-icon(v-html='icons.pixelHorizontal')
      .container
        .row
          .col-12.col-sm-6.col-md-6.col-lg-6.offset-sm-3.text-center
            h2 {{$t('gamifyYourLife')}}
            p.section-main {{$t('aboutHabitica')}}
        .row
          .col-12.col-md-4
            img.track-habits(src='~assets/images/home/track-habits@3x.png', width='354px', height='228px')
            strong {{$t('trackYourGoals')}}
            p {{$t('trackYourGoalsDesc')}}
          .col-12.col-md-4
            img(src='~assets/images/home/earn-rewards@3x.png', width='316px', height='244px')
            strong {{$t('earnRewards')}}
            p {{$t('earnRewardsDesc')}}
          .col-12.col-md-4
            img(src='~assets/images/home/battle-monsters@3x.png', width='303px', height='244px')
            strong {{$t('battleMonsters')}}
            p {{$t('battleMonstersDesc')}}
      .col-12
        .spacer.svg-icon(v-html='icons.spacer')

    #use-cases.purple-2
      .container.text-center
        .row
          .col-12
            h2 {{$t('playersUseToImprove')}}
        .row
          .col-12.col-sm-4
            img(src='~assets/images/home/health-fitness@3x.png', width='300px', height='300px')
            strong {{$t('healthAndFitness')}}
            p {{$t('healthAndFitnessDesc')}}
          .col-12.col-sm-4
            img(src='~assets/images/home/school-work@3x.png', width='300px', height='300px')
            strong {{$t('schoolAndWork')}}
            p {{$t('schoolAndWorkDesc')}}
          .col-12.col-sm-4
            img(src='~assets/images/home/much-more@3x.png', width='300px', height='300px')
            strong {{$t('muchmuchMore')}}
            p {{$t('muchmuchMoreDesc')}}
      .col-12
        .spacer.svg-icon(v-html='icons.spacer')
      .container-fluid
        .pixel-horizontal-2.svg-icon(v-html='icons.pixelHorizontal2')

    #level-up-anywhere.purple-3
      .container
        .row
          .col-12.col-md-6.col-lg-6
            .iphones
          .col-12.col-md-6.col-lg-6.text-column
            h2 {{ $t('levelUpAnywhere') }}
            p {{ $t('levelUpAnywhereDesc') }}
            a.app.svg-icon(v-html='icons.googlePlay', href='https://play.google.com/store/apps/details?id=com.habitrpg.android.habitica', target='_blank')
            a.app.svg-icon(v-html='icons.iosAppStore', href='https://itunes.apple.com/us/app/habitica-gamified-task-manager/id994882113?mt=8', target='_blank')
      .container-fluid
        .pixel-horizontal-3.svg-icon(v-html='icons.pixelHorizontal3')

    #call-to-action.purple-4
      .container.featured
        .row.text-center
          h3.col-12 {{ $t('joinMany') }}
        .row
          .col-12.text-center
            button.btn.btn-primary.join-button(@click='playButtonClick()') {{ $t('joinToday') }}
        .row.featured
          .col-12.text-center
            strong {{ $t('featuredIn') }}
      .container-fluid.featured
        .row
          .col-12.text-center
            .lifehacker.svg-icon(v-html='icons.lifehacker')
            .thenewyorktimes.svg-icon(v-html='icons.thenewyorktimes')
            .makeuseof.svg-icon(v-html='icons.makeuseof')
            .forbes.svg-icon(v-html='icons.forbes')
            .cnet.svg-icon(v-html='icons.cnet')
            .kickstarter.svg-icon(v-html='icons.kickstarter')
            .fast-company.svg-icon(v-html='icons.fastCompany')
            .discover.svg-icon(v-html='icons.discover')
      .container-fluid
        .row.seamless_stars_varied_opacity_repeat
</template>

<style lang='scss'>
@import '~client/assets/scss/static.scss';
</style>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

@import url('https://fonts.googleapis.com/css?family=Varela+Round');

  #front {
    .form-text a {
      color: #fff !important;
    }

    .container-fluid {
      margin: 0;
    }

    .container {
      padding-top: 5em;
      padding-bottom: 5em;
    }

    .logo {
      width: 128px;
      height: 28px;
      color: purple;
    }

    .purple-1, .purple-2, .purple-3, .purple-4, h1, h2, h3, h4, h5 {
      color: #fff;
    }

    .purple-1 {
      background-color: #6133b4;
    }

    .purple-2 {
      background-color: #432874;
    }

    .purple-3 {
      background-color: #36205d;
    }

    .purple-4 {
      background-color: #271b3d;
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
      color: #6133b4;
    }

    .pixel-horizontal-2 {
      color: #432874;
    }

    .pixel-horizontal-3 {
      color: #271b3d;
    }

    h1, h2, h3, h4, h5, h6, button, .strike > span, input {
      font-family: 'Varela Round', sans-serif;
      font-weight: normal;
    }
  }

  #intro-signup {
    background-image: url('~assets/svg/for-css/confetti.svg');

    img {
      margin: 0 auto;
      display: block;
    }

    h1 {
      font-size: 56px;
      line-height: 1.14;
    }

    h3 {
      font-size: 24px;
    }

    .social-button {
      border-radius: 2px;
      border: solid 2px #bda8ff;
      width: 48%;
      min-height: 40px;
      padding: .5em;
      background: transparent;
      margin-right: .5em;
      color: #bda8ff;
      transition: .5s;

      span {
        transition: none;
      }
    }

    .social-button:hover {
      cursor: pointer;
      border-color: #fff;
      color: #fff;
    }

    .social-icon {
      margin-right: 1em;
      width: 18px;
      height: 18px;
      display: inline-block;
      vertical-align: top;
      margin-top: .2em;
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
      background-color: #432874;
      border-color: #432874;
      color: $purple-400;
      border: solid 2px transparent;
      transition-timing-function: ease;
      transition: border .5s, color .5s;
    }

    #usernameInput.input-invalid {
      margin-bottom: 0.5em;
    }

    .input-valid {
      color: #fff;
    }

    input:focus {
      border: solid 2px #9a62ff;
      color: #fff;
      background-color: #36205d;
    }

    input:hover {
      background-color: #36205d;
    }

    button.sign-up {
      width: 100%;
      height: 48px;
      color: #fff;
      border: none;
      border-radius: 2px;
      background-color: #2995cd;
      font-size: 16px;
      transition: all .5s ease;
    }

    .sign-up:hover {
      background-color: #50b5e9;
      box-shadow: 0 4px 4px 0 rgba(26, 24, 29, 0.16), 0 1px 8px 0 rgba(26, 24, 29, 0.12);
      cursor: pointer;
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
      background-image: url('~assets/images/home/mobile-preview@3x.png');
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
      background-color: #9a62ff;
      box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.24), 0 1px 4px 0 rgba(26, 24, 29, 0.16);
      margin-bottom: 5em;
    }

    .container.featured {
      padding-bottom: 0;
    }

    .container-fluid.featured {
      padding-bottom: 5em;
    }

    .join-button:hover {
      cursor: pointer;
      background-color: #b288ff;
      box-shadow: 0 4px 4px 0 rgba(26, 24, 29, 0.16), 0 1px 8px 0 rgba(26, 24, 29, 0.12);
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
        color: #d5c8ff;
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
      background-image: url('~assets/images/auth/seamless_stars_varied_opacity.png');
      background-repeat: repeat-x;
      position: absolute;
      height: 500px;
      width: 100%;
      opacity: .5;
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
    color: #fff;
    font-size: 90%;
    width: 100%;
    text-align: center;
    margin-bottom: 1em;
  }
</style>

<script>
  import hello from 'hellojs';
  import debounce from 'lodash/debounce';
  import isEmail from 'validator/lib/isEmail';
  import googlePlay from 'assets/images/home/google-play-badge.svg';
  import iosAppStore from 'assets/images/home/ios-app-store.svg';
  import iphones from 'assets/images/home/iphones.svg';
  import spacer from 'assets/images/home/spacer.svg';
  import pixelHorizontal from 'assets/images/home/pixel-horizontal.svg';
  import pixelHorizontal2 from 'assets/images/home/pixel-horizontal-2.svg';
  import pixelHorizontal3 from 'assets/images/home/pixel-horizontal-3.svg';
  import facebookSquareIcon from 'assets/svg/facebook-square.svg';
  import googleIcon from 'assets/svg/google.svg';
  import cnet from 'assets/svg/cnet.svg';
  import fastCompany from 'assets/svg/fast-company.svg';
  import discover from 'assets/images/home/discover.svg';
  import forbes from 'assets/images/home/forbes.svg';
  import kickstarter from 'assets/images/home/kickstarter.svg';
  import lifehacker from 'assets/images/home/lifehacker.svg';
  import makeuseof from 'assets/images/home/make-use-of.svg';
  import thenewyorktimes from 'assets/images/home/the-new-york-times.svg';
  import * as Analytics from 'client/libs/analytics';

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
          cnet,
          fastCompany,
          discover,
          forbes,
          kickstarter,
          lifehacker,
          makeuseof,
          thenewyorktimes,
        }),
        userCountInMillions: 3,
        username: '',
        password: '',
        passwordConfirm: '',
        email: '',
        usernameIssues: [],
      };
    },
    mounted () {
      Analytics.track({
        hitType: 'pageview',
        eventCategory: 'page',
        eventAction: 'landing page',
        page: '/static/home',
      });

      hello.init({
        facebook: process.env.FACEBOOK_KEY, // eslint-disable-line
        // windows: WINDOWS_CLIENT_ID,
        google: process.env.GOOGLE_CLIENT_ID, // eslint-disable-line
      });
    },
    computed: {
      emailValid () {
        if (this.email.length <= 3) return false;
        return isEmail(this.email);
      },
      emailInvalid () {
        if (this.email.length <= 3) return false;
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
      passwordConfirmValid () {
        if (this.passwordConfirm.length <= 3) return false;
        return this.passwordConfirm === this.password;
      },
      passwordConfirmInvalid () {
        if (this.passwordConfirm.length <= 3) return false;
        return this.passwordConfirm !== this.password;
      },
    },
    watch: {
      username () {
        this.validateUsername(this.username);
      },
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

        let redirectTo;

        if (this.$route.query.redirectTo) {
          redirectTo = this.$route.query.redirectTo;
        } else {
          redirectTo = '/';
        }

        window.location.href = redirectTo;
      },
      playButtonClick () {
        Analytics.track({
          hitType: 'event',
          eventCategory: 'button',
          eventAction: 'click',
          eventLabel: 'Play',
        });
        this.$router.push('/register');
      },
      // @TODO: Abstract hello in to action or lib
      async socialAuth (network) {
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
      },
    },
  };
</script>
