<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 11/7/2017 - THUNDERSTORM HATCHING POTIONS AND COSTUME CHALLENGE AWARDS
    hr
    .media
      .media-body
        h3 Thunderstorm Hatching Potions
        p(v-markdown='"There\'s a new pet breed in town! Between now and November 30th, you can buy Thunderstorm Hatching Potions from [the Market](/shops/market) and use them to hatch any standard pet egg. (Magic Hatching Potions do not work on Quest Pet eggs.) Thunderstorm Potion Pets aren\'t picky, so they\'ll happily eat any kind of food that you feed them!"')
        p After they're gone, it will be at least a year before the Thunderstorm Hatching Potions are available again, so be sure to get them now!
        .small by Balduranne and SabreCat
        h3 Costume Challenge Awarded
        p(v-markdown='"Congratulations to everyone who completed this year\'s costume Challenge! If your entry followed the rules, you\'ve been awarded your badge (or had your badge count increased). (If you have any issues, email admin@habitica.com and we will investigate for you). We\'ll be sharing some of our favorites to our [Tumblr](http://blog.habitrpg.com/), so be sure to follow us to see all the great entries!"')
        .small by Lemoness, SabreCat, and Beffymaroo
      .promo_potions_thunderstorm
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
