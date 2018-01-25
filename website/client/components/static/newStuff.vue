<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 1/23/2018 - JANUARY SUBSCRIBER ITEMS, RESOLUTION PLOT-LINE, AND GUILDS FOR GOALS
    hr
    h3 January Subscriber Items Revealed!
    p(v-markdown='"The January Subscriber Item has been revealed: the Frost Sprite Item Set! You only have until January 31 to receive the item set when you [subscribe](/settings/subscription). If you\'re already an active subscriber, reload the site and then head to Inventory > Equipment to claim your gear!"')
    p Subscribers also receive the ability to buy gems for gold -- the longer you subscribe, the more gems you can buy per month! There are other perks as well, such as longer access to uncompressed data and a cute Jackalope pet. Best of all, subscriptions let us keep Habitica running. Thank you very much for your support -- it means a lot to us.
    .small by Beffymaroo
    .promo_mystery_201801.center-block
    h3 Resolution Plot-Line: An Overheard Conversation
    p As you stride through the streets of Habit City, you overhear a worried conference of whispers. Curious, you peek in to Productivity Plaza and discover Lemoness and Beffymaroo in solemn conversation.
    p "On one hand, there's always the risk of discouragement when the eagerness of a fresh New Year's resolution gives way to everyday difficulties," Lemoness is saying. "But that just doesn't seem to match these reports. Habiticans who were making real progress are abruptly giving up all their goals overnight."
    p "I agree," says Beffymaroo. "And look at these maps -- all the reports are happening in the exact same neighborhoods."
    p "Clustered discouragement, cropping up all over the city?" Lemoness shakes her head. "I won't tempt fate by calling it a coincidence. It's time to investigate."
    p Without further ado, both of them hurry away. What a strange conversation to overhear! Perhaps we'll learn more about this later....
    .media
      .media-body
        h3 New Goals for the New Year: Guilds for Setting (and Keeping) Realistic Goals
        p(v-markdown='"There\'s a new [Guild Spotlight on the blog](https://habitica.wordpress.com/2018/01/23/new-goals-for-the-new-year-guilds-for-setting-and-keeping-realistic-goals/) that highlights the Guilds that can help you as set new goals for 2018 and strive to stay on track! Check it out now to find Habitica\'s best goal-setting communities."')
        .small by Beffymaroo
      .scene_task_list.left-margin
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
