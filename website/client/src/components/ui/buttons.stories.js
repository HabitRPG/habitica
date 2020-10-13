/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';

import positiveIcon from '@/assets/svg/positive.svg';

const stories = storiesOf('Buttons', module);

stories.addDecorator(withKnobs);

stories
  .add('all', () => ({
    components: { },
    data () {
      return {
        icon: positiveIcon,
      };
    },
    template: `      
      <div style="position: absolute; margin: 20px; display: flex; flex-direction: row;">
        <div class="mr-3">
          <h3>Button</h3>
          <button class="btn btn-primary">Button Primary</button>
          <br/><br/>
          <button class="btn btn-primary" disabled>Button Primary Disabled</button>
          <br/><br/>

          <button class="btn btn-secondary">Button Secondary</button>
          <br/><br/>
          <button class="btn btn-secondary" disabled>Button Secondary Disabled</button>
        </div>
        <div class="">
          <h3>Button with Icon</h3>
          <button class="btn btn-primary with-icon">
             <span class="svg-icon color inline icon-12 mr-2"
                   v-html="icon"
             >
               
             </span>
            <span class="button-label">
              Button Primary
            </span>
          </button>
          <br/>
          <button class="btn btn-primary with-icon" disabled>
            <span class="svg-icon color inline icon-12 mr-2"
                  v-html="icon"
            >
               
             </span>
            <span class="button-label">
              Button Primary Disabled
            </span>
          </button>
          <br/>

          <button class="btn btn-secondary with-icon">
            <span class="svg-icon color inline icon-12 mr-2"
                  v-html="icon"
            >
               
             </span>
            <span class="button-label">
              Button Secondary
            </span>
          </button>
          <br/>
          <button class="btn btn-secondary with-icon" disabled>
            <span class="svg-icon color inline icon-12 mr-2"
                  v-html="icon"
            >
               
            </span>
            <span class="button-label">
              Button Secondary Disabled
            </span>
          </button>
        </div>
      </div>
    `,
  }))
  .add('dropdowns', () => ({
    components: { },
    data () {
      return {
        items: ['one', 'two', 'three'],
      };
    },
    template: `      
      <div style="position: absolute; margin: 20px; display: flex; flex-direction: row;">
        <div class="mr-3">
          <h3>Dropdowns</h3>
          <b-dropdown
            text="Dropdown Primary"
            right="right"
          >
            <b-dropdown-item
              v-for="item in items"
              :key="item"
            >
              {{ item }}
            </b-dropdown-item>
          </b-dropdown>
          <br/><br/>
          <b-dropdown
            text="Dropdown Primary Disabled"
            right="right"
            disabled
          >
          </b-dropdown>
        </div>
        <div class="">
          <h3>Button</h3>
          <button class="btn btn-secondary">
            <span class="button-label">
              Button Primary
            </span>
          </button>
          <br/>
          <br/>
          <button class="btn btn-secondary" disabled>
            <span class="button-label">
              Button Primary Disabled
            </span>
          </button>
        </div>
      </div>
    `,
  }));
