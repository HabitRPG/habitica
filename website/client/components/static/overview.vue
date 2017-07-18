<template lang="pug">
  .row
    .col-6.offset-3
      .page-header
        h1 {{ $t('overview') }}
      p {{ $t('needTips') }}

      div(v-for='step in stepsNum')
        h3 {{ $t('step'+step) }}
        // @TODO: add markdown
        p(v-html="$t('webStep'+step+'Text')")
        hr
        p(v-html="$t('overviewQuestions')")
</template>

<script>
export default {
  data () {
    return {
      stepsNum: ['1', '2', '3'],
    };
  },
};
</script>
