import { withKnobs } from '@storybook/addon-knobs';

import bugReportModal from '@/components/bugReportModal';
import bugReportSuccessModal from '@/components/bugReportSuccessModal';

export default {
  title: 'Bug Report Modal',
  decorators: [withKnobs],
};

export const BugReportModal = () => ({
  components: { bugReportModal },
  data () {
    return {};
  },
  template: `  
      <div> 
        <bug-report-modal></bug-report-modal>
      </div>
    `,
  mounted () {
    this.$root.$emit('bv::show::modal', 'bug-report-modal');
  },
});

BugReportModal.story = {
  name: 'bugReportModal',
};

export const BugReportSuccessModal = () => ({
  components: { bugReportSuccessModal },
  data () {
    return {};
  },
  template: `  
      <div> 
        <bug-report-success-modal></bug-report-success-modal>
      </div>
    `,
  mounted () {
    this.$root.$emit('bv::show::modal', 'bug-report-success-modal');
  },
});

BugReportSuccessModal.story = {
  name: 'bugReportSuccessModal',
};
