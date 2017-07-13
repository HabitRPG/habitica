<template lang='pug'>
.row
  .col-md-12
    .page-header
      h1 {{ $t('overview') }}
    p {{ $t('needTips') }}

    div(v-for='step in stepsNum')
      h3 {{ $t('step'+step) }}
      p
        //!=md.unsafeHTMLRender(env.t('webStep'+step+'Text'))
      hr
    //!=md.unsafeHTMLRender(env.t('overviewQuestions'))
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
