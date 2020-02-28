<template>
  <div class="static-view">
    <p>Redirecting...</p>
  </div>
</template>

<style lang='scss'>
@import '~@/assets/scss/static.scss';

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
    const body = { code: urlParams.get('code') };
    if (urlParams.has('name')) {
      body.name = urlParams.get('name');
    }
    await this.$store.dispatch('auth:appleAuth', body);

    window.location.href = '/';
  },
};
</script>
