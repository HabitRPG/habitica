<template lang="pug">
#app-header.row
  .four.wide.column
    avatar(:user="$store.state.user")
</template>

<style>
#app-header {
  padding-bottom: 0;
  border-bottom: 1px solid black;
}
</style>

<script>
import Avatar from './avatar';

export default {
  components: {
    Avatar,
  },
};
</script>