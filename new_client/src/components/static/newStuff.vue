<template lang='pug'>
  .static-view(v-html="html")
</template>

<style lang='scss'>
@import '~client/assets/scss/static.scss';
</style>

<script>
import axios from 'axios';

export default {
  data () {
    return {
      html: '',
    };
  },
  async mounted () {
    let response = await axios.get('/api/v4/news');
    this.html = response.data.html;
  },
};
</script>
