/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';

const stories = storiesOf('Margins', module);

const margins = [
  'mr-1 ml-1 my-1',
  'mx-2 ml-3 my-2',
  'mx-2 ml-1 my-1',
  'ml-1 mr-4',
  'ml-2 mr-2 my-1',
  'ml-75 my-3 mr-2',
];

stories
  .add('overview', () => ({
    components: { },
    template: `
      <div style="position: absolute; margin: 20px">
        <span class="background inline-block">
            <span class="content mx-1 my-1 inline-block">
                <span class="text mx-1 my-1 inline-block">
                The margin between gray and teal is the margin content.
                    </span>
            </span>
        </span>  
          
          <br />
          <br />
          
        <span v-for="m in margins" 
              class="background mx-1 my-1 inline-block">
            <span class="content  inline-block" :class="m">
                <span class="mx-1 my-1 inline-block">{{m}}</span>
            </span>
        </span>
      </div>
    `,

    data () {
      return {
        margins,
      };
    },
  }));
