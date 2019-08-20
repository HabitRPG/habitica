/* eslint-disable react/react-in-jsx-scope */

import {storiesOf} from '@storybook/vue';

import CountBadge from 'website/client/components/ui/countBadge';
import StarBadge from 'website/client/components/ui/starBadge';
import ClassBadge from 'website/client/components/members/classBadge';

storiesOf('UI-Components', module)
  .add('CountBadge', () => ({
    components: { CountBadge },
    template: '<count-badge :show="true" :count="42" />',
  }))

  .add('ClassBadge', () => ({
    components: {ClassBadge},
    template: '<class-badge memberClass="healer" />',
  }))

  .add('StarBadge', () => ({
    components: {StarBadge},
    template: `
    <div>
    <star-badge :show="true" :selected="false" />
    <star-badge :show="true" :selected="true" />
    </div>
    `,
  }))
;

