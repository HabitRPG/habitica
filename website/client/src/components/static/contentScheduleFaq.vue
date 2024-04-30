<template>
  <div v-once class="top-container mx-auto">
    <div class="main-text mr-4">
      <div class="title-details">
        <h1>{{ $t('contentFaqTitle') }}</h1>
      </div>
      <div class="body-text">
        <p>{{ $t('contentFaqPara0') }}</p>
        <p>{{ $t('contentFaqPara1') }}</p>
      </div>
      <ul>
        <li>
          {{ $t('contentQuestion0') }}
          <ul>
            <li>{{ $t('contentAnswer00') }}</li>
            <li v-html="$t('contentAnswer01')"></li>
            <li v-html="$t('contentAnswer02')"></li>
            <li v-html="$t('contentAnswer03')"></li>
          </ul>
        </li>
        <li>
          {{ $t('contentQuestion1') }}
          <ul>
            <li>{{ $t('contentAnswer10') }}</li>
            <li>{{ $t('contentAnswer11') }}</li>
            <li>{{ $t('contentAnswer12') }}</li>
          </ul>
        </li>
        <li>
          {{ $t('contentQuestion2') }}
          <ul>
            <li>{{ $t('contentAnswer20') }}
              <ul>
                <li>{{ $t('contentAnswer200') }}</li>
                <li>{{ $t('contentAnswer201') }}</li>
                <li>{{ $t('contentAnswer202') }}</li>
                <li>{{ $t('contentAnswer203') }}</li>
              </ul>
            </li>
            <li>{{ $t('contentAnswer21') }}</li>
            <li>{{ $t('contentAnswer22') }}</li>
          </ul>
        </li>
        <li>
          {{ $t('contentQuestion3') }}
          <ul>
            <li>{{ $t('contentAnswer30') }}
              <ul>
                <li>{{ $t('contentAnswer300') }}
                  <ul>
                    <li>{{ $t('contentAnswer3000') }}</li>
                  </ul>
                </li>
                <li>{{ $t('contentAnswer301') }}
                  <ul>
                    <li>{{ $t('contentAnswer3010') }}</li>
                  </ul>
                </li>
                <li>{{ $t('contentAnswer302') }}
                  <ul>
                    <li>{{ $t('contentAnswer3020') }}</li>
                  </ul>
                </li>
                <li>{{ $t('contentAnswer303') }}
                  <ul>
                    <li>{{ $t('contentAnswer3030') }}</li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          {{ $t('contentQuestion4') }}
          <ul>
            <li>{{ $t('contentAnswer40') }}
              <ul>
                <li>{{ $t('contentAnswer400') }}</li>
                <li>{{ $t('contentAnswer401') }}</li>
                <li>{{ $t('contentAnswer402') }}</li>
                <li>{{ $t('contentAnswer403') }}</li>
              </ul>
            </li>
            <li>{{ $t('contentAnswer41') }}
              <ul>
                <li>{{ $t('contentAnswer410') }}</li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          {{ $t('contentQuestion5') }}
          <ul>
            <li>{{ $t('contentAnswer50') }}
              <ul>
                <li>{{ $t('backgrounds') }}</li>
                <li>{{ $t('contentAnswer501') }}</li>
                <li>{{ $t('contentAnswer502') }}</li>
                <li>{{ $t('shirts') }}</li>
              </ul>
            </li>
            <li>{{ $t('contentAnswer51') }}
              <ul>
                <li>{{ $t('contentAnswer510') }}</li>
              </ul>
            </li>
            <li>{{ $t('contentAnswer52') }}</li>
          </ul>
        </li>
        <li>
          {{ $t('contentQuestion6') }}
          <ul>
            <li>{{ $t('contentAnswer60') }}</li>
            <li>{{ $t('contentAnswer61') }}</li>
            <li>{{ $t('contentAnswer62') }}</li>
            <li>{{ $t('contentAnswer63') }}</li>
          </ul>
        </li>
        <li>
          {{ $t('contentQuestion7') }}
          <ul>
            <li>{{ $t('contentAnswer70') }}</li>
            <li>{{ $t('contentAnswer71') }}</li>
          </ul>
        </li>
      </ul>
      <p v-html="$t('contentFaqPara3',
        { mailto: '<a href=mailto:admin@habitica.com>admin@habitica.com</a>'}
      )"></p>
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
