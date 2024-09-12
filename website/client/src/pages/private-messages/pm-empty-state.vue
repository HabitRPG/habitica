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
      <strong
        v-once
        class="mb-1"
      >
        {{ $t('emptyMessagesLine1') }}
      </strong>
      <p v-if="!chatRevoked">
        {{ $t('emptyMessagesLine2') }}
      </p>
    </div>

    <button
      class="btn btn-primary mt-4 d-flex align-items-center"
      @click="$emit('newMessageClicked')"
    >
      <div
        class="svg-icon icon-10 color mr-2"
        v-html="icons.positive"
      ></div>
      {{ $t('newMessage') }}
    </button>
  </div>
</template>

<style scoped lang="scss">
@import '~@/assets/scss/colors.scss';

strong {
  line-height: 1.71;
  color: $gray-100;
}

.svg-icon.icon-10 {
  margin: 3px;
}

p {
  font-size: 14px;
  font-weight: 400;
  line-height: 24px;
}
</style>

<script>
import mailIcon from '@/assets/svg/mail.svg';
import positiveIcon from '@/assets/svg/positive.svg';

export default {
  props: {
    chatRevoked: Boolean,
  },
  data () {
    return {
      icons: Object.freeze({
        mailIcon,
        positive: positiveIcon,
      }),
    };
  },
};
</script>
