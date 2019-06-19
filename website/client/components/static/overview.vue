<template lang="pug">
.container-fluid.static-view
  .row
    .col-md-6.offset-3
      h1 {{ $t('overview') }}
      p {{ $t('needTips') }}
      div(v-for='step in stepsNum')
        h3 {{ $t('step'+step) }}
        p(v-markdown="$t('webStep'+step+'Text', stepVars[step])")
        hr
      p(v-markdown="$t('overviewQuestions', {faqUrl: '/static/faq/', helpGuildUrl: '/groups/guild/5481ccf3-5d2d-48a9-a871-70a7380cee5a'})")
</template>

<style lang='scss'>
@import '~client/assets/scss/static.scss';
</style>

<style lang='scss' scoped>
.container-fluid {
  margin-top: 56px;
}
</style>

<script>
import markdownDirective from 'client/directives/markdown';

export default {
  directives: {
    markdown: markdownDirective,
  },
  data () {
    return {
      stepsNum: ['1', '2', '3'],
      stepVars: {
        1: {},
        2: {},
        3: {
          partyUrl: '/party',
          equipUrl: '/inventory/equipment',
          shopUrl: '/shops/market',
        },
      },
    };
  },
};
</script>
