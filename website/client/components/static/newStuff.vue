<template lang='pug'>
  div
    .media
      .align-self-center.right-margin(:class='baileyClass')
      .media-body
        h1.align-self-center(v-markdown='$t("newStuff")')
    h2 12/12/2017 - BATTLE FOR THE NET: HELP PROTECT HABITICA
    hr
    .scene_bug.center-block
    p What would you do if you couldn't access your favorite websites, including Habitica, without paying an exorbitant amount to your internet service provider? In the United States, where Habitica is based, that is now a very real danger.
    p The USA's Federal Communications Commission (FCC) is about to vote on its plan to kill net neutrality, which will let internet service providers charge extra fees, throttle internet speeds, and block access to websites like this one. This could kill a small company like Habitica.
    p.strong Congress can stop them, but only if US citizens flood them with calls right now, asking them to defend net neutrality by stopping the FCC's vote BEFORE December 14th. Help keep Habitica free to access for everybody!
    p(v-markdown='"**US Habiticans can call Congress using the phone numbers found [here](https://www.callmycongress.com). You can also learn more at https://www.battleforthenet.com.** Non-US Habiticans can still help us by spreading the word."')
    p Thank you for helping protect Habitica.
    p Warmly,
    p Vicky, Leslie, Sabe, Phillip, Matteo, Keith, and Beth
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
