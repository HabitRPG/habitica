import { MODALS } from '@/libs/consts';

export default {
  methods: {
    openBugReportModal (questionMode = false) {
      this.$store.state.bugReportOptions.question = questionMode;
      this.$root.$emit('bv::show::modal', MODALS.BUG_REPORT);
    },
  },
};
