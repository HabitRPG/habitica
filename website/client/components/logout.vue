<template lang="pug"></template>

<style>

</style>

<script>
export default {
  components: {},
  data () {},
  computed: {},
  methods: {
    async logout () {
      return await this.$store.dispatch('auth:logout');
    },
  },
  created () {
    this.logout();
  },
};
</script>
