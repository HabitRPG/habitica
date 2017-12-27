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
  padding: 9px 24px 10px 24px;
  overflow: hidden;

  &:active, &:hover {
    color: inherit;
  }
}

.notification-icon {
  min-height: 31px;
  min-width: 32px;
  border: 1px solid;
  margin-right: 16px;
}

.notification-content {
  // total distance from notification top and bottom edges are 15 and 16 pixels
  margin-top: 6px;
  margin-bottom: 6px;

  white-space: normal;
  border: 1px solid;
}

.notification-remove {
  // total distance from the notification top edge is 20 pixels
  margin-top: 11px;

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