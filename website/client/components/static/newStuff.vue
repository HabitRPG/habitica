<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 10/26/2017 - BEHIND THE SCENES: THE JOYFUL REAPER
    hr
    .media
      .media-body
        h3 Behind the Scenes Blog Post: The Joyful Reaper
        p(v-markdown='"Have you ever wanted to know more about the Joyful Reaper, the Master of Healers? [Today\'s blog post](https://habitica.wordpress.com/2017/10/26/behind-the-scenes-spotlight-on-the-joyful-reaper/) features a spotlight on the guardian of the Flourishing Fields! Check it out now to learn about her masterful healer skills, as well as an explanation of some of Habitica\'s quirks."')
        .small by Lemoness
      .npc_joyful_reaper
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
