/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs, number } from '@storybook/addon-knobs';

import TagList from './modal-controls/tagList';
import SelectTag from './modal-controls/selectTag';

const stories = storiesOf('Tags', module);

stories.addDecorator(withKnobs);

const exampleTagList = [
  {
    id: 1,
    name: 'Small Tag',
  },
  {
    id: 2,
    name: 'This is a long tag',
  },
  {
    id: 3,
    name: 'This is a long tag',
  },
];

stories
  .add('tag-list', () => ({
    components: { TagList },
    template: `
      <div style="position: absolute; margin: 20px">
        <TagList :max-tags="maxTags" :tags="tagList"></TagList>
      </div>
    `,
    props: {
      tagList: {
        default: exampleTagList,
      },
      maxTags: {
        default: number('Max-Tags', 3),
      },
    },
  }))
  .add('select-tag', () => ({
    components: { SelectTag },
    template: `
      <div style="position: absolute; margin: 20px">
        <SelectTag :tags="tagList"></SelectTag>
      </div>
    `,
    props: {
      tagList: {
        default: exampleTagList,
      },
    },
  }));
