<template lang="pug">
  #front
    noscript.banner {{ $t('jsDisabledHeadingFull') }}
      br
      a(href='http://www.enable-javascript.com/', target='_blank') {{ $t('jsDisabledLink') }}

    static-header

    #intro-signup.purple-1
      .container
        .row
          .col-6
            img(src='~assets/images/home/home-main@3x.png', width='357px')
            h1 Motivate yourself to achieve your goals.
            p.section-main It's time to have fun when you get things done! Join over 2 million Habiticans and improve your life one task at a time.
          .col-6
            h3.text-center Sign  Up For Free
            div.text-center
              button.social-button(@click='socialAuth("facebook")')
                .svg-icon.social-icon(v-html="icons.facebookIcon")
                span {{$t('signUpWithSocial', {social: 'Facebook'})}}
              button.social-button(@click='socialAuth("google")')
                .svg-icon.social-icon(v-html="icons.googleIcon")
                span {{$t('signUpWithSocial', {social: 'Google'})}}
            .strike
              span OR
            .form
              input.form-control(type='text', placeholder='Username', v-model='username')
              input.form-control(type='email', placeholder='Email', v-model='email')
              input.form-control(type='password', placeholder='Password', v-model='password')
              input.form-control(type='password', placeholder='Confirm Password', v-model='passwordConfirm')
              p By clicking the button below, you are indicating that you have read and agree to the Terms of Service and Privacy Policy.
              button.sign-up(@click='register()') Sign Up
          .col-12
            .spacer.svg-icon(v-html='icons.spacer')

    #gamify-life.purple-2
      .container-fluid
        .pixel-horizontal.svg-icon(v-html='icons.pixelHorizontal')
      .container
        .row
          .col-6.offset-3.text-center
            h2 Gamify Your Life
            p.section-main Habitica is a free habit-building and productivity app that treats your real life like a game. With in-game rewards and punishments to motivate you and a strong social network to inspire you, Habitica can help you achieve your goals to become healthy, hard-working, and happy.
        .row
          .col-4
            img.track-habits(src='~assets/images/home/track-habits@3x.png', width='354px', height='228px')
            strong Track Your Habits and Goals
            p Stay accountable by tracking and managing your Habits, Daily goals, and To-Do list with Habitica’s easy-to-use mobile apps and web interface.
          .col-4
            img(src='~assets/images/home/earn-rewards@3x.png', width='316px', height='244px')
            strong Earn Rewards for Your Goals
            p Check off tasks to level up your Avatar and unlock in-game features such as battle armor, mysterious pets, magic skills, and even quests!
          .col-4
            img(src='~assets/images/home/battle-monsters@3x.png', width='303px', height='244px')
            strong Battle Monsters with Friends
            p Fight monsters with other Habiticans! Use the Gold that you earn to buy in-game or custom rewards, like watching an episode of your favorite TV show.
      .col-12
        .spacer.svg-icon(v-html='icons.spacer')

    #use-cases.purple-2
      .container.text-center
        .row
          .col-12
            h2 Players Use Habitica to Improve
        .row
          .col-4
            img(src='~assets/images/home/health-fitness@3x.png', width='300px', height='300px')
            strong Health and Fitness
            p Never motivated to floss? Can't seem to get to the gym? Habitica finally makes it fun to get healthy.
          .col-4
            img(src='~assets/images/home/school-work@3x.png', width='300px', height='300px')
            strong School and Work
            p Whether you're preparing a report for your teacher or your boss, it's easy to keep track of your progress as you tackle your toughest tasks.
          .col-4
            img(src='~assets/images/home/much-more@3x.png', width='300px', height='300px')
            strong And much, much more!
            p Our fully customizable task list means that you can shape Habitica to fit your personal goals. Work on creative projects, emphasize self-care, or pursue a different dream -- it's all up to you.
      .col-12
        .spacer.svg-icon(v-html='icons.spacer')
      .container-fluid
        .pixel-horizontal-2.svg-icon(v-html='icons.pixelHorizontal2')

    #level-up-anywhere.purple-3
      .container
        .row
          .col-6
            .iphones.svg-icon(v-html='icons.iphones')
          .col-6.text-column
            h2 Level Up Anywhere
            p Our mobile apps make it simple to keep track of your tasks on-the-go. Accomplish your goals with a single tap, no matter where you are.
            a.app.svg-icon(v-html='icons.googlePlay', href='https://play.google.com/store/apps/details?id=com.habitrpg.android.habitica', target='_blank')
            a.app.svg-icon(v-html='icons.iosAppStore', href='https://itunes.apple.com/us/app/habitica-gamified-task-manager/id994882113?mt=8', target='_blank')
      .container-fluid
        .pixel-horizontal-3.svg-icon(v-html='icons.pixelHorizontal3')

    #call-to-action.purple-4
      .container.featured
        .row.text-center
          h3.col-12 Join over 2,000,000 people having fun while accomplishing their goals!
        .row
          .col-12.text-center
            button.btn.btn-primary(@click='playButtonClick()') Join Habitica Today
        .row.featured
          .col-12.text-center
            strong Featured in
      .container-fluid.featured
        .row
          .col-12
            img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/lifehacker.png', alt="$t(altAttrLifehacker)")
            img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/nyt-logo.png', alt="$t(altAttrNewYorkTimes)")
            img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/makeuseof.png', alt="$t(altAttrMakeUseOf)")
            img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/Forbes_logo.png', alt="$t(altAttrForbes)")
            .cnet.svg-icon(v-html='icons.cnet')
            .fast-company.svg-icon(v-html='icons.fastCompany')
            img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/kickstarter-logo.png', alt="$t(altAttrKickstarter)")
            img(src='https://d2afqr2xdmyzvu.cloudfront.net/front/images/presslogos/discover-logo.png', alt="$t(altAttrDiscover)")
      .container-fluid
        .seamless_stars_varied_opacity_repeat

    #purple-footer
      app-footer

    #bottom-wrap.purple-4
      #bottom-background
        .seamless_mountains_demo_repeat
        .midground_foreground_extended2
