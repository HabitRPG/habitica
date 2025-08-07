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
  @import '@/assets/scss/colors.scss';

  small, strong {
    color: $white;
  }

  .notification {
    background-image: url('@/assets/images/g1g1-notif.png');
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
    min-width: 5.75rem;
    width: auto;
    max-width: calc(100% - 2rem);
    min-height: 1.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 2px;
    border-color: $white;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

<script>
import closeIcon from '@/assets/svg/close-teal.svg?raw';

export default {
  props: ['notification', 'eventKey'],
  data () {
    return {
      icons: Object.freeze({
        close: closeIcon,
      }),
    };
  },
  methods: {
    remove () {
      if (this.eventKey) {
        window.sessionStorage.setItem(`hide-g1g1-${this.eventKey}`, 'true');
      }
      this.$emit('notification-removed');
    },
    showSelectUser () {
      this.$root.$emit('bv::show::modal', 'select-user-modal');
    },
  },
};
</script>
