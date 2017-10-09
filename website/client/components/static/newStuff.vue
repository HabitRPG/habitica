<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 10/5/2017 - OCTOBER BACKGROUNDS AND ARMOIRE ITEMS, REDESIGN FIXES AND FEEDBACK, TAKE THIS CHALLENGE, LAST CHANCE FOR SORCERY STUDENT SET AND FARM FRIENDS BUNDLE
    hr
    .media
      .promo_armoire_backgrounds_201710.right-margin
      .media-body
        h3 October Backgrounds and Armoire Items!
        p We’ve added three new backgrounds to the avatar shop! Now your avatar can tiptoe through the Tar Pits, sneak down the hall of a Spooky Hotel, and bask in the glow of Magical Candles.
        p Plus, there’s new gold-purchasable equipment in the Enchanted Armoire, including the Candlemaker Set. Better work hard on your real-life tasks to earn all the pieces! Enjoy :)
        .small by jordanzimmerman, nekoatsumelarper, vampitch, reesa3, Chimera Liani, and mewrose
        h3 Bug Fixes Keep Coming!
        p Hello Habiticans! <3 We’ve released another batch of bug fixes! Thank you all again for your reports:
        ul
          li We've fixed the issue preventing checklists from being collapsible!
          li We fixed the bug where some users who reached 0 health would get their health bar stuck there without refiling.
          li You can now upgrade Guilds into Group Plans using Stripe!
          li We fixed issues with the Bailey announcement refusing to scroll if it coincided with multiple pop-ups.
    ul
      li We fixed some bugs preventing users from subscribing with Amazon.
      li We've prevented you from opening someone's profile if their user avatar wasn't fully loaded (resulting in the wrong profile being displayed).
      li All Quick Inventory bars now remember whether or not you minimized them, and remain in that state even when you navigate away or refresh.
      li We prevented the filter menu from accidentally closing if you're in edit mode.
      li Pop-ups no longer interrupt the Record Yesterday's Activity modal.
      li The loading bar is back when you take an action on the site!
      li Now when you buy anything in one of the shops, the confirmation popup doesn't return for the rest of your session.
      li The Group Billing tab has returned to Group Plans!
      li Users with many To-dos are able to check off the final To-do in their list again.
      li We fixed the bugs where the Enchanted Armoire sometimes wouldn't correctly report what you had received.
      li The Enchanted Armoire now tells you how much experience you received.
      li If you already own the Bat-tle Rogue set, Spooky Sparkles are now the featured item in the Seasonal Shop.
      li Opaque potions and other transformation item cures are now available in the Rewards column again!
      li The Enchanted Armoire and Health Potions are now purchased with a single click, not needing a popup.
      li Brutal Smash and other task-targeting skills can no longer accidentally check off tasks.
      li Now if you make your screen very small, it does not prevent you from accessing all the navigation items.
      li We fixed the issue with the limited identifier being cut off on the Rewards column when an item was located in the top row.
      li We've fixed the bug preventing the number of notifications from displaying!
      li Transformation items now take effect immediately, without having to refresh the page.
      li You can now use emoji and other Markdown in Challenge titles again.
      li Equipment items that don't belong to any specific class can now be found in the Market under Equipment > Class > None.
    p(v-markdown='"Refresh the page to see these fixes! If you\'re still encountering these issues after a refresh, head to the [Report a Bug Guild](/groups/guild/a29da26b-37de-4a71-b0c6-48e72a900dac) and we will investigate. Thanks for being part of Habitica!"')
    h3 Redesign Feedback Form Available
    p(v-markdown='"Now that the new Habitica redesign has been out for a week and we\'ve had some time to fix some of the bugs, we wanted to open up a channel for your feedback. Please note that some pending features (like the ability to add tasks above each column, the sync button, push to top/bottom, and the ability to batch-add tasks) are still being built, and our team is still working hard to fix bugs. To see if your concerns are already being addressed, be sure to check out the [Redesign FAQ](http://habitica.wikia.com/wiki/Habitica_Redesign_FAQ) and the [Known Bugs List](http://habitica.wikia.com/wiki/Habitica_Redesign:_Known_Bugs)!"')
    p(v-markdown='"Although originally we planned to collect feedback via Trello, we heard some concerns from the community that this would be difficult because it would require people to sign up for additional accounts. For that reason, we\'ve decided to collect feedback via [a Google form](https://docs.google.com/forms/d/e/1FAIpQLScpeCeoTbmNPotBvEWtAFeVlD6g83KEN_YlwD_GHB4yHJbZww/viewform). We hope that this makes it easier to tell us what you think! We\'re eager to get your input so that we can work to make Habitica the best that it can be."')
    p We are a very small team, and for many of us, Habitica is a labor of love. Thank you all very much for your patience and for your support during this time of transition -- it means the world to us.
    .media
      .promo_takeThis_gear.right-margin
      .media-body
        h3 New Take This Challenge
        p(v-markdown='"The next Take This Challenge has launched, [Multiplayer Co-Op Exercise!](/challenges/e577f6bd-59af-4f89-b011-44767527ee92), with a focus on working out with a partner. Be sure to check it out to earn additional pieces of the Take This armor set!"')
    p(v-markdown='"[Take This](http://www.takethis.org/) is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness."')
    p(v-markdown='"Congratulations to the winners of the last Take This Challenge, “Hero\'s Triumph!”: grand prize winner David Rule, and runners-up José Barata Gonçalves, Ar_tem, Ziggy, schooler, and Ayano. Plus, all participants in that Challenge have received a piece of the [Take This item set](http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set) if they hadn\'t completed the set already. It is located in the [Market](/shops/market) under Class \> None. Enjoy!"')
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
