<template lang='pug'>
  div
    .media
      .promo_starry_potions.right-margin
      .media-body
        .media
          .align-self-center.right-margin(:class='baileyClass')
          .media-body
            h1.align-self-center(v-markdown='$t("newStuff")')
            h2 1/31/2018 - LAST CHANCE FOR WINTER WONDERLAND OUTFITS, WINTER CUSTOMIZATIONS, AND SNOWBALLS
        hr
        p(v-markdown='"Today is the final day of the Winter Wonderland Festival, so if you still have any remaining Winter Wonderland Items that you want to buy, you\'d better do it now! The [Seasonal Edition items](/shops/seasonal) and avatar customizations won\'t be back until next December, and if the Limited Edition items return they will have increased prices or changed art, so be sure to snag them today!"')
      .promo_winter_customizations.left-margin
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
