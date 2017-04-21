<template lang="pug">
.row
  .col-12
    h2(v-once) {{ $t('inbox') }}
    .card(v-for="conversation in conversations")
      .card-block
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
