<template lang="pug">
.notification.dropdown-item.dropdown-separated.d-flex.justify-content-between
  .notification-icon ICON
  .notification-content {{ notification }}
  .notification-remove.svg-icon(v-if="canRemove", v-html="icons.close")
</template>

<style lang="scss" scoped>
@import '~client/assets/scss/colors.scss';

.notification {
  width: 378px;
  max-width: 100%;
  padding: 16px 24px;
  overflow: hidden;
}

.notification-icon {
  min-height: 28px;
  min-width: 28px;
  border: 1px solid;
  margin-right: 16px;
}

.notification-content {
  white-space: normal;
  border: 1px solid;
}

.notification-remove {
  width: 30px; // the real size is 10px for some reason
  height: 10px;
  margin-left: 16px;
}
</style>

<script>
import closeIcon from 'assets/svg/close.svg';

export default {
  props: ['notification', 'canRemove'],
  data () {
    return {
      icons: Object.freeze({
        close: closeIcon,
      }),
    };
  },
};
</script>