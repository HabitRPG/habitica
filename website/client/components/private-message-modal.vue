<template lang="pug">
  b-modal#private-message(title="Message", size='sm', :hide-footer="true")
    textarea.form-control(v-model='privateMessage')
    button.btn.btn-primary(@click='sendPrivateMessage()') Send
</template>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';
import notifications from 'client/mixins/notifications';

export default {
  mixins: [notifications],
  props: ['userIdToMessage'],
  components: {
    bModal,
  },
  data () {
    return {
      privateMessage: '',
    };
  },
  methods: {
    async sendPrivateMessage () {
      if (!this.privateMessage || !this.userIdToMessage) return;

      await this.$store.dispatch('members:sendPrivateMessage', {
        message: this.privateMessage,
        toUserId: this.userIdToMessage,
      });

      this.text(this.$t('messageSentAlert'));
    },
  },
};
</script>
