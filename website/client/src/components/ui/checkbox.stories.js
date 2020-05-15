/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import { withKnobs } from '@storybook/addon-knobs';

import Checkbox from './checkbox';
import ToggleCheckbox from './toggleCheckbox';

const stories = storiesOf('Checkbox', module);

stories.addDecorator(withKnobs);

stories
  .add('checkbox', () => ({
    components: {
      Checkbox,
    },
    template: `
      <div style="position: absolute; margin: 20px">
        <Checkbox text="My Checkbox" id="someId"></Checkbox> <br/>
        <Checkbox text="My Checked Checkbox" id="someOtherId" :checked.sync="checked"></Checkbox>
      </div>
    `,
    data () {
      return {
        checked: true,
      };
    },
  }))
  .add('Toggle Checkbox Group', () => ({
    components: {
      ToggleCheckbox,
    },
    template: `
      <div style="position: absolute; margin: 20px">
        {{ checked }}
        <div class="toggle-group" style="width: 300px">
        <ToggleCheckbox text="Su"></ToggleCheckbox>
        <ToggleCheckbox text="Mo"
                        :checked.sync="checked"></ToggleCheckbox>
        <ToggleCheckbox text="Tu"></ToggleCheckbox>
        <ToggleCheckbox text="We"
                        :checked.sync="checked"></ToggleCheckbox>
        <ToggleCheckbox text="Th"></ToggleCheckbox>
        <ToggleCheckbox text="Fr"
                        :checked.sync="checked"></ToggleCheckbox>
        <ToggleCheckbox text="Sa"
                        :checked.sync="checked"
                        :disabled="true"></ToggleCheckbox>
        </div>

        <br/>
        <br/>
        Disabled:
        <div class="toggle-group" style="width: 300px">
          <ToggleCheckbox text="Su" :disabled="true"></ToggleCheckbox>
          <ToggleCheckbox text="Mo" :disabled="true"></ToggleCheckbox>
          <ToggleCheckbox text="Tu" :disabled="true"></ToggleCheckbox>
          <ToggleCheckbox text="We" :disabled="true"></ToggleCheckbox>
          <ToggleCheckbox text="Th" :disabled="true"></ToggleCheckbox>
          <ToggleCheckbox text="Fr" :disabled="true"></ToggleCheckbox>
          <ToggleCheckbox text="Sa" :disabled="true"></ToggleCheckbox>
        </div>
      </div>
    `,
    data () {
      return {
        checked: true,
      };
    },
  }));
