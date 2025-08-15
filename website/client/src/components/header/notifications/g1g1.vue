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
      src="@/assets/images/gifts_end.svg"
      class="gift-end"
      alt=""
    >
    <div class="close-x">
      <close-x
        @close="remove()"
      />
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
    line-height: 24px;
    letter-spacing: 0;
  }

  strong {
    color: $white;
    font-family: 'Roboto', sans-serif;
    font-weight: 700;
    font-style: normal;
    font-size: 14px;
    line-height: 24px;
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
    transform: translateY(-50%);
    z-index: 0;
  }

  .close-x ::v-deep {
    .modal-close {
      .svg-close {
        color: $white !important;
        opacity: 0.5 !important;
        transition: opacity 0.2s ease;
      }

      &:hover .svg-close {
        opacity: 0.75 !important;
      }
    }
  }
</style>

<script>
import closeX from '@/components/ui/closeX';

export default {
  components: {
    closeX,
  },
  props: ['notification', 'eventKey'],
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
