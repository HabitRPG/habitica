<template lang="pug">
.row

  .sixteen.wide.column
    .ui.secondary.menu
      a.item
        router-link(:to="{ name: 'tavern' }")
          | Tavern
      a.item
        router-link(:to="{ name: 'inbox' }")
          | Inbox

  .sixteen.wide.column
    router-view
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
