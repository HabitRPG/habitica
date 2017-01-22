<template lang="pug">
.ui.internally.celled.grid
  .row
    .sixteen.wide.column
      .ui.comments
        h2.ui.dividing.header Conversation
        .comment(v-for="message in messages")
          a.avatar
            img(src='http://semantic-ui.com/images/avatar/small/matt.jpg')
          .content
            a.author {{message.from}}
            .metadata
              span.date {{message.date}}
            .text
              | {{message.message}}
        .field
          textarea(v-model='newMessage')
        .ui.blue.labeled.submit.icon.button(v-on:click='reply')
          i.icon.edit
          |  Add Reply
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