</template>

<style lang="scss">
  #purple-footer {
    background-color: #271b3d;

    footer, footer a {
      background: transparent;
      color: #d5c8ff;
    }

    .logo {
      color: #bda8ff;
    }

    .social-circle, .btn-donate {
      background: #36205d;
      color: #bda8ff;

      .svg-icon {
        color: #bda8ff;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @import '~client/assets/scss/static.scss';

  #front {
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
  }

  #intro-signup {
    background-image: url('~client/assets/svg/for-css/confetti.svg');
    margin-top: 4em;

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
      width: 206px;
      height: 40px;
      background: transparent;
      margin-right: .5em;
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

    input {
      margin-bottom: 1em;
      border-radius: 2px;
      background-color: #432874;
      border-color: #432874;
      color: $purple-400;
    }

    button.sign-up {
      width: 100%;
      height: 48px;
      color: #fff;
      border: none;
      border-radius: 2px;
      background-color: #2995cd;
      font-size: 16px;
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
      margin-top: 1em;
      margin-bottom: 1.5em;
    }

    .track-habits {
      margin-bottom: 2.5em;
    }

    strong {
      font-size: 20px;
    }
  }

  #use-cases {
    strong {
      font-size: 20px;
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

    .iphones {
      width: 436px
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

    .featured .row {
      margin-top: 0;
    }

    .featured {
      text-align: center;

      .svg-icon {
        max-height: 30px;
        max-width: 120px;
        color: #fff;
        display: inline-block;
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
        padding-top: .8em;
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
    }
  }

  #bottom-wrap {
    padding-top: 10em;
  }

  #bottom-background {
    position: relative;

    .seamless_mountains_demo_repeat {
      background-image: url('~assets/images/auth/seamless_mountains_demo.png');
      background-repeat: repeat-x;
      width: 100%;
      height: 500px;
      position: absolute;
      z-index: 0;
      bottom: 0;
    }

    .midground_foreground_extended2 {
      background-image: url('~assets/images/auth/midground_foreground_extended2.png');
      position: relative;
      width: 1500px;
      max-width: 100%;
      height: 150px;
      margin: 0 auto;
    }
  }
</style>

<script>
  import hello from 'hellojs';
  import AppFooter from 'client/components/appFooter';
  import StaticHeader from './header.vue';
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
  import * as Analytics from 'client/libs/analytics';

  export default {
    components: {
      AppFooter,
      StaticHeader,
    },
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
        }),
        userCount: 1000000,
        username: '',
        password: '',
        passwordConfirm: '',
        email: '',
      };
    },
    mounted () {
      Analytics.track({
        hitType: 'pageview',
        eventCategory: 'page',
        eventAction: 'landing page',
        page: '/home',
      });

      hello.init({
        facebook: process.env.FACEBOOK_KEY, // eslint-disable-line
        // windows: WINDOWS_CLIENT_ID,
        google: process.env.GOOGLE_CLIENT_ID, // eslint-disable-line
      });
    },
    methods: {
      async register () {
        if (this.password !== this.passwordConfirm) {
          alert('Passwords must match');
          return;
        }

        await this.$store.dispatch('auth:register', {
          username: this.username,
          email: this.email,
          password: this.password,
          passwordConfirm: this.passwordConfirm,
        });

        if (this.$store.state.afterLoginRedirect) {
          window.location.href = this.$store.state.afterLoginRedirect;
          return;
        }

        window.location.href = '/';
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
      async socialAuth (network) {
        const url = window.location.href;

        let auth = await hello(network).login({
          scope: 'email',
          // explicitly pass the redirect url or it might redirect to /home
          redirect_uri: url, // eslint-disable-line camelcase
        });

        await this.$store.dispatch('auth:socialAuth', {
          auth,
        });

        window.location.href = '/';
      },
    },
  };
</script>
