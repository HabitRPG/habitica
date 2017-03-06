<template lang="pug">
.row
  .col-12
    h2 Tavern: Work in progress
</template>

<script>
export default {
  data () {
    // TODO: Abstract to Store
    let messages = [
      {
        from: 'Paglias',
        fromUserId: 1234,
        to: 'TheHollidayInn',
        message: 'I love the Gang of Four',
        date: new Date(),
      },
    ];

    return {
      messages,
      newMessage: '',
    };
  },

  methods: {
    sendChat: function sendChat () {
      // TODO: This will be default values based on the conversation and current user
      let messageToSend = {
        from: 'TheHollidayInn',
        fromUserId: 3211,
        to: 'Paglias',
        message: this.newMessage,
        date: new Date(),
      };
      this.messages.push(messageToSend);
      this.newMessage = '';
    },
  },
};
</script>
