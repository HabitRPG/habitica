<template lang="pug">
.row
  .col-12
    h2 Conversation
    .card(v-for="message in messages")
      .card-block
        strong {{message.from}}
        span {{message.date}}
        p {{message.message}}
    form.form.mt-2(@submit.prevent='reply')
      .form-group
        textarea.form-control(rows="3", v-model='newMessage')
      button.btn.btn-primary(type="submit") Add Reply
</template>

<script>
export default {
  data () {
    // @TODO: Abstract to Store
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
    reply: function reply () {
      // @TODO: This will be default values based on the conversation and current user
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
