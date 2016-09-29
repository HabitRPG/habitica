<template lang="pug">
#app-header
  h1 {{title}}
  ul
    li
      router-link(to='/') Home
    li
      router-link(to='/page') Another Page
</template>

<script>
import { mapState } from '../store';

export default {
  computed: mapState(['title']),
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: #42b983;
}
</style>
