<template lang="pug">
.col-2.side-bar
  .form-group
    input.form-control.search(type="text", :placeholder="$t('search')", v-model='searchTerm')

  form
    h3(v-once) {{ $t('filter') }}
    .form-group
      h5 Category
      .form-check(
        v-for="group in categoryOptions",
        :key="group.key",
      )
        label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", :value='group.key' v-model="categoryFilters")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t(group.label) }}
    .form-group
      h5 Role
      .form-check(
        v-for="group in roleOptions",
        :key="group.key",
      )
        label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", :value='group.key' v-model="roleFilters")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t(group.label) }}
    .form-group
      h5 Guild Size
      .form-check(
        v-for="group in guildSizeOptions",
        :key="group.key",
      )
        label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", :value='group.key' v-model="guildSizeFilters")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t(group.label) }}
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
      categoryOptions: [
        {
          label: 'habiticaOfficial',
          key: 'official',
        },
        {
          label: 'Nature',
          key: 'nature',
        },
        {
          label: 'Animals',
          key: 'animals',
        },
      ],
      roleFilters: [],
      roleOptions: [
        {
          label: 'Habitica Official',
          key: 'official',
        },
        {
          label: 'Nature',
          key: 'nature',
        },
        {
          label: 'Animals',
          key: 'animals',
        },
      ],
      guildSizeFilters: [],
      guildSizeOptions: [
        {
          label: 'Habitica Official',
          key: 'official',
        },
        {
          label: 'Nature',
          key: 'nature',
        },
        {
          label: 'Animals',
          key: 'animals',
        },
      ],
      searchTerm: '',
    };
  },
  watch: {
    categoryFilters: function categoryFilters (newCategoryFilters) {
      this.$emit('filter', {categories: newCategoryFilters});
    },
    roleFilters: function roleFilters (newRoleFilters) {
      this.$emit('filter', {roles: newRoleFilters});
    },
    guildSizeFilters: function guildSizeFilters (newGuildSizeFilters) {
      this.$emit('filter', {guildSize: newGuildSizeFilters});
    },
    searchTerm: function searchTerm (newSearch) {
      this.$emit('search', {searchTerm: newSearch});
    },
  },
};
</script>
