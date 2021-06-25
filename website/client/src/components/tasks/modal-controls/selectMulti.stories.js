/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs, number } from '@storybook/addon-knobs';

import MultiList from './multiList';
import SelectMulti from './selectMulti';

const stories = storiesOf('Multiple Select List', module);

stories.addDecorator(withKnobs);

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
  }))
  .add('select-tag', () => ({
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
  }))
  .add('longer select-tag', () => ({
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
  }));
