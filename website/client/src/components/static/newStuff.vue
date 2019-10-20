<template>
  <div
    class="static-view"
    v-html="html"
  ></div>
</template>

<style lang='scss'>
@import '~@/assets/scss/static.scss';
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
    const response = await axios.get('/api/v4/news');
    this.html = response.data.html;
  },
};
</script>
