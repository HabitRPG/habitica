<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 10/2/2017 - SPOOKY SPARKLES, MOBILE UPDATES, AND BUG FIXES
    hr
    .media
      .media-body
        h3 Spooky Sparkles and Seasonal Shop
        p(v-markdown='"There\'s a new Gold-purchasable item in the Seasonal Shop: [Spooky Sparkles](/shops/seasonal)! Buy some and then cast it on your friends. I wonder what it will do?"')
        p If you have Spooky Sparkles cast on you, you will receive the "Alarming Friends" badge! Don't worry, any mysterious effects will wear off the next day.... or you can cancel them early by buying an Opaque Potion!
        p While you're at it, be sure to check out all the other items in the Seasonal Shop! There are lots of equipment items from the previous Fall Festivals. The Seasonal Shop will only be open until October 31st, so stock up now.
        .small by Lemoness and SabreCat
      .promo_spooky_sparkles
    h3 Updates to iOS and Android Apps!
    p(v-markdown='"There are exciting new updates to our [Android](https://play.google.com/store/apps/details?id=com.habitrpg.android.habitica&hl=en) and [iOS](https://itunes.apple.com/us/app/habitica-gamified-task-manager/id994882113?mt=8) apps! In both, we\'ve updated the design of the Shops and your Rewards column. Plus, now you can pin items you want from Shops to your Rewards column! We hope this makes upgrading your avatar and earning Rewards from your tasks even more motivating."')
    p Android users can also now reset their accounts via the app!
    p In the iOS app, we've also added improved VoiceOver support for better accessibility. We welcome your feedback on this feature via the in-app "Send Feedback" option.
    p We hope you enjoy the updates! Be sure to download them now for a better Habitica experience!
    p If you like the improvements that we’ve been making to our apps, please consider reviewing these new versions. It really helps us out!
    .small by viirus and piyorii
    .promo_login_screen.center-block
    h3 New Post-Update Bug Fixes!
    p Hello Habiticans! <3 We’ve released a big batch of bug fixes! Many thanks for your patience, and for taking the time to report these bugs. Some changes:
    ul
      li Due to concerns about accessibility and usability of the Tasks page, we’ve removed the scrollbars on the different Tasks columns.
      li Due to concerns about the skills bar being too large, we have released a new, more compact design! It should also now stay minimized once you’ve minimized it before, so that it won’t block your tasks all the time.
      li Now you no longer need to click “Apply Filters” – they take automatic effect when you check them and uncheck them! The dropdown also closes when you move your mouse away, to further reduce the clicking required.
      li Clicking “Scheduled” now correctly sorts your To-Dos by date
      li Creating a task while a filter is selected now defaults to being tagged with that filter!
      li Your Stables are now correctly configured so that the rows of pets and mounts don’t blend together on smaller screens!
      li You can now click directly on a Mount to equip it!
      li We’ve fixed a few bugs that were preventing some people from subscribing or buying gems, but some are remaining. Please be sure to report these in Report a Bug (linked below) and we will help you out ASAP!
      li You should now be able to remove tasks when you leave a Challenge!
      li You can edit Challenge Tags again!
      li We’ve fixed the confusing placement of the “Send” buttons in chat
      li We’ve fixed some style issues that were causing the Quests to occasionally look strange
      li When you edit a Guild, it will default to you as the leader
      li The "Members" label is now called the "Member list" to help clarify that you can click it to see all the members of a Party, Guild, or Challenge!
      li If you have a pending quest, you can now see which members have accepted before you start your quest.
      li When you complete a quest, the final reward popups are appearing again!
      li You can now edit Parties normally!
      li You can now correctly allocate your Stat points without needing to refresh the page!
      li If you opted out of choosing a class, it will no longer give you an unnecessary warning about costing 3 Gems.
      li You can no longer accidentally block yourself from your profile.
      li Mystic Hourglasses now only show in the header if you have more than one. (Thanks for subscribing!)
      li Markdown works in Challenge titles again!
      li You can now Clone Challenges again!
      li The Bailey news loads on the mobile apps again!
      li The red User ID notifications in the corner should be gone!
      li(v-markdown='"Chat performance should be better. (We’re still investigating to make it even better, so please let us know in the [Report a Bug Guild](https://habitica.com/groups/guild/a29da26b-37de-4a71-b0c6-48e72a900dac) if chat lag is still happening to you!)"')
    p(v-markdown='"Refresh the page to enjoy these fixes! If you’re still having trouble with them after refreshing the page, please let us know in the [Report a Bug Guild](https://habitica.com/groups/guild/a29da26b-37de-4a71-b0c6-48e72a900dac) and we will investigate :) If you have feedback about the update that is not related to bugs or immediate accessibility issues, we’re opening a public Trello card for these comments on October 5!"')
    p Thanks for being such a great community! It means a lot to us <3
    br
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/static.scss';
  .center-block {
    margin: 0 auto 1em auto;
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
