import { withKnobs, number } from '@storybook/addon-knobs';

import MultiList from './multiList';
import SelectMulti from './selectMulti';

export default {
  title: 'Multiple Select List',
  decorators: [withKnobs],
};

const exampleTagList = [1, 2, 3];

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

export const TagList = () => ({
  components: { MultiList },
  template: `
      <div style="position: absolute; margin: 20px">
        <MultiList :max-items="maxTags" :items="tagList"></MultiList>
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
});

TagList.story = {
  name: 'tag-list',
};

export const SelectTag = () => ({
  components: { SelectMulti },
  template: `
        <div style="position: absolute; margin: 20px">
          <SelectMulti :selectedItems="tagList"
                       :add-new="true"
                       :all-items="allTags"
                       style="width: 400px"
                       @changed="tagList = $event"
                       @addNew="added = $event">

          </SelectMulti>

          <br/>
          <br/>

          Added event: {{ added }}
        </div>
    `,
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
});

SelectTag.story = {
  name: 'select-tag',
};

export const LongerSelectTag = () => ({
  components: { SelectMulti },
  template: `
        <div style="position: absolute; margin: 20px">
            <SelectMulti :selectedItems="tagList"
                         :all-items="allTags"
                         style="width: 400px"
                         @changed="tagList = $event"></SelectMulti>
        </div>
    `,
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
});

LongerSelectTag.story = {
  name: 'longer select-tag',
};
