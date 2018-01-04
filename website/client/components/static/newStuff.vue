<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 1/4/2018 - WINTERY AVATAR CUSTOMIZATIONS AND NEW AUDIO THEMES
    hr
    .media
      .media-body
        h3 Wintery Skins and Hair Colors!
        p The Seasonal Edition Wintery Hair Colors are now available for purchase via the User Menu under "Edit Avatar"! Now you can dye your avatar's hair Snowy, Peppermint, Holly Green, Aurora, Winter Star, or Festive.
        p Plus, the Seasonal Edition Wintery Skins are available, too! You can complete your winter avatar look with Aurora, Dapper, Festive, Holly, Polar, Sugar, or Winter Star Skins.
        p Both of these Seasonal Edition customization sets will only be available to purchase until January 31st, after which they'll be gone until next year, so be sure to swoop them up now!
        .small by Lemoness and tricksy.fox
        h3 New Audio Themes!
        p(v-markdown='"There are two new audio themes available in [site settings](/user/settings/site): Pizilden\'s Theme and the MAFL Theme! Check them out to bring fresh sounds to your Habitica experience."')
        .small by Pizilden and MAFL
      .promo_winter_customizations.left-margin
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
