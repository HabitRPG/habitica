<template>
  <div class="top-container mx-auto">
    <div class="main-text mr-4">
      <!-- title goes here -->
      <div class="title-details">
        <h1 v-once>
          {{ $t('sunsetFaqTitle') }}
        </h1>
      </div>
      <div class="body-text">
        <p v-html="$t('sunsetFaqPara1')"></p>
        <p>{{ $t('sunsetFaqPara2') }}</p>
        <p>{{ $t('sunsetFaqPara3') }}</p>
        <p>{{ $t('sunsetFaqPara4') }}</p>
        <p>{{ $t('sunsetFaqPara5') }}</p>
      </div>

      <!-- Which services are ending -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader1') }}
        </h3>
      </div>
      <div class="body-text">
        <p v-html="$t('sunsetFaqPara6')"></p>
      </div>

      <!-- Why are tavern and guild ending? -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader2') }}
        </h3>
      </div>
      <div class="body-text">
        <ul>
          <li>{{ $t('sunsetFaqList1') }}</li>
          <li>{{ $t('sunsetFaqList2') }}</li>
          <li>{{ $t('sunsetFaqList3') }}</li>
        </ul>
      </div>

      <!-- Can I still talk to my party/group members? -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader3') }}
        </h3>
      </div>
      <div class="body-text">
        <p>{{ $t('sunsetFaqPara7') }}</p>
      </div>

      <!-- Pausing dailies -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader4') }}
        </h3>
      </div>
      <div class="body-text">
        <p>{{ $t('sunsetFaqPara8') }}</p>
      </div>

      <!-- Accessing group plans -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader5') }}
        </h3>
      </div>
      <div class="body-text">
        <p v-html="$t('sunsetFaqPara9')"></p>
      </div>

      <!-- Can I access guild chats? Or banked Gems? -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader12') }}
        </h3>
      </div>
      <div class="body-text">
        <p v-html="$t('sunsetFaqPara21')"></p>
      </div>

      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader6') }}
        </h3>
      </div>
      <div class="body-text">
        <p>{{ $t('sunsetFaqPara10') }}</p>
      </div>

      <!-- How can players find groups? -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader7') }}
        </h3>
      </div>
      <div class="body-text">
        <p>{{ $t('sunsetFaqPara11') }}</p>
      </div>

      <!-- What about contributors? -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader8') }}
        </h3>
      </div>
      <div class="body-text">
        <p v-html="$t('sunsetFaqPara12')"></p>
        <p v-html="$t('sunsetFaqPara13')"></p>
        <p v-html="$t('sunsetFaqPara14')"></p>
        <p v-html="$t('sunsetFaqPara15')"></p>
        <p v-html="$t('sunsetFaqPara16')"></p>
        <p v-html="$t('sunsetFaqPara17')"></p>
        <p v-html="$t('sunsetFaqPara18')"></p>
        <p v-html="$t('sunsetFaqPara19')"></p>
      </div>

      <!-- Challenges -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader9') }}
        </h3>
      </div>
      <div class="body-text">
        <ul>
          <li>{{ $t('sunsetFaqList4') }}</li>
          <li>{{ $t('sunsetFaqList5') }}</li>
          <li>{{ $t('sunsetFaqList6') }}</li>
          <li>{{ $t('sunsetFaqList7') }}</li>
        </ul>
      </div>

      <!-- Questions about how to use Habitica -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader10') }}
        </h3>
      </div>
      <div class="body-text">
        <ul>
          <li v-html="$t('sunsetFaqList8')"></li>
          <li v-html="$t('sunsetFaqList9')"></li>
          <li v-html="$t('sunsetFaqList10')"></li>
        </ul>
      </div>

      <!-- Community Guidelines and TOS -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader11') }}
        </h3>
      </div>
      <div class="body-text">
        <p v-html="$t('sunsetFaqPara20')"></p>
      </div>
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
      section: this.$t('sunsetFaqTitle'),
    });
    document.body.style.background = '#ffffff';
  },
};
</script>
