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

export default {
  data () {
    return {
      html: '',
    };
  },
  async mounted () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    await this.$store.dispatch('auth:appleAuth', { code: urlParams.get('code') });

    window.location.href = '/';
  },
};
</script>
