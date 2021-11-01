export default {
  methods: {
    openBugReportModal () {
      this.$root.$emit('bv::show::modal', 'bug-report-modal');
    },
  },
};
