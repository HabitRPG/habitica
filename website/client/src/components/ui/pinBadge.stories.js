import { withKnobs, boolean } from '@storybook/addon-knobs';

import PinBadge from './pinBadge.vue';

export default {
  title: 'Pin Badge',
  decorators: [withKnobs],
};

export const States = () => ({
  components: { PinBadge },
  template: `
      <div style="position: absolute; margin: 20px">
        <pin-badge :pinned="pinned"></pin-badge>
      </div>
    `,
  props: {
    pinned: {
      default: boolean('Pinned', false),
    },
  },
});

States.story = {
  name: 'states',
};
