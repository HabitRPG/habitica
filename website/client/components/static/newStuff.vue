<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 11/14/2017 - NEW PET QUEST, BEHIND THE SCENES, AND FEATURED WIKI ARTICLE
    hr
    h3 New Pet Quest: A Tangled Yarn
    p(v-markdown='"Wayward yarn from unfinished craft projects is spreading confusion through the Taskan countryside! Can you wrap up this tangled mess? Get the latest pet quest, [A Tangled Yarn](/shops/quests), and earn some woolen Yarn pets by completing your real-life tasks."')
    .media
      .media-body
        .small by SabreCat, Faelwyn the Rising Phoenix, Bartelmy, Arcosine, stefalupagus, khdarkwolf, JinjooHat, basekick, Hacheiseiko, TheMushroomKing and Vampitch
        h3 Behind the Scenes: Tips for Burnout Prevention and Recovery from the Habitica Team!
        p(v-markdown='"There\'s a new [Behind the Scenes post](https://habitica.wordpress.com/2017/11/14/behind-the-scenes-tips-for-burnout-prevention-and-recovery-from-the-habitica-team/) on the Habitica blog in which the team shares their tips for preventing burnout and bouncing back when it happens! Check it out for great ideas for self-care and recuperation!"')
        .small by Beffymaroo
      .quest_burnout
    .media
      .scene_habit_cycle
      .media-body
        h3 Blog Post: The Habit Loop
        p(v-markdown='"This month\'s [featured Wiki article](https://habitica.wordpress.com/2017/11/08/the-habit-loop/) is about The Habit Loop! We hope that it will help you as you work on building better, stronger, and healthier Habits. Be sure to check it out, and let us know what you think by reaching out on [Twitter](https://twitter.com/habitica), [Tumblr](http://blog.habitrpg.com/), and [Facebook](https://www.facebook.com/Habitica/)."')
        .small by Beffymaroo and the Wiki Wizards
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
