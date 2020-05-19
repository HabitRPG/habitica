/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs, number } from '@storybook/addon-knobs';

import TagList from './modal-controls/tagList';
import SelectTag from './modal-controls/selectTag';
import getStore from '@/store';

const stories = storiesOf('Tags', module);

stories.addDecorator(withKnobs);

// Needed for SelectTag
const store = getStore();
store.state.user.data = {
  tags: [],
};

const exampleTagList = [
  1, 2, 3,
];

const allTags = [
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
  {
    id: 5,
    name: 'This is a different tag',
  },
  {
    id: 4,
    name: 'OVER 9000',
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
        default: allTags,
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
          <SelectTag :selectedTags="tagList" 
                        :all-tags="allTags"
                      style="width: 400px"
                       @changed="tagList = $event"></SelectTag>
        </div>
    `,
    store,
    data () {
      return {
        tagList: exampleTagList,
      };
    },
    props: {
      allTags: {
        default: allTags,
      },
    },
  }));
