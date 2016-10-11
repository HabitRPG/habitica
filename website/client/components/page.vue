<template lang="pug">
.sixteen.wide.column
  p {{ msg }}
</template>

<script>
export default {
  data () {
    return {
      msg: 'You\'re on Another Page!',
    };
  },
};
</script>