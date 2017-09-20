<template lang="pug">
  b-modal#private-message(title="Message", size='md', :hide-footer="true")
    .content
      textarea.form-control(v-model='privateMessage')
      button.btn.btn-primary(@click='sendPrivateMessage()', :disabled='loading') Send
</template>

<style lang="scss" scoped>
  .content {
    padding: 1em;

    textarea {
      margin-bottom: 1em;
    }
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import notifications from 'client/mixins/notifications';

export default {
  mixins: [notifications],
  components: {
    bModal,
  },
  data () {
    return {
      privateMessage: '',
      loading: false,
      userIdToMessage: '',
    };
  },
  computed: {
    userIdToMessageStore () {
      return this.$store.state.userIdToMessage;
    },
  },
  watch: {
    userIdToMessageStore () {
      this.userIdToMessage = this.userIdToMessageStore;
    },
  },
  methods: {
    async sendPrivateMessage () {
      if (!this.privateMessage || !this.userIdToMessage) return;

      this.loading = true;

      await this.$store.dispatch('members:sendPrivateMessage', {
        message: this.privateMessage,
        toUserId: this.userIdToMessage,
      });

      this.loading = false;

      this.text(this.$t('messageSentAlert'));

      this.privateMessage = '';
    },
  },
};
</script>
