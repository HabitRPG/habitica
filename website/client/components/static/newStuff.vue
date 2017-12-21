<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 12/19/2017 - WINTER WONDERLAND BEGINS! WINTER CLASS OUTFITS, SEASONAL SHOP, NPC DECORATIONS, AND MAGIC HATCHING POTIONS
    hr
    p A wintery breeze is blowing in from the Stoïkalm Steppes, and the snow is gently drifting down over Habit City. The Winter Wonderland event has begun!
    .media
      .promo_winter_wonderland_2018.right-margin.bottom-margin
      .media-body
        h3 Winter Class Outfits
        p From now until January 31st, limited edition outfits are available in the Rewards column. Depending on your class, you can be a Confetti Mage, a Mistletoe Healer, a Reindeer Rogue, or a Gift-Wrapped Warrior! You'd better get productive to earn enough gold before they disappear. Good luck!
        .small by AnnDeLune, Vikte, weeWitch, Katy133, and Beffymaroo
        .media
          .media-body
            h3 Seasonal Shop is Open!
            p(v-markdown='"The [Seasonal Shop](https://habitica.com/shops/seasonal) has opened! The Seasonal Sorceress is stocking the seasonal edition versions of previous winter outfits, now available for gems instead of gold. Plus, there will be more fun things in the shop as the event progresses.The Seasonal Shop will only be open until January 31st, so don\'t wait!"')
            .small by SabreCat and Lemoness
          .promo_winter_seasonal_shop.left-margin
        .media
          .media-body
            h3 NPC Costumes
            p Looks like the NPCs are really getting in to the cheery winter mood around the site. Who wouldn't? After all, there's plenty more celebration to come....
            .small by Lemoness
          .promo_winter_tavern.left-margin
    h3 Starry Night and Holly Hatching Potions
    p(v-markdown='"There\'s a new pet breed in town! Between now and January 31st, you can buy Holly Hatching Potions and brand-new Starry Night Hatching Potions from [the Market](https://habitica.com/shops/market) and use them to hatch any standard pet egg. (Magic Hatching Potions do not work on Quest Pet eggs.)"')
    p After they're gone, it will be at least a year before the Starry Night and Peppermint Hatching Potions are available again, so be sure to get them now!
    .small by Vampitch, JinjooHat, Lemoness, and SabreCat
    .promo_starry_potions.center-block
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
