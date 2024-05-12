<template>
  <div
    class="empty-messages m-auto text-center empty-sidebar"
  >
    <div class="no-messages-box">
      <div
        v-once
        class="svg-icon envelope"
        v-html="icons.messageIcon"
      ></div>
      <h2 v-once>
        {{ $t('emptyMessagesLine1') }}
      </h2>
      <p v-if="!chatRevoked">
        {{ $t('emptyMessagesLine2') }}
      </p>
    </div>

    <button
      class="btn btn-primary mt-4"
    >
      new message
    </button>
  </div>
</template>

<style scoped lang="scss">
</style>

<script>
import messageIcon from '@/assets/svg/message.svg';

export default {
  props: {
    chatRevoked: Boolean,
  },
  data () {
    return {
      icons: Object.freeze({
        messageIcon,
      }),
    };
  },
};
</script>
