<template>
  <base-notification
    :can-remove="true"
    :has-icon="false"
  >
    <div
      slot="content"
      class="background d-flex flex-column justify-content-center text-center"
    >
      <strong class="mx-5 mb-3"> {{ $t('g1g1Announcement') }} </strong>
      <p> {{ $t('g1g1Details') }} </p>
      <btn class="btn-secondary mx-auto d-flex">
        <div class="m-auto"> {{ $t('sendGift') }} </div>
      </btn>
    </div>
  </base-notification>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  p, strong {
    color: $white;
  }

  p {
    margin-left: 5rem;
    margin-right: 5rem;
  }

  strong {
    font-size: 16px;
  }

  .background {
    position: relative;
    background-image: url('~@/assets/images/g1g1-notif.png');
    background-size: 378px 204px;
    width: 378px;
    height: 204px;
  }

  .btn-secondary {
    width: 5.75rem;
    height: 1.5rem;
    border-radius: 2px;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    font-size: 12px;
    font-weight: bold;
  }

  .notification {
    padding: 0 !important;
  }

  .notification ::v-deep .notification-content {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }
</style>

<script>
import BaseNotification from './base';
import { mapState } from '@/libs/store';

export default {
  components: {
    BaseNotification,
  },
  props: ['notification'],
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {

  },
};
</script>
