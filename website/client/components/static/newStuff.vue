<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 10/10/2017 - SUPERNATURAL SKINS, HAUNTED HAIR COLORS, WITCHY FAMILIARS QUEST BUNDLE, AND GOALS WIKI
    hr
    .media
      .promo_fall_customizations.right-margin
      .media-body
        h3 Supernatural Skins and Haunted Hair Colors
        p The Seasonal Edition Haunted Hair Colors are now available for purchase in the avatar customizations shop! Now you can dye your avatar's hair Pumpkin, Midnight, Candy Corn, Ghost White, Zombie, or Halloween. Get them before October 31st!
        .media
          .media-body
            p The Supernatural Skin Set is also available until October 31st! Now your avatar can become an Ogre, Skeleton, Pumpkin, Candy Corn, Reptile, or Dread Shade.
            p Seasonal Edition items recur unchanged every year, but they are only available to purchase during a short period of time. Get them now, or you'll have to wait until next year!
            .small by Lemoness, mariahm, and crystal phoenix
            h3 Witchy Familiars Quest Bundle
            p If you are looking to add some pets to your Habitica stable in to match your Fall Festival gear, you're in luck! From now until October 31, you can purchase the Witchy Familiars Pet Quest Bundle and receive the Rat, Spider, and Frog quests, all for only 7 Gems! That's a discount of 5 Gems from the price of purchasing them separately. Check it out in the <a href='/shops/quests'>Quest Shop</a> today!
            .small by Lemoness and SabreCat
            .small Art by Pandah, UncommonCriminal, Arcosine, starsystemic, RosemonkeyCT, Jon Arjinborn, and Breadstrings
            .small Writing by Token, Arcosine, and Fluitare
          .promo_bundle_witchyFamiliars.left-margin
    br
    p If rats and/or spiders are something you'd prefer not to see in Habitica due to a phobia, check out the <a href='http://habitica.wikia.com/wiki/Phobia_Protection_Extension' target='_blank'>Phobia Protection Extension</a> which will hide any pets, mounts, backgrounds, quest bosses, or equipment featuring rats and/or spiders (as well as snakes, bees, zombies, skeletons, or any combination thereof). We hope that it helps make everyone's Habitica experience fun!
    .media
      .scene_raking_leaves.right-margin
      .media-body
        h3 Blog Post: Dealing with Variable Goals
        p(v-markdown='"This month\'s [featured Wiki article](https://habitica.wordpress.com/2017/10/04/dealing-with-variable-goals/) is about Dealing with Variable Goals! We hope that it will help you as you add tasks with irregular deadlines to your lists. Be sure to check it out, and let us know what you think by reaching out on [Twitter](https://twitter.com/habitica), [Tumblr](http://blog.habitrpg.com/), and [Facebook](https://www.facebook.com/Habitica/)."')
        .small by Beffymaroo and the Wiki Wizards
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

  .small ~ .small {
    margin-bottom: 0;
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
