<template lang="pug">
.col-2.side-bar
  .form-group
    input.form-control.search(type="text", :placeholder="$t('search')")

  form
    h3(v-once) {{ $t('filter') }}
    .form-group
      h5 Category
      .form-check
        .label.form-check-label
          input.form-check-input(type="checkbox", value='official', v-model="categoryFilters")
          span Habitica Official
      .form-check
        .label.form-check-label
          input.form-check-input(type="checkbox", value='nature', v-model="categoryFilters")
          span Nature
      .form-check
        .label.form-check-label
          input.form-check-input(type="checkbox")
          span Animals
    .form-group
      h5 Role
      .form-check
        .label.form-check-label
          input.form-check-input(type="checkbox")
          span Habitica Official
      .form-check
        .label.form-check-label
          input.form-check-input(type="checkbox")
          span Nature
    .form-group
      h5 Guild Size
      .form-check
        .label.form-check-label
          input.form-check-input(type="checkbox")
          span Habitica Official
      .form-check
        .label.form-check-label
          input.form-check-input(type="checkbox")
          span Nature
      .form-check
        .label.form-check-label
          input.form-check-input(type="checkbox")
          span Animals
</template>

<style>
.side-bar {
  background-color: #edecee;
  padding: 2em;
}

.side-bar h3 {
  margin-bottom: 1em;
  margin-top: 1em;
}

.side-bar .search {
  border-radius: 2px;
  background-color: #ffffff;
  border: solid 1px #c3c0c7;
  height: 40px;
}

.side-bar [type="checkbox"] {
  width: 18px;
  height: 18px;
  border-radius: 2px;
  border: solid 2px #878190;
}

.side-bar .label span {
  font-size: 14px;
  line-height: 1.43;
  color: #4e4a57;
  font-weight: 500;
  padding-left: .5em;
}
</style>

<script>
export default {
  data () {
    return {
      categoryFilters: [],
    };
  },
  watch: {
    categoryFilters: (categoryFilters) => {
    },
  },
};
</script>
