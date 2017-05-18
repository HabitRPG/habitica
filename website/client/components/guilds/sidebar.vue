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

<style lang="scss" scoped>
  .side-bar {
    background-color: #edecee;
    padding: 2em;

    h3 {
      margin-bottom: 1em;
      margin-top: 1em;
    }

    .search {
      border-radius: 2px;
      background-color: #ffffff;
      border: solid 1px #c3c0c7;
      height: 40px;
    }

    [type="checkbox"] {
      width: 18px;
      height: 18px;
      border-radius: 2px;
      border: solid 2px #878190;
    }

    .label span {
      font-size: 14px;
      line-height: 1.43;
      color: #4e4a57;
      font-weight: 500;
      padding-left: .5em;
    }
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
    searchTerm: function searchTerm (newSearch) {
      this.$emit('search', {
        searchTerm: newSearch,
      });
    },
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
