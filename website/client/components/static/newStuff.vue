<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 10/20/2017 - USE CASE SPOTLIGHT: CULTIVATING POSITIVITY
    hr
    h3 Use Case Spotlight on Positivity
    p(v-markdown='"This month\'s [Use Case Spotlight](https://habitica.wordpress.com/2017/10/17/use-case-spotlight-cultivating-positivity/) is about Cultivating Positivity! It features a number of great suggestions submitted by Habiticans in the [Use Case Spotlights Guild](https://habitica.com/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6). We hope it helps any of you who might be looking to build and maintain a more positive outlook!"')
    p Plus, we're collecting user submissions for the next spotlight! How do you use Habitica to manage Money Matters? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!
    .small by Beffymaroo
    .scene_positivity.center-block
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

  /* .small {
    margin-bottom: 1em;
  } */
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
