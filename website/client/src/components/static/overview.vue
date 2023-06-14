<template>
  <div class="container-fluid static-view">
    <div class="row">
      <div class="col-md-6 offset-3">
        <h1>{{ $t('overview') }}</h1>
        <p>{{ $t('needTips') }}</p>
        <div
          v-for="step in stepsNum"
          :key="step"
        >
          <h3>{{ $t(`step${step}`) }}</h3>
          <p v-markdown="$t(`webStep${step}Text`, stepVars[step])"></p>
          <hr>
        </div>
        <p
          v-markdown="$t('overviewQuestions', {
            faqUrl: '/static/faq/',
          })"
        ></p>
      </div>
    </div>
  </div>
</template>

<style lang='scss'>
@import '~@/assets/scss/static.scss';
</style>

<style lang='scss' scoped>
.container-fluid {
  margin-top: 56px;
}
</style>

<script>
import markdownDirective from '@/directives/markdown';

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
