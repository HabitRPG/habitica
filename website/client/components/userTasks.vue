<template lang="pug">
.row
  .col-12
    .row
      .col-3.p-4
        h3 Input
        input.form-control(type="text", placeholder="Placeholder")
      .col-3.p-4
        h3 Input Disabled
        input.form-control(type="text", placeholder="Placeholder", disabled)
      .col-3.p-4
        h3 Input With Icon
        input.form-control.input-search(type="text", placeholder="Placeholder")
      .col-3.p-4
        h3 Input With Icon Disabled
        input.form-control.input-search(type="text", placeholder="Placeholder", disabled)
      .col-3.p-4
        h3 Input Valid
        input.form-control.input-valid(type="text", placeholder="Placeholder")
      .col-3.p-4
        h3 Input Invalid
        input.form-control.input-invalid(type="text", placeholder="Placeholder")
    .row
      .col-6.p-4
        h3 Textarea
        textarea.form-control(rows="5", cols="50")
      .col-6.p-4
        h3 Textarea Disabled
        textarea.form-control(disabled, rows="10", cols="50")
    .row
      .col-2.p-4
        toggleSwitch(label="Toggle Switch")
    .row
      .col-3.p-4
        h3 Checkbox
        label.custom-control.custom-checkbox
          input.custom-control-input(type='checkbox')
          span.custom-control-indicator
          span.custom-control-description Check this custom checkbox
      .col-3.p-4
        h3 Checkbox Disabled Checked
        label.custom-control.custom-checkbox
          input.custom-control-input(type='checkbox', disabled, checked)
          span.custom-control-indicator
          span.custom-control-description Check this custom checkbox
      .col-3.p-4
        h3 Checkbox Disabled Not Checked
        label.custom-control.custom-checkbox
          input.custom-control-input(type='checkbox', disabled)
          span.custom-control-indicator
          span.custom-control-description Check this custom checkbox
      .col-6.p-4
        h3 Radio Button
        form
          label.custom-control.custom-radio
            input#radio1.custom-control-input(name='radio', type='radio')
            span.custom-control-indicator
            span.custom-control-description Toggle this custom radio
          label.custom-control.custom-radio
            input#radio2.custom-control-input(name='radio', type='radio')
            span.custom-control-indicator
            span.custom-control-description Toggle this custom radio
      .col-3.p-4
        h3 Radio Button Disabled Checked
        form
          label.custom-control.custom-radio
            input#radio3.custom-control-input(name='radio', type='radio', disabled, checked)
            span.custom-control-indicator
            span.custom-control-description Toggle this custom radio
      .col-3.p-4
        h3 Radio Button Disabled Not Checked
        form
          label.custom-control.custom-radio
            input#radio3.custom-control-input(name='radio', type='radio', disabled)
            span.custom-control-indicator
            span.custom-control-description Toggle this custom radio
    .row
      .col-3.p-4
        h3 Main Button
        button.btn.btn-primary Button
      .col-3.p-4
        h3 Secondary Button
        button.btn.btn-secondary Button
      .col-3.p-4
        h3 Green Button
        button.btn.btn-success Button
      .col-3.p-4
        h3 Blue Button
        button.btn.btn-info Button
      .col-3.p-4
        h3 Red Button
        button.btn.btn-danger Button
    .row
      .col-3.p-4
        h3 Main Button Disabled
        button.btn.btn-primary(disabled=true) Button
      .col-3.p-4
        h3 Secondary Button Disabled
        button.btn.btn-secondary(disabled=true) Button
      .col-3.p-4
        h3 Green Button Disabled
        button.btn.btn-success(disabled=true) Button
      .col-3.p-4
        h3 Blue Button Disabled
        button.btn.btn-info(disabled=true) Button
      .col-3.p-4
        h3 Red Button Disabled
        button.btn.btn-danger(disabled=true) Button
    .row
      .col-6.p-4
        h3 Dropdown Menu
        b-dropdown(text="Menu", right=false)
          b-dropdown-item(href="#") Menu item 1
          b-dropdown-item(href="#") Menu item 2
          b-dropdown-item(href="#") Menu item 3
          b-dropdown-item(href="#") Menu item 4
      .col-6.p-4
        h3 Dropdown Menu Disabled
        b-dropdown(text="Menu", disabled)
          b-dropdown-item(href="#") Menu item 1
          b-dropdown-item(href="#") Menu item 2
          b-dropdown-item(href="#") Menu item 3
          b-dropdown-item(href="#") Menu item 4
    .row
      .col-6.p-4
        h1 Heading 1
        h2 Heading 2
        h3 Heading 3
        h4 Heading 4
      .col-6.p-4
        p Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vehicula, purus sit amet sodales pharetra, ipsum ipsum mollis orci, id pharetra velit diam et dui. Sed placerat ipsum eget pharetra rutrum. Ut vitae rutrum lacus, eu imperdiet velit. Pellentesque eu velit cursus, scelerisque dui quis, dapibus magna. Vestibulum molestie sed sapien et ultricies. Nam porta ipsum leo, non congue magna vestibulum a. Etiam dictum felis sit amet augue varius tincidunt. Sed eget urna auctor, convallis felis in, pretium justo. Curabitur aliquet, ligula id tincidunt ullamcorper, orci lorem pharetra neque, in ornare arcu magna accumsan arcu. Maecenas dignissim lorem sed eros accumsan scelerisque.
        p.small-text Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vehicula, purus sit amet sodales pharetra, ipsum ipsum mollis orci, id pharetra velit diam et dui.
    .row
      .col(v-for="taskType in tasksTypes")
        h3 {{taskType}}s
        ul
          task(v-for="task in tasks", v-if="task.type === taskType", :key="task.id", :task="task")
</template>

<script>
import Task from './task';
import { mapState } from 'client/libs/store';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import toggleSwitch from 'client/components/ui/toggleSwitch';

export default {
  components: {
    Task,
    bDropdown,
    bDropdownItem,
    toggleSwitch,
  },
  data () {
    return {
      tasksTypes: ['habit', 'daily', 'todo', 'reward'],
    };
  },
  computed: {
    ...mapState({tasks: 'tasks.data'}),
  },
};
</script>
