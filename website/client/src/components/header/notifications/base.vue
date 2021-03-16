<template>
  <div
    class="notification dropdown-item dropdown-separated d-flex justify-content-between"
    @click="clicked"
  >
    <div
      v-if="hasIcon"
      class="notification-icon d-flex justify-content-center align-items-center"
      :class="{'is-not-bailey': isNotBailey}"
    >
      <slot name="icon"></slot>
    </div>
    <div
      class="notification-content"
      :class="{'has-text': hasText}"
    >
      <slot name="content"></slot>
    </div>
    <div
      class="notification-remove"
      @click.stop="canRemove ? remove() : null"
    >
      <div
        v-if="canRemove"
        class="svg-icon"
        v-html="icons.close"
      ></div>
    </div>
  </div>
</template>

<style lang="scss"> // Not scoped because the classes could be used in i18n strings
@import '~@/assets/scss/colors.scss';
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
@import '~@/assets/scss/colors.scss';

.notification {
  width: 378px;
  max-width: 100%;
  padding: 9px 20px 10px 24px;
  overflow: hidden;

  &:active, &:hover {
    color: inherit;
  }
}

.notification-icon {
  margin-right: 16px;

  &.is-not-bailey {
    width: 31px;
    height: 32px;
  }
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

  max-width: 100%;

  &.has-text {
    padding-right: 12px;
  }
}

.notification-remove {
  position: relative;
  width: 10px;
  height: 10px;
  right: 0px;
  top: 10.5px;

  .svg-icon {
    width: 10px;
    height: 10px;
  }
}
</style>

<script>
import closeIcon from '@/assets/svg/close.svg';
import { mapActions, mapState } from '@/libs/store';

export default {
  props: {
    notification: {
      type: Object,
      required: true,
    },
    canRemove: {
      type: Boolean,
    },
    hasIcon: {
      type: Boolean,
    },
    readAfterClick: {
      type: Boolean,
    },
    hasText: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        close: closeIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    isNotBailey () {
      return this.notification.type !== 'NEW_STUFF';
    },
  },
  methods: {
    ...mapActions({
      readNotification: 'notifications:readNotification',
    }),
    clicked () {
      if (this.readAfterClick === true) {
        this.readNotification({ notificationId: this.notification.id });
      }

      this.$emit('click');
    },
    remove () {
      if (this.notification.type === 'NEW_CHAT_MESSAGE') {
        const groupId = this.notification.data.group.id;
        this.$store.dispatch('chat:markChatSeen', {
          groupId,
          notificationId: this.notification.id,
        });
      } else {
        this.readNotification({ notificationId: this.notification.id });
      }
    },
  },
};
</script>
