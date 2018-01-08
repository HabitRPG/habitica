<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 1/2/2018 - JANUARY BACKGROUNDS AND ARMOIRE ITEMS, AND NEW TAKE THIS CHALLENGE
    hr
    .media
      .media-body
        h3 January Backgrounds and Armoire Items!
        p We’ve added three new backgrounds to the Background Shop! Now your avatar can drive a Sleigh, bask in the wintery glow of Auroras, and fly over Icy Steppes! Check them out under User Icon > Backgrounds!
        p Plus, there’s new gold-purchasable equipment in the Enchanted Armoire, including the Coach Driver Set. Better work hard on your real-life tasks to earn all the pieces! Enjoy :)
        .small by Katy133, weeWitch, denissa, Reesachan, Nummycakes, and Beffymaroo
        .media
          .promo_take_this.right-margin
          .media-body
            h3 New Take This Challenge!
            p(v-markdown='"The next Take This Challenge has launched, [Check Your HP!](/challenges/d9722bfb-f8f1-4801-9b40-2aa34ea85105), with a focus on monitoring your mood. Be sure to check it out to earn additional pieces of the Take This armor set and a chance at Gems!"')
        p(v-markdown='"[Take This](http://www.takethis.org/) is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness."')
      .promo_armoire_bgs_201801.left-margin
    p(v-markdown='"Congratulations to the winners of the last Take This Challenge, \'It\'s Dangerous to Go Alone!\': grand prize winner Acoustikarl, and runners-up Ximena18, Sunbeams90, Castrón, Adara McCLain, and Emily Torrey. Plus, all participants in that Challenge have received a piece of the [Take This item set](http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set), if they hadn\'t completed the set already. It is located in your Rewards column. Enjoy!"')
      .small by Doctor B, the Take This team, Lemoness, and SabreCat
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
