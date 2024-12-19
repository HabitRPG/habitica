<template>
  <div
    v-once
    class="top-container mx-auto"
  >
    <div class="main-text mr-4">
      <div class="title-details">
        <h1>{{ $t('subscriptionBenefitsFaqTitle') }}</h1>
      </div>
      <div class="body-text">
        <p>{{ $t('subscriptionPara0') }}</p>
        <p>{{ $t('contentFaqPara1') }}</p>
      </div>
      <h3>{{ $t('subscriptionHeading0') }}</h3>
      <p>{{ $t('subscriptionDetail00') }}</p>
      <ul>
        <li>{{ $t('subscriptionDetail000') }}</li>
        <li>{{ $t('subscriptionDetail001') }}</li>
        <li>{{ $t('subscriptionDetail002') }}</li>
        <li>{{ $t('subscriptionDetail003') }}</li>
      </ul>
      <p>{{ $t('subscriptionDetail01') }}</p>
      <ul>
        <li>{{ $t('subscriptionDetail010') }}</li>
        <li>{{ $t('subscriptionDetail011') }}</li>
        <li>{{ $t('subscriptionDetail012') }}</li>
      </ul>
      <h3>{{ $t('subscriptionHeading1') }}</h3>
      <p>{{ $t('subscriptionDetail10') }}</p>
      <ul>
        <li>{{ $t('subscriptionDetail100') }}</li>
        <li>{{ $t('subscriptionDetail101') }}</li>
        <li>{{ $t('subscriptionDetail102') }}</li>
      </ul>
      <p>{{ $t('subscriptionDetail11') }}</p>
      <ul>
        <li>{{ $t('subscriptionDetail110') }}</li>
      </ul>
      <h3>{{ $t('subscriptionHeading2') }}</h3>
      <ul>
        <li>{{ $t('subscriptionDetail20') }}</li>
        <li>{{ $t('subscriptionDetail21') }}</li>
        <li>{{ $t('subscriptionDetail22') }}</li>
        <li>{{ $t('subscriptionDetail23') }}</li>
        <li>{{ $t('subscriptionDetail24') }}</li>
        <li>{{ $t('subscriptionDetail25') }}</li>
      </ul>
      <h3>{{ $t('subscriptionHeading3') }}</h3>
      <p>{{ $t('subscriptionPara1') }}</p>
      <ul>
        <li>{{ $t('subscriptionDetail30') }}</li>
        <li>{{ $t('subscriptionDetail31') }}</li>
        <li>{{ $t('subscriptionDetail32') }}</li>
        <li>{{ $t('subscriptionDetail33') }}</li>
      </ul>
      <h3>{{ $t('commonQuestions') }}</h3>
      <h4>{{ $t('subscriptionDetail40')}}</h4>
      <p>{{ $t('subscriptionDetail400')}}</p>
      <h4>{{ $t('subscriptionDetail41')}}</h4>
      <p>{{ $t('subscriptionDetail410')}}</p>
      <h4>{{ $t('subscriptionDetail42')}}</h4>
      <p>{{ $t('subscriptionDetail420')}}</p>
      <h4>{{ $t('subscriptionDetail43')}}</h4>
      <p>{{ $t('subscriptionDetail430')}}</p>
      <h4>{{ $t('subscriptionDetail44')}}</h4>
      <p>{{ $t('subscriptionDetail440')}}</p>
      <ul>
        <li>{{ $t('subscriptionDetail4400', { initialNumber: 25, roundedNumber: 26 }) }}</li>
        <li>{{ $t('subscriptionDetail4400', { initialNumber: 35, roundedNumber: 36 }) }}</li>
        <li>{{ $t('subscriptionDetail4400', { initialNumber: 45, roundedNumber: 46 }) }}</li>
      </ul>
      <h4>{{ $t('subscriptionDetail45')}}</h4>
      <p>{{ $t('subscriptionDetail450')}}</p>
      <p>{{ $t('subscriptionDetail451')}}</p>
      <h4>{{ $t('subscriptionDetail46')}}</h4>
      <p>{{ $t('subscriptionDetail460')}}</p>
      <h4>{{ $t('subscriptionDetail47')}}</h4>
      <p>{{ $t('subscriptionDetail470')}}</p>
      <h4>{{ $t('subscriptionDetail48')}}</h4>
      <p>{{ $t('subscriptionDetail480')}}</p>
      <p
        v-html="$t('subscriptionPara2',
                   { mailto: '<a href=mailto:admin@habitica.com>admin@habitica.com</a>'}
        )"
      ></p>
      <p>{{ $t('subscriptionPara3') }}</p>
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
      subSection: this.$t('subscriptionBenefitsAdjustments'),
    });
    document.body.style.background = '#ffffff';
  },
};
</script>
