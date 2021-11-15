import { MODALS } from '@/libs/consts';

export default {
  methods: {
    openBugReportModal () {
      this.$root.$emit('bv::show::modal', MODALS.BUG_REPORT);
    },
  },
};
