<template>
  <div class="container-fluid">
    <div class="row">
      <h1>{{ $t('sunsetFaqTitle') }}</h1>
      <p v-html="$t('sunsetFaqPara1')"></p>  <!-- there's html in here -->
      <p>{{ $t('sunsetFaqPara2') }}></p>
      <p>{{ $t('sunsetFaqPara3') }}></p>
      <p>{{ $t('sunsetFaqPara4') }}></p>
      <p>{{ $t('sunsetFaqPara5') }}></p>

      <!-- which services are ending -->
      <h2>{{ $t('sunsetFaqHeader1') }}</h2>
      <p>{{ $t('sunsetFaqPara6') }}</p>

      <!-- Why are tavern and guild ending? -->
      <h2>{{ $t('sunsetFaqHeader2') }}</h2>
      <ul>
        <li>{{ $t('sunsetFaqList1') }}</li>
        <li>{{ $t('sunsetFaqList2') }}</li>
        <li>{{ $t('sunsetFaqList3') }}</li>
      </ul>

      <!-- Can I still talk to my party/group members? -->
      <h2>{{ $t('sunsetFaqHeader3') }}</h2>
      <p>{{ $t('sunsetFaqPara7') }}</p>

      <!-- Pausing dailies -->
      <h2>{{ $t('sunsetFaqHeader4') }}</h2>
      <p>{{ $t('sunsetFaqPara8') }}</p>

      <!-- Accessing group plans -->
      <h2>{{ $t('sunsetFaqHeader5') }}</h2>
      <p v-html="$t('sunsetFaqPara9')"></p> <!-- there's html in here -->

      <!-- Can I access guild chats? -->
      <h2>{{ $t('sunsetFaqHeader6') }}</h2>
      <p>{{ $t('sunsetFaqPara10') }}</p>

      <!-- How can players find groups? -->
      <h2>{{ $t('sunsetFaqHeader7') }}</h2>
      <p>{{ $t('sunsetFaqPara11') }}</p>

      <!-- What about contributors? -->
      <h2>{{ $t('sunsetFaqHeader8') }}</h2>
      <p v-html="$t('sunsetFaqPara12')"></p> <!-- there's html in here -->
      <p v-html="$t('sunsetFaqPara13')"></p> <!-- there's html in here -->
      <p v-html="$t('sunsetFaqPara14')"></p> <!-- there's html in here -->
      <p v-html="$t('sunsetFaqPara15')"></p> <!-- there's html in here -->
      <p v-html="$t('sunsetFaqPara16')"></p> <!-- there's html in here -->
      <p v-html="$t('sunsetFaqPara17')"></p> <!-- there's html in here -->
      <p v-html="$t('sunsetFaqPara18')"></p> <!-- there's html in here -->
      <p v-html="$t('sunsetFaqPara19')"></p> <!-- there's html in here -->

      <!-- Challenges -->
      <h2>{{ $t('sunsetFaqHeader9') }}</h2>
      <ul>
        <li>{{ $t('sunsetFaqList4') }}</li>
        <li>{{ $t('sunsetFaqList5') }}</li>
        <li>{{ $t('sunsetFaqList6') }}</li>
        <li>{{ $t('sunsetFaqList7') }}</li>
      </ul>

      <!-- Questions about how to use Habitica -->
      <h2>{{ $t('sunsetFaqHeader10') }}</h2>
      <li v-html="$t('sunsetFaqList8')"></li> <!-- there's html in here -->
      <li v-html="$t('sunsetFaqList9')"></li> <!-- there's html in here -->
      <li v-html="$t('sunsetFaqList10')"></li> <!-- there's html in here -->

      <!-- Community Guidelines and TOS -->
      <h2>{{ $t('sunsetFaqHeader11') }}</h2>
      <p v-html="$t('sunsetFaqPara20')"></p>
    </div>
  </div>
</template>

<style lang="scss" scoped>


</style>

<script>
export default {

  async mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('chat-sunset-faq'),
    });
  },
};
</script>
