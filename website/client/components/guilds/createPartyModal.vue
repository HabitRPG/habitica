<template lang="pug">
b-modal#create-party-modal(:title="Empty", size='lg', hide-footer=true)
  .header-wrap(slot="modal-header")
    h2 Image Here
    .row
      .col-12.text-center
        h2(v-once) {{$t('playInPartyTitle')}}
        p(v-once) {{$t('playInPartyDescription')}}
  .row.grey-row
    .col-6.text-center
      img
      h3(v-once) {{$t('startYourOwnPartyTitle')}}
      p(v-once) {{$t('startYourOwnPartyDescription')}}
      button.btn.btn-primary(v-once) {{$t('createParty')}}
    .col-6.text-center
      img
      h3(v-once) {{$t('wantToJoinPartyTitle')}}
      p(v-once) {{$t('wantToJoinPartyDescription')}}
      button.btn.btn-primary(v-once) {{$t('shartUserId')}}
</template>

<style lang='scss'>
  @import '~client/assets/scss/colors.scss';

  .modal-body {
    padding-bottom: 0;
    padding-top: 0;
  }

  .grey-row {
    background-color: $gray-700;
    padding: 2em;
    border-radius: 0px 0px 2px 2px;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

export default {
  components: {
    bModal,
  },
};
</script>
