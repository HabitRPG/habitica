<template lang="pug">
.notification.dropdown-item.dropdown-separated.d-flex.justify-content-between(
  @click="clicked"
)
  .notification-icon.d-flex.justify-content-center.align-items-center(v-if="hasIcon")
    slot(name="icon")
  .notification-content
    slot(name="content")
  .notification-remove
    .svg-icon(
      v-if="canRemove", 
      v-html="icons.close", 
      @click.stop="readNotification({notificationId: notification.id})",
    )
</template>

<style lang="scss"> // Not scoped because the classes could be used in i18n strings
@import '~client/assets/scss/colors.scss';
.notification-small {
  font-size: 12px;
  line-height: 1.33;
  color: $gray-200;
}

.notification-ellipses {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.notification-bold {
  font-weight: bold;
}

.notification-bold-blue {
  font-weight: bold;
  color: $blue-10;
}

.notification-bold-purple {
  font-weight: bold;
  color: $purple-300;
}

.notification-yellow {
  color: #bf7d1a;
}

.notification-green {
  color: #1CA372;
}
</style>

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
  margin-right: 16px;
}

.notifications-buttons {
  margin-top: 12px;

  .btn {
    margin-right: 8px;
  }
}

.notification-content {
  // total distance from notification top and bottom edges are 15 and 16 pixels
  margin-top: 6px;
  margin-bottom: 6px;

  flex-grow: 1;
  white-space: normal;

  font-size: 14px;
  line-height: 1.43;
  color: $gray-50;

  max-width: calc(100% - 26px); // to make space for the close icon
}

.notification-remove {
  // total distance from the notification top edge is 20 pixels
  margin-top: 11px;

  width: 10px;
  height: 10px;
  margin-left: 16px;

  .svg-icon {
    width: 10px;
    height: 10px;
  }
}
</style>

<script>
import closeIcon from 'assets/svg/close.svg';
import { mapActions } from 'client/libs/store';

export default {
  props: ['notification', 'canRemove', 'hasIcon', 'readAfterClick'],
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
    clicked () {
      if (this.readAfterClick === true) {
        this.readNotification({notificationId: this.notification.id});
      }

      this.$emit('click');
    },
  },
};
</script>