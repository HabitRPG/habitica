<script>
export default {
  components: {},
  created () {
    this.logout();
  },
  methods: {
    async logout () {
      return await this.$store.dispatch('auth:logout');
    },
  },
};
</script>
