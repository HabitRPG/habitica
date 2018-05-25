<template lang="pug">
.container-fluid
  .row
    .col-md-6.offset-3
      h1 {{ $t('overview') }}
      p {{ $t('needTips') }}
      div(v-for='step in stepsNum')
        h3 {{ $t('step'+step) }}
        p(v-markdown="$t('webStep'+step+'Text')")
        hr
      p(v-markdown="$t('overviewQuestions')")
</template>

<style lang='scss' scoped>
@import '~client/assets/scss/static.scss';

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
    };
  },
};
</script>
