<script>
  export default {
    components: {},
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
