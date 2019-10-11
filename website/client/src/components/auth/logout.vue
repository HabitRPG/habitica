<script>
export default {
  components: {},
  created () {
    this.logout();
  },
  methods: {
    async logout () {
      return this.$store.dispatch('auth:logout');
    },
  },
};
</script>
