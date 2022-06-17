import { text, withKnobs } from '@storybook/addon-knobs';
import toggleSwitch from './toggleSwitch';

export default {
  title: 'Toggle Switch',
  decorators: [withKnobs],
};

export const LabelOnly = () => ({
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
});

LabelOnly.story = {
  name: 'label only',
};

export const WithDescription = () => ({
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
});

WithDescription.story = {
  name: 'with description',
};
