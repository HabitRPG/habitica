<template lang="pug">
.row
  .sixteen.wide.column
    h2 Page
    p {{ $route.path }}
    <ul id="example-1">
      <li v-for="item in messages">
        {{ item.message }}
      </li>
    </ul>
</template>

<script>
export default {
  data: {
    messages: [
      { message: 'Foo' },
      { message: 'Bar' }
    ]
  }
};
</script>
