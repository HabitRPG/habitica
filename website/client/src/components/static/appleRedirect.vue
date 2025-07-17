<template>
  <div class="static-view">
    <p>Redirecting...</p>
  </div>
</template>

<style lang='scss'>
@import '@/assets/scss/static.scss';
</style>

<style lang='scss' scoped>
.static-view {
  height: 400px;
  text-align: center;
}

.static-view p {
  padding-top: 100px;
  font-size: 2em;
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
      window.sessionStorage.setItem('apple-name', reqParams.name);
    }
    if (window.sessionStorage.getItem('allow-register') === 'false') {
      reqParams.allowRegister = false;
      window.sessionStorage.clear('allow-register');
    }
    const authId = await this.$store.dispatch('auth:appleAuth', reqParams);
    if (authId) {
      window.location.href = '/';
    }
    window.sessionStorage.setItem('apple-code', reqParams.code);
    window.location.href = '/register';
  },
};
</script>
