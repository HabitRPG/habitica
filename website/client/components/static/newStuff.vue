<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 1/18/2018 - iOS UPDATE, WIKI WEDNESDAY, AND NEW AUDIO THEMES
    .media
      .promo_ios.right-margin
      .media-body
        h3 iOS App Update!
        p(v-markdown='"We\'ve released a [new iOS update!](https://itunes.apple.com/us/app/habitica-gamified-taskmanager/id994882113?mt=8) In this update, we\'ve added new features including the ability to allocate stat points, fix character values, and make account changes from within the app. We\'ve also smashed a number of pesky bugs, including the issues with inbox messaging, crashes when opening subscriber gear, and even the notorious task-ordering bug!"')
        p We hope you enjoy the update. Be sure to download it now for a better Habitica experience!
        p If you like the improvements that we’ve been making to our app, please consider reviewing this new version. It really helps us out! Old reviews get hidden with each update, but if you go to the review section you can re-post them again with a single tap.
        .small by Viirus and piyorii
    .media
      .media-body
        h3 Blog Post: S.M.A.R.T. Goal Setting
        p(v-markdown='"This month\'s [featured Wiki article](https://habitica.wordpress.com/2018/01/17/smart-goal-setting/) is about the SMART goal setting method! We hope that it will help you as strive to set achievable goals for the new year and beyond. Be sure to check it out, and let us know what you think by reaching out on [Twitter](https://twitter.com/habitica), [Tumblr](http://blog.habitrpg.com), and [Facebook](https://facebook.com/habitica)."')
        .small by Beffymaroo and the Wiki Wizards
      .scene_setting_up_todos
    h3 New Audio Themes!
    p(v-markdown='"There are three new audio themes available in [site settings](/user/settings/site): the Farvoid Theme, SpacePenguin\'s Theme, and the Lunasol Theme! Check them out to bring fresh sounds to your Habitica experience."')
    .small by Airu, SpacePenguin95, Pizilden, and Accio Books!
    hr
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/static.scss';
  .center-block {
    margin: 0 auto 1em auto;
  }

  .left-margin {
    margin-left: 1em;
  }

  .right-margin {
    margin-right: 1em;
  }

  .bottom-margin {
    margin-bottom: 1em;
  }

  .small {
    margin-bottom: 1em;
  }
</style>

<script>
  import markdown from 'client/directives/markdown';

  export default {
    data () {
      let worldDmg = {
        bailey: false,
      };

      return {
        baileyClass: {
          'npc_bailey_broken': worldDmg.bailey, // eslint-disable-line
          'npc_bailey': !worldDmg.bailey, // eslint-disable-line
        },
      };
    },
    directives: {
      markdown,
    },
  };
</script>
