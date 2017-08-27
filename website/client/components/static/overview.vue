<template lang="pug">
  div
    static-header
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
    app-footer
</template>

<style lang='scss' scoped>
  @import '~client/assets/scss/static.scss';

  .container-fluid {
    margin-top: 56px;
  }
</style>

<script>
  import AppFooter from 'client/components/appFooter';
  import StaticHeader from './header.vue';
  import markdownDirective from 'client/directives/markdown';

  export default {
    components: {
      AppFooter,
      StaticHeader,
    },
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
