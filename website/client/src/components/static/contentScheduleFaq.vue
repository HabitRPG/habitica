<template>
  <div
    v-once
    class="top-container mx-auto"
  >
    <div class="main-text mr-4">
      <div class="title-details">
        <h1>{{ $t('contentFaqTitle') }}</h1>
      </div>
      <div class="body-text">
        <p>{{ $t('contentFaqPara0') }}</p>
        <p>{{ $t('contentFaqPara1') }}</p>
      </div>
      <h3>{{ $t('contentQuestion0') }}</h3>
      <ul>
        <li>{{ $t('contentAnswer00') }}</li>
        <li v-html="$t('contentAnswer01')"></li>
        <li v-html="$t('contentAnswer02')"></li>
        <li v-html="$t('contentAnswer03')"></li>
      </ul>
      <h3>{{ $t('contentQuestion1') }}</h3>
      <ul>
        <li>{{ $t('contentAnswer10') }}</li>
        <li>{{ $t('contentAnswer11') }}</li>
        <li>{{ $t('contentAnswer12') }}</li>
      </ul>
      <h3>{{ $t('contentQuestion2') }}</h3>
      <ul>
        <li>
          {{ $t('contentAnswer20') }}
          <ul>
            <li v-html="$t('contentAnswer200')"></li>
            <li v-html="$t('contentAnswer201')"></li>
            <li v-html="$t('contentAnswer202')"></li>
            <li v-html="$t('contentAnswer203')"></li>
          </ul>
        </li>
        <li>{{ $t('contentAnswer21') }}</li>
        <li>{{ $t('contentAnswer22') }}</li>
      </ul>
      <h3>{{ $t('contentQuestion3') }}</h3>
      <p>{{ $t('contentAnswer30') }}</p>
      <ul>
        <li v-html="$t('contentAnswer300')"></li>
        <li v-html="$t('contentAnswer301')"></li>
        <li v-html="$t('contentAnswer302')"></li>
        <li v-html="$t('contentAnswer303')"></li>
      </ul>
      <h3>{{ $t('contentQuestion4') }}</h3>
      <p>{{ $t('contentAnswer40') }}</p>
      <ul>
        <li>{{ $t('contentAnswer400') }}</li>
        <li>{{ $t('contentAnswer401') }}</li>
        <li>{{ $t('contentAnswer402') }}</li>
        <li>{{ $t('contentAnswer403') }}</li>
      </ul>
      <h3>{{ $t('contentAnswer41') }}</h3>
      <p>{{ $t('contentAnswer410') }}</p>
      <h3>{{ $t('contentQuestion5') }}</h3>
      <ul>
        <li>
          {{ $t('contentAnswer50') }}
          <ul>
            <li>{{ $t('backgrounds') }}</li>
            <li>{{ $t('contentAnswer501') }}</li>
            <li>{{ $t('contentAnswer502') }}</li>
            <li>{{ $t('shirts') }}</li>
          </ul>
        </li>
        <li>{{ $t('contentAnswer51') }}</li>
        <li>{{ $t('contentAnswer52') }}</li>
        <li>{{ $t('contentAnswer53') }}</li>
      </ul>
      <h3>{{ $t('contentQuestion6') }}</h3>
      <p>{{ $t('contentAnswer60') }}</p>
      <ul>
        <li>{{ $t('contentAnswer61') }}</li>
        <li>{{ $t('contentAnswer62') }}</li>
        <li>{{ $t('contentAnswer63') }}</li>
      </ul>
      <h3>{{ $t('contentQuestion7') }}</h3>
      <ul>
        <li>{{ $t('contentAnswer70') }}</li>
        <li>{{ $t('contentAnswer71') }}</li>
      </ul>
      <p
        v-html="$t('contentFaqPara3',
                   { mailto: '<a href=mailto:admin@habitica.com>admin@habitica.com</a>'}
        )"
      ></p>
    </div>
    <faq-sidebar />
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/faq.scss';
</style>

<script>
import FaqSidebar from '@/components/shared/faqSidebar';

export default {
  components: {
    FaqSidebar,
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('faq'),
      subSection: this.$t('contentReleaseChanges'),
    });
    document.body.style.background = '#ffffff';
  },
};
</script>
