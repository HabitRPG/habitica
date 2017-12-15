<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 12/13/2017 - BLOG POST: THE HABITICA PLANNER
    hr
    p(v-markdown='"This month\'s [featured Wiki article](https://habitica.wordpress.com/2017/12/13/the-habitica-planner/) is about the Habitica Planner! We hope that it will help you as you find new ways to use Habitica for your task-management needs! Be sure to check it out, and let us know what you think by reaching out on [Twitter](https://twitter.com/habitica), [Tumblr](http://blog.habitrpg.com), and [Facebook](https://facebook.com/habitica)."')
    .small by Beffymaroo and the Wiki Wizards
    .scene_calendar.center-block
    br
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
