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
    .form-group
      h3 Role
      .form-check(
        v-for="group in roleOptions",
        :key="group.key",
      )
        .custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", :value='group.key' v-model="roleFilters", :id="group.key")
          label.custom-control-label(v-once, :for="group.key") {{ $t(group.label) }}
    .form-group
      h3 Guild Size
      .form-check(
        v-for="group in guildSizeOptions",
        :key="group.key",
      )
        .custom-control.custom-checkbox
          input.custom-control-input(type="checkbox", :value='group.key' v-model="guildSizeFilters", :id="group.key")
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
          label: 'recovery_support_groups',
          key: 'recovery_support_groups',
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
          label: 'guildLeader',
          key: 'guild_leader',
        },
        {
          label: 'member',
          key: 'member',
        },
      ],
      guildSizeFilters: [],
      guildSizeOptions: [
        {
          label: 'goldTier',
          key: 'gold_tier',
        },
        {
          label: 'silverTier',
          key: 'silver_tier',
        },
        {
          label: 'bronzeTier',
          key: 'bronze_tier',
        },
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
    guildSizeFilters: function guildSizeFilters () {
      this.emitFilters();
    },
    searchTerm: throttle(function searchTerm (newSearch) {
      if (newSearch.length <= 1) return; // @TODO: eh, should we limit based on length?

      this.$emit('search', {
        searchTerm: newSearch,
      });
    }, 1000),
  },
  methods: {
    emitFilters () {
      this.$emit('filter', {
        categories: this.categoryFilters,
        roles: this.roleFilters,
        guildSize: this.guildSizeFilters,
      });
    },
  },
};
</script>
