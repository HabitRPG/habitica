<template lang="pug">
.standard-sidebar.d-none.d-sm-block
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
        .custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", :value='group.key' v-model="categoryFilters", :id="group.key")
          label.custom-control-label(v-once, :for="group.key") {{ $t(group.label) }}
    .form-group(v-if='$route.name !== "findChallenges"')
      h3 Membership
      .form-check(
        v-for="group in roleOptions",
        :key="group.key",
      )
        .custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", :value='group.key' v-model="roleFilters", :id="group.key")
          label.custom-control-label(v-once, :for="group.key") {{ $t(group.label) }}
    .form-group
      h3 Ownership
      .form-check(
        v-for="group in ownershipOptions",
        :key="group.key",
      )
        .custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", :value='group.key' v-model="ownershipFilters", :id="group.key")
          label.custom-control-label(v-once, :for="group.key") {{ $t(group.label) }}
</template>

<script>
import throttle from 'lodash/throttle';

export default {
  data () {
    return {
      categoryFilters: [],
      categoryOptions: [
        {
          label: 'habitica_official',
          key: 'habitica_official',
        },
        {
          label: 'academics',
          key: 'academics',
        },
        {
          label: 'advocacy_causes',
          key: 'advocacy_causes',
        },
        {
          label: 'creativity',
          key: 'creativity',
        },
        {
          label: 'entertainment',
          key: 'entertainment',
        },
        {
          label: 'finance',
          key: 'finance',
        },
        {
          label: 'health_fitness',
          key: 'health_fitness',
        },
        {
          label: 'hobbies_occupations',
          key: 'hobbies_occupations',
        },
        {
          label: 'location_based',
          key: 'location_based',
        },
        {
          label: 'mental_health',
          key: 'mental_health',
        },
        {
          label: 'getting_organized',
          key: 'getting_organized',
        },
        {
          label: 'self_improvement',
          key: 'self_improvement',
        },
        {
          label: 'spirituality',
          key: 'spirituality',
        },
        {
          label: 'time_management',
          key: 'time_management',
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
