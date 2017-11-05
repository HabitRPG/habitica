<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 11/2/2017 - BATCH ADD, PUSH TO TOP/BOTTOM, AND COUNTERS FOR TASKS; NEW BACKGROUNDS AND ARMOIRE ITEMS; NEW TAKE THIS CHALLENGE
    hr
    .media
      .media-body
        h3 Task Features: Batch Add, Push to Top, Push to Bottom, and List Counters
        p There are some new features on the website task page!
        p Want to add multiple tasks at a time? Now you can type more than one task in the quick-add sections above the tasks and add them all at once! Just separate them by Shift-Enter, and then when you click Enter, they'll all be added at the same time.
      .promo_batch_tasks
    .media
      .media-body
        p Plus, now when hovering over a task, three dots appear in the corner. Click them for a quick-dropdown menu that includes a faster way to delete tasks and the ability to instantly push a task to the top or bottom of the list!
        p Finally, the website now has our popular task counters from mobile, which tell you how many actionable Dailies + To-Dos you're currently viewing! Want to see how many Scheduled To-Dos are on your plate, or how many "Morning" Dailies you have in that filter? The purple number at the top of the column will tell you!
        p We hope that you enjoy these updates!
        .small by paglias and Apollo
      .promo_push_top_bottom
    .media
      .promo_armoire_backgrounds_201711.right-margin
      .media-body
        h3 November Backgrounds and Armoire Items!
        p We’ve added three new backgrounds! Now your avatar can spin thread in a Fiber Arts Room, stroll by the Midnight Castle, and fly through a Tornado! Find them in User Icon > Backgrounds!
        p Plus, there’s new gold-purchasable equipment in the Enchanted Armoire, including the Weaver Set. Better work hard on your real-life tasks to earn all the pieces! Enjoy :)
        .small by AnnDeLune, Katy133, Chum Bucket, Vampitch, and RandomGryffindor
        .media
          .media-body
            h3 New Take This Challenge!
            p(v-markdown='"The next Take This Challenge has launched, [Notice Me, Senpai!](/challenges/e2816060-cb5c-46b3-9763-adf2ea20a72b), with a focus on reaching out to others in times of difficulty. Be sure to check it out to earn additional pieces of the Take This armor set!"')
          .promo_take_this
        p(v-markdown='"[Take This](http://www.takethis.org/) is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness."')
    p(v-markdown='"Congratulations to the winners of the last Take This Challenge, _Multiplayer Co-Op Exercise_: grand prize winner antfrommagicant, and runners-up Dalton Galke, FearMyPaintBrush, Silverilly, VulcanGopher1, and Salamander. Plus, all participants in that Challenge have received a piece of the [Take This item set](http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set) if they hadn\'t completed the set already. It is located in your Rewards column. Enjoy!"')
    .small by Doctor B, the Take This team, Lemoness, and SabreCat
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
