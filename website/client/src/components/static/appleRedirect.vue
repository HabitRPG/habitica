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
    const reqParams = { code: urlParams.get('code'), allowRegister: false };
    if (urlParams.has('name')) {
      reqParams.name = urlParams.get('name');
      window.sessionStorage.setItem('apple-name', reqParams.name);
    }
    const response = await this.$store.dispatch('auth:appleAuth', reqParams);
    if (response.id) {
      window.sessionStorage.removeItem('apple-token');
      window.location.href = '/';
    } else {
      window.sessionStorage.setItem('apple-token', response.idToken);
      window.location.href = '/username';
    }
  },
};
</script>
