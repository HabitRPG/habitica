<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 10/13/2017 - GOLD-PURCHASABLE QUEST-LINE: THE MYSTERY OF THE MASTERCLASSERS
    hr
    .media
      .media-body
        h3 Mystery of the Masterclassers Quest Line
        p(v-markdown='"There\'s a new set of gold-purchasable quests available in the [Quest Shop](https://habitica.com/shops/quests): the Mystery of the Masterclassers Quest-Line! After some of Habitica\'s denizens are possessed by mysterious and malevolent objects, the four Masterclassers have come to you for aid in their quest to find and defeat the enigmatic foe behind these dire deeds. Can you help them save Habitica? If you can defeat the most powerful foe in the game so far, you\'ll earn the exclusive Aether Equipment Set... and a rare Mount like none other."')
      .quest_lostMasterclasser4.left-margin
    p The Mystery of the Masterclassers is the culmination of the story told in the gold-purchasable quests, so you need to complete all four of those previous quest-lines in order to unlock it. None of the gold-purchasable questlines are limited-edition, so you have plenty of time to save up!
    .small by SabreCat, Beffymaroo, and Lemoness
    .small Writing by Lemoness
    .small Art by AnnDeLune, Beffymaroo, Katy133, Tuqjoi, Kiwibot, stefalupagus, and tricksy.fox
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
