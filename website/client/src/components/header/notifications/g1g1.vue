<template>
  <div
    class="notification d-flex justify-content-center align-items-center"
  >
    <img
      src="@/assets/images/gifts_start.svg"
      class="gift-start"
      alt=""
    >
    <div class="content-wrapper d-flex flex-column justify-content-center text-center">
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
      <button
        class="btn btn-secondary mx-auto"
        @click="showSelectUser()"
      >
        {{ $t('sendGift') }}
      </button>
    </div>
    <img
      src="@/assets/images/gifts_start.svg"
      class="gift-end"
      alt=""
    >
    <div
      class="close-x"
      @click="remove()"
    >
      <div
        class="svg-icon svg-close"
        v-html="icons.close"
      ></div>
    </div>
  </div>
</template>

<style lang='scss' scoped>
  @import '@/assets/scss/colors.scss';

  small {
    color: $white;
    font-family: 'Roboto', sans-serif;
    font-weight: 400;
    font-style: normal;
    font-size: 14px;
    line-height: 1.714;
    letter-spacing: 0;
  }

  strong {
    color: $white;
    font-family: 'Roboto', sans-serif;
    font-weight: 700;
    font-style: normal;
    font-size: 14px;
    line-height: 1.714;
  }

  .notification {
    background-image: url('@/assets/images/gifts_bg.svg');
    background-size: cover;
    background-position: center;
    height: 10rem;
    padding: 0;
    position: relative;
    overflow: hidden;
    white-space: normal;
    cursor: pointer;
  }

  .content-wrapper {
    flex: 1;
    padding: 2rem;
    z-index: 1;
  }

  .gift-start {
    height: 96px;
    width: auto;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 0;
  }

  .gift-end {
    height: 96px;
    width: auto;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%) scaleX(-1);
    z-index: 0;
  }

  .close-x {
    position: absolute;
    right: 16px;
    top: 16px;
    cursor: pointer;
    z-index: 2;

    &:hover .svg-close {
      opacity: 0.75;
    }

    .svg-close {
      width: 18px;
      height: 18px;
      opacity: 0.5;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
  }
</style>

<script>
import closeIcon from '@/assets/svg/close-white.svg?raw';

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
