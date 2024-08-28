<template>
  <div
    class="empty-messages m-auto text-center empty-sidebar"
  >
    <div class="no-messages-box">
      <div
        v-once
        class="svg-icon envelope mb-4"
        v-html="icons.mailIcon"
      ></div>
      <strong v-once>
        {{ $t('emptyMessagesLine1') }}
      </strong>
      <p v-if="!chatRevoked">
        {{ $t('emptyMessagesLine2') }}
      </p>
    </div>

    <button
      class="btn btn-primary mt-4"
      @click="$emit('newMessageClicked')"
    >
      new message
    </button>
  </div>
</template>

<style scoped lang="scss">
@import '~@/assets/scss/colors.scss';

strong {
  line-height: 1.71;
  color: $gray-100;
}
</style>

<script>
import mailIcon from '@/assets/svg/mail.svg';

export default {
  props: {
    chatRevoked: Boolean,
  },
  data () {
    return {
      icons: Object.freeze({
        mailIcon,
      }),
    };
  },
};
</script>
