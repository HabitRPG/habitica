<template lang="pug">
.standard-sidebar
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
        {
          label: 'diyCrafts',
          key: 'diy_crafts',
        },
        {
          label: 'education',
          key: 'education',
        },
        {
          label: 'foodCooking',
          key: 'food_cooking',
        },
        {
          label: 'healthFitness',
          key: 'health_fitness',
        },
        {
          label: 'music',
          key: 'music',
        },
        {
          label: 'relationship',
          key: 'relationship',
        },
        {
          label: 'scienceTech',
          key: 'science_tech ',
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
        guildSize: this.guildSizeFilters,
      });
    },
  },
};
</script>
