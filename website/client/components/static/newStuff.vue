<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 1/12/2018 - HABITICA BLOGS: USE CASE SPOTLIGHT AND BEHIND THE SCENES
    .media
      .scene_task_list.right-margin
      .media-body
        h3 Use Case Spotlight: Setting Realistic Goals
        p(v-markdown='"This month\'s [Use Case Spotlight](https://habitica.wordpress.com/2018/01/09/use-case-spotlight-setting-realistic-goals/) is about Setting Realistic Goals! It features a number of great suggestions submitted by Habiticans in the [Use Case Spotlights Guild](/groups/guild/1d3a10bf-60aa-4806-a38b-82d1084a59e6). We hope it helps any of you who might be making resolutions or setting new goals for 2018."')
        p Plus, we're collecting user submissions for the next spotlight! How do you use Habitica to help manage and improve your Interpersonal Relationships? We’ll be featuring player-submitted examples in Use Case Spotlights on the Habitica Blog next month, so post your suggestions in the Use Case Spotlight Guild now. We look forward to learning more about how you use Habitica to improve your life and get things done!
        .small by Beffymaroo
    h3 Behind the Scenes: Lady Glaciate
    p(v-markdown='"Have you ever wanted to know more about Lady Glaciate, the Master of Warriors? [Today\'s blog post](https://habitica.wordpress.com/2018/01/12/behind-the-scenes-lady-glaciate/) features a spotlight on the tough and determined guardian of the Stoïkalm Steppes! Check it out now to learn about her rise to power, her interests and hobbies, and to hear her take on the rumors about her relationship with the Master of Rogues, the April Fool!"')
    .small by Lemoness
    .scene_lady_glaciate.center-block
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
