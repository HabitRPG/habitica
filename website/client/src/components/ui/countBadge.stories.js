import { withKnobs, number } from '@storybook/addon-knobs';

import CountBadge from './countBadge.vue';

export default {
  title: 'Count Badge',
  decorators: [withKnobs],
};

export const Simple = () => ({
  components: { CountBadge },
  template: `
      <div style="position: absolute; margin: 20px">
        <count-badge :count="2" :show="true"></count-badge>
      </div>
    `,
});

Simple.story = {
  name: 'simple',
};

export const BindCount = () => ({
  components: { CountBadge },
  template: `
      <div style="position: absolute; margin: 20px">
        <count-badge :count="count" :show="true"></count-badge>
      </div>
    `,
  props: {
    count: {
      default: number('Count', 3),
    },
  },
});

BindCount.story = {
  name: 'bind count',
};
