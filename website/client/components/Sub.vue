<template lang="pug">
.hello
  h1 {{ msg }}
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello Sub Route!',
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: #42b983;
}
</style>
