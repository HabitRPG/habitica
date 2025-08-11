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
    </div>
    <img
      src="@/assets/images/gifts_end.svg"
      class="gift-end"
      alt=""
    >
    <close-x
      @close="remove()"
    />
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
    align-self: stretch;
    height: 100%;
    width: auto;
    position: absolute;
    left: 0;
    top: 0;
  }

  .gift-end {
    align-self: stretch;
    height: 100%;
    width: auto;
    position: absolute;
    right: 0;
    top: 0;
  }

  .btn-secondary {
    min-width: 5.75rem;
    width: auto;
    max-width: calc(100% - 2rem);
    min-height: 32px;
    padding: 0.25rem 0.75rem;
    border-radius: 2px;
    border-color: $white;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    font-family: 'Roboto', sans-serif;
    font-weight: 700;
    font-style: normal;
    font-size: 14px;
    line-height: 24px;
    color: $gray-50;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
