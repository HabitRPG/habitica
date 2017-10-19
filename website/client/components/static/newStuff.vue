<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 10/16/2017 - TASK PAGE UPDATES AND FINAL MASTERCLASSER QUEST LINE
    hr
    h3 Requested Updates to Task Page
    p(v-markdown='"We\'re happy to announce that we\'ve pushed some of the most-requested updates from our [feedback form](https://docs.google.com/forms/d/e/1FAIpQLScpeCeoTbmNPotBvEWtAFeVlD6g83KEN_YlwD_GHB4yHJbZww/viewform): the return of quick-add tasks above each column, a more compact header and task page footer, and the ability to refresh the page using the new sync button in the upper-right! Thank you very much to everyone who left us thoughtful comments. We\'re still working on implementing some of the advanced options like push to top/bottom, the ability to batch-add tasks, and manual task attribute allocation, but you\'ll be seeing them soon."')
    p We know that this has been a disruptive experience for many of you, and we're very sorry about that. This was a much tougher rollout than we anticipated, and we've been so grateful for your patience, your thoughtful feedback, and your supportive messages. Our small team has been working nights and weekends since July to bring you the upgrade and fix the bugs that resulted, but we only have two full-time web developers and a small handful of part-timers, so things don't always move as quickly as we'd like. It's been beyond exhausting, but we are determined to get everything running smoothly again.
    p The good news is that a large part of this redesign was rewriting the entirety of the front-end code from scratch, so we've managed to completely get rid of the outdated, cobbled-together code that was preventing us from adding new features or quickly fixing bugs. Being trapped between the old and new code was particularly rough for us, because it meant that all our development was frozen and we were cut off from our awesome open-source contributors. Now that we've launched, we're able to actually move forward without being paralyzed by the constraints of the old site. Our new design has also enabled us to build a foundation for features that people have been requesting from the beginning, like batch-buying items, new Group Plan upgrades, quest enhancements, and more. This has been a tough time of transition, but we can't wait to show you everything that we have planned.
    p(v-markdown='"Thank you again for sticking with us -- and if you have feedback about the redesign, please let us know via our [feedback form](https://docs.google.com/forms/d/e/1FAIpQLScpeCeoTbmNPotBvEWtAFeVlD6g83KEN_YlwD_GHB4yHJbZww/viewform)! We\'ve been reading every single comment that you send in and incorporating your requests into our roadmap going forward. We\'re incredibly lucky to have such passionate users -- you guys mean the world to us."')
    p Look out for more updates soon!
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
