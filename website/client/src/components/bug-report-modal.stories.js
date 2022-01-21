/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';


import bugReportModal from '@/components/bugReportModal';
import bugReportSuccessModal from '@/components/bugReportSuccessModal';

const stories = storiesOf('Bug Report Modal', module);

stories.addDecorator(withKnobs);

stories
  .add('bugReportModal', () => ({
    components: { bugReportModal },
    data () {
      return {
      };
    },
    template: `  
      <div> 
        <bug-report-modal></bug-report-modal>
      </div>
    `,
    mounted () {
      this.$root.$emit('bv::show::modal', 'bug-report-modal');
    },
  }))
  .add('bugReportSuccessModal', () => ({
    components: { bugReportSuccessModal },
    data () {
      return {
      };
    },
    template: `  
      <div> 
        <bug-report-success-modal></bug-report-success-modal>
      </div>
    `,
    mounted () {
      this.$root.$emit('bv::show::modal', 'bug-report-success-modal');
    },
  }));
