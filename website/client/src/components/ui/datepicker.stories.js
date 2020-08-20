/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';

import datepicker from './datepicker.vue';

const stories = storiesOf('Date Picker', module);

stories.addDecorator(withKnobs);

stories
  .add('simple', () => ({
    components: { datepicker },
    template: `
      <div style="position: absolute; margin: 20px">
        <datepicker></datepicker>
      </div>
    `,
  }));
