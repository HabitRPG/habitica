<template lang="pug">
h1 {{ title }}
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: mapState([
    'title',
  ]),
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: #42b983;
}
</style>
