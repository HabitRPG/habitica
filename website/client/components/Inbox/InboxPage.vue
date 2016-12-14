<template lang="pug">
.ui.internally.celled.grid
  .row
    .sixteen.wide.colum
      h2.ui.dividing.header Inbox
      .ui.middle.aligned.selection.list
        .item(v-for="conversation in conversations")
          img.ui.avatar.image(src='http://semantic-ui.com/images/avatar/small/daniel.jpg')
          .content
            .header
              router-link(:to="{ name: 'conversation', params: { id: conversation.fromUserId } }")
                | {{ conversation.from }}

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
      },
    ];

    let conversations = {};
    for (let message of messages) {
      if (!conversations[message.fromUserId]) conversations[message.fromUserId] = message;
    }

    return {
      conversations,
    };
  },
};
</script>
