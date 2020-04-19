<template>
  <div class="static-view">
    <p>Redirecting...</p>
  </div>
</template>

<style lang='scss'>
@import '~@/assets/scss/static.scss';
</style>

<style lang='scss' scoped>
.static-view {
  height: 400px;
  text-align: center;
}

.static-view p {
  padding-top: 100px;
  font-size: 2em
}
</style>

<script>

export default {
  async mounted () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const reqParams = { code: urlParams.get('code') };
    if (urlParams.has('name')) {
      reqParams.name = urlParams.get('name');
    }
    await this.$store.dispatch('auth:appleAuth', reqParams);

    window.location.href = '/';
  },
};
</script>
