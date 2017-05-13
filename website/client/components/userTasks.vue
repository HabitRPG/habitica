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

export default {
  components: {
    Task,
    bDropdown,
    bDropdownItem,
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