/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { text, withKnobs } from '@storybook/addon-knobs';
import toggleSwitch from './toggleSwitch';

const stories = storiesOf('Toggle Switch', module);

stories.addDecorator(withKnobs);

stories
  .add('label only', () => ({
    components: { toggleSwitch },
    template: `
      <div style="position: absolute; margin: 20px">
        <toggle-switch :label="label"></toggle-switch>
      </div>
    `,
    props: {
      label: {
        default: text('Label', 'example text'),
      },
    },
  }))
  .add('with description', () => ({
    components: { toggleSwitch },
    template: `
      <div style="position: absolute; margin: 20px">
        <toggle-switch :label="label" :hover-text="description"></toggle-switch>
      </div>
    `,
    props: {
      label: {
        default: text('Label', 'example text'),
      },
      description: {
        default: text('Description', 'description text'),
      },
    },
  }));
