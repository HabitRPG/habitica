import { withKnobs } from '@storybook/addon-knobs';

import datepicker from './datepicker.vue';

export default {
  title: 'Date Picker',
  decorators: [withKnobs],
};


export const Simple = () => ({
  components: { datepicker },
  template: `
      <div style="position: absolute; margin: 20px">
        <datepicker></datepicker>
      </div>
    `,
});

Simple.story = {
  name: 'simple',
};
