<template lang="pug">
  .conversation(:class="{active: activeKey === uuid}", @click="$emit('click', {})")
    div
      user-label(:backer="backer", :contributor="contributor", :name="displayName")
    .time
      span.mr-1(v-if='username') @{{ username }} •
      span(v-if="lastMessageDate") {{ lastMessageDate | timeAgo }}
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
    padding: 1.5em;
    border-top: 1px solid $gray-500;

    &:hover {
      cursor: pointer;
      background: #EEE;
    }

    &.active {
      background-color: #f1edff;
    }
  }
</style>
