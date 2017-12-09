<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 12/5/2017 - ARMOIRE ITEMS, BACKGROUNDS, AND TAKE THIS CHALLENGE
    hr
    .media
      .media-body
        h3 December Backgrounds and Armoire Items!
        p We’ve added three new backgrounds to the Background Shop! Now your avatar can admire a Starry Winter Night, bask in the wonder of a Toymaker's Workshop, and glide along a Cross-Country Ski Trail. You can find them under User Icon > Backgrounds!
        p Plus, there’s new gold-purchasable equipment in the Enchanted Armoire, including the Lamp-Lighter Set. Better work hard on your real-life tasks to earn all the pieces! Enjoy :)
        .small by Vampitch, AnnDeLune, CitrineSun, and Hachiseiko
        h3 Take This Challenge for December
        p(v-markdown='"The next Take This Challenge has launched, [It\'s Dangerous to Go Alone!](https://habitica.com/challenges/5f70ce5b-2d82-4114-8e44-ca65615aae62), with a focus on maintaining offline relationships. Be sure to check it out to earn additional pieces of the Take This armor set!"')
        p(v-markdown='"[Take This](http://www.takethis.org/) is a nonprofit that seeks to inform the gamer community about mental health issues, to provide education about mental disorders and mental illness prevention, and to reduce the stigma of mental illness."')
      .promo_armoire_backgrounds_201712.left-margin
    p(v-markdown='"Congratulations to the winners of the last Take This Challenge, \'Notice Me, Senpai!\': grand prize winner M T, and runners-up Trompadour, Eule, mizuki_F, PhiaFox, and Dragon. Plus, all participants in that Challenge have received a piece of the [Take This item set](http://habitica.wikia.com/wiki/Event_Item_Sequences#Take_This_Armor_Set) if they hadn\'t collected all the pieces already. It is located in your Rewards column. Enjoy!"')
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
