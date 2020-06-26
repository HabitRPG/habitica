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
    id: 12,
    name: 'This is a different tag',
  },
  {
    id: 9001,
    name: 'OVER 9000',
  },
  {
    id: 4,
    name: 'Four',
  },
  {
    id: 5,
    name: 'Five :tada:',
    challenge: true,
  },
  {
    id: 6,
    name: 'Six',
  },
  {
    id: 7,
    name: 'Seven **Markdown**',
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
                     @changed="tagList = $event"
                     @addNew="added = $event">
            
          </SelectTag>
          
          <br/>
          <br/>
          
          Added event: {{ added }}
        </div>
    `,
    store,
    data () {
      return {
        tagList: exampleTagList,
        added: '',
      };
    },
    props: {
      allTags: {
        default: allTags,
      },
    },
  }))
  .add('longer select-tag', () => ({
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
        tagList: [],
      };
    },
    props: {
      allTags: {
        default: allTags,
      },
    },
  }));
