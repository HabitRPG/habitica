<template>
  <div
    class="notification d-flex flex-column justify-content-center text-center"
  >
    <strong
      v-once
      class="mx-auto mb-2"
    >
      {{ $t('g1g1') }}
    </strong>
    <small
      v-once
      class="mx-4 mb-3"
    >
      {{ $t('g1g1Details') }}
    </small>
    <div
      class="btn-secondary mx-auto d-flex"
      @click="showSelectUser()"
    >
      <div
        v-once
        class="m-auto"
      >
        {{ $t('sendGift') }}
      </div>
    </div>
    <div
      class="notification-remove"
      @click.stop="remove()"
    >
      <div
        v-once
        class="svg-icon"
        v-html="icons.close"
      ></div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  small, strong {
    color: $white;
  }

  .notification {
    background-image: url('~@/assets/images/g1g1-notif.png');
    height: 10rem;
    padding: 3rem;
    position: relative;
    overflow: hidden;
    white-space: normal;
    cursor: pointer;
  }

  .notification-remove {
    position: absolute;
    width: 18px;
    height: 18px;
    padding: 4px;
    right: 24px;
    top: 24px;

    .svg-icon {
      width: 10px;
      height: 10px;
    }
  }

  .btn-secondary {
    width: 5.75rem;
    min-height: 1.5rem;
    border-radius: 2px;
    border-color: $white;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    font-size: 12px;
    font-weight: bold;
  }
</style>

<script>
import closeIcon from '@/assets/svg/close-teal.svg';
import { mapActions } from '@/libs/store';

export default {
  props: ['notification'],
  data () {
    return {
      icons: Object.freeze({
        close: closeIcon,
      }),
    };
  },
  methods: {
    ...mapActions({
      readNotification: 'notifications:readNotification',
    }),
    remove () {
      this.readNotification({ notificationId: this.notification.id });
    },
    showSelectUser () {
      this.$root.$emit('bv::show::modal', 'select-user-modal');
    },
  },
};
</script>
