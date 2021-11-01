/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';


import bugReportModal from '@/components/bugReportModal';

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
  }));
