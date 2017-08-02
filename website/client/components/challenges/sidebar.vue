<template lang="pug">
.col-2.standard-sidebar
  .form-group
    input.form-control.search(type="text", :placeholder="$t('search')", v-model='searchTerm')

  form
    h2(v-once) {{ $t('filter') }}
    .form-group
      h3 Category
      .form-check(
        v-for="group in categoryOptions",
        :key="group.key",
      )
        label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", :value='group.key' v-model="categoryFilters")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t(group.label) }}
    .form-group
      h3 Membership
      .form-check(
        v-for="group in roleOptions",
        :key="group.key",
      )
        label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", :value='group.key' v-model="roleFilters")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t(group.label) }}
    .form-group
      h3 Ownership
      .form-check(
        v-for="group in ownershipOptions",
        :key="group.key",
      )
        label.custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", :value='group.key' v-model="ownershipFilters")
          span.custom-control-indicator
          span.custom-control-description(v-once) {{ $t(group.label) }}
</template>

<script>
import throttle from 'lodash/throttle';

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
          label: 'animals',
          key: 'animals',
        },
        {
          label: 'artDesign',
          key: 'art_design',
        },
        {
          label: 'booksWriting',
          key: 'books_writing',
        },
        {
          label: 'comicsHobbies',
          key: 'comics_hobbies',
        },
      ],
      roleFilters: [],
      roleOptions: [
        {
          label: 'participating',
          key: 'participating',
        },
        {
          label: 'not_participating',
          key: 'not_participating',
        },
        // {
        //   label: 'either',
        //   key: 'either',
        // },
      ],
      ownershipFilters: [],
      ownershipOptions: [
        {
          label: 'owned',
          key: 'owned',
        },
        {
          label: 'not_owned',
          key: 'not_owned',
        },
        // {
        //   label: 'either',
        //   key: 'either',
        // },
      ],
      searchTerm: '',
    };
  },
  watch: {
    categoryFilters: function categoryFilters () {
      this.emitFilters();
    },
    roleFilters: function roleFilters () {
      this.emitFilters();
    },
    ownershipFilters: function ownershipFilters () {
      this.emitFilters();
    },
    searchTerm: throttle(function searchTerm (newSearch) {
      this.$emit('search', {
        searchTerm: newSearch,
      });
    }, 250),
  },
  methods: {
    emitFilters () {
      this.$emit('filter', {
        categories: this.categoryFilters,
        roles: this.roleFilters,
        ownership: this.ownershipFilters,
      });
    },
  },
};
</script>
