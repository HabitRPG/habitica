<template lang="pug">
  .conversation(:class="{active: activeKey === uuid}", @click="$emit('click', {})")
    .user
      user-label(:backer="backer", :contributor="contributor", :name="displayName")
      span.username(v-if='username') @{{ username }}
      .time(v-if="lastMessageDate") {{ lastMessageDate | timeAgo }}
    div.messagePreview {{ lastMessageText }}
</template>

<script>
  import userLabel from '../userLabel';
  import moment from 'moment';

  export default {
    props: [
      'activeKey', 'uuid', 'backer', 'displayName',
      'username', 'contributor', 'lastMessageText',
      'lastMessageDate',
    ],
    components: {
      userLabel,
    },
    filters: {
      timeAgo (value) {
        return moment(value).fromNow();
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .conversation {
    padding: 1.5rem;
    border-bottom: 1px solid $gray-500;

    &:hover {
      cursor: pointer;
      background: #EEE;
    }

    &.active {
      background-color: #f1edff;
    }

    .user {
      display: flex;
      flex-direction: row;
      height: 20px;

      .user-label {
        flex: 1;
        flex-grow: 0;
        margin-right: 0.5rem;
        white-space: nowrap;
      }

      .username {
        flex: 1;
        flex-grow: 0;
      }

      .time {
        flex: 2;
        text-align: end;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-left: 1rem;
      }
    }

    .messagePreview {
      width: 100%;
      height: 30px;
      margin-right: 40px;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: normal;
      color: $gray-100;
      overflow: hidden;

      // text-overflow: ellipsis;
    }
  }
</style>
