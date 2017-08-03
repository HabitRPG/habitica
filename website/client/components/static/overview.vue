<template lang="pug">
  .row
    .col-6.offset-3
      .page-header
        h1 {{ $t('overview') }}
      p {{ $t('needTips') }}

      div(v-for='step in stepsNum')
        h3 {{ $t('step'+step) }}
        p(v-markdown="$t('webStep'+step+'Text')")
        hr
        p(v-html="$t('overviewQuestions')")
</template>

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
