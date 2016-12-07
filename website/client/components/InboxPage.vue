<template lang="pug">
.row
  .sixteen.wide.column
    h2 Inbox
    p {{ $route.path }}
    ul#example-1
      li(v-for="item in messages")
        | {{ item.message }}
</template>

<script>
export default {
  data() {
    return {
      messages: [
        { message: 'Foo' },
        { message: 'Bar' },
      ],
    }
  }
};
</script>
