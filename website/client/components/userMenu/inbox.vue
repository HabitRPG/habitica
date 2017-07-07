<template lang="pug">
  b-modal#inbox-modal(title="", :hide-footer="true", size='lg')
    .header-wrap.container(slot="modal-header")
      .row
        .col-4
          .row
            .col-2
              .svg-icon.envelope(v-html="icons.messageIcon")
            .col-6
              h2.text-center Messages
            .col-2.offset-1
              button.btn.btn-secondary(@click='toggleClick()') +
        .col-8.to-form(v-if='displayCreate')
          strong To:
          b-form-input
    .row
      .col-4.sidebar
        .search-section
          b-form-input(placeholder='Search')
        .empty-messages.text-center(v-if='conversations.length === 0')
          .svg-icon.envelope(v-html="icons.messageIcon")
          h4 You don’t have any messages
          p Send a message to start a conversation!
        .conversations(v-if='conversations.length > 0')
      .col-8.messages
        .new-message-row
          b-form-input
          button.btn.btn-secondary Send
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .envelope {
    color: #c3c0c7 !important;
    margin-top: 1em;
  }

  h2 {
    margin-top: .5em;
  }

  .sidebar {
    background-color: #f9f9f9;
    min-height: 600px;
    padding: 0;

    .search-section {
      padding: 1em;
      box-shadow: 0 1px 2px 0 rgba(26, 24, 29, 0.24);
    }
  }

  .messages {
    position: relative;
    padding-left: 0;
  }

  .to-form input {
    width: 60%;
    display: inline-block;
    margin-left: 1em;
  }

  .empty-messages {
    margin-top: 10em;
    color: #c3c0c7;
    padding: 1em;

    h4 {
      color: #c3c0c7;
      margin-top: 1em;
    }

    .envelope {
      width: 30px;
      margin: 0 auto;
    }
  }

  .new-message-row {
    background-color: #f9f9f9;
    position: absolute;
    bottom: 0;
    height: 88px;
    width: 100%;
    padding: 1em;

    input {
      display: inline-block;
      width: 80%;
    }

    button {
      box-shadow: none;
      margin-left: 1em;
    }
  }

</style>

<script>
import keys from 'lodash/keys';

import bModal from 'bootstrap-vue/lib/components/modal';
import bFormInput from 'bootstrap-vue/lib/components/form-input';

import messageIcon from 'assets/svg/message.svg';

export default {
  components: {
    bModal,
    bFormInput,
  },
  data () {
    return {
      icons: Object.freeze({
        messageIcon,
      }),
      displayCreate: true,
    };
  },
  computed: {
    conversations () {
      return [];
    },
    currentMessages () {
      return [];
    },
  },
  methods: {
    toggleClick () {
      this.displayCreate = !this.displayCreate;
    },
  },
};
</script>
