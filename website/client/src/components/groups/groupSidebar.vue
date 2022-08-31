<template>
  <div class="standard-sidebar d-none d-sm-block">
    <filter-sidebar>
      <div
        slot="search"
        class="form-group"
      >
        <input
          v-model="searchTerm"
          class="form-control input-search"
          type="text"
          :placeholder="$t('search')"
        >
      </div>
      <filter-group :title="$t('category')">
        <div
          v-for="group in categoryOptions"
          :key="group.key"
          class="form-check"
        >
          <div class="custom-control custom-checkbox">
            <input
              :id="group.key"
              v-model="categoryFilters"
              class="custom-control-input"
              type="checkbox"
              :value="group.key"
            >
            <label
              v-once
              class="custom-control-label"
              :for="group.key"
            >{{ $t(group.label) }}</label>
          </div>
        </div>
      </filter-group>
      <filter-group :title="$t('role')">
        <div
          v-for="group in roleOptions"
          :key="group.key"
          class="form-check"
        >
          <div class="custom-control custom-checkbox">
            <input
              :id="group.key"
              v-model="roleFilters"
              class="custom-control-input"
              type="checkbox"
              :value="group.key"
            >
            <label
              v-once
              class="custom-control-label"
              :for="group.key"
            >{{ $t(group.label) }}</label>
          </div>
        </div>
      </filter-group>
      <filter-group :title="$t('guildSize')">
        <div
          v-for="group in guildSizeOptions"
          :key="group.key"
          class="form-check"
        >
          <div class="custom-control custom-checkbox">
            <input
              :id="group.key"
              v-model="guildSizeFilters"
              class="custom-control-input"
              type="checkbox"
              :value="group.key"
            >
            <label
              v-once
              class="custom-control-label"
              :for="group.key"
            >{{ $t(group.label) }}</label>
          </div>
        </div>
      </filter-group>
    </filter-sidebar>
  </div>
</template>

<script>
import throttle from 'lodash/throttle';
import FilterSidebar from '@/components/ui/filterSidebar';
import FilterGroup from '@/components/ui/filterGroup';
import CategoryOptions from '@/../../common/script/content/categoryOptions';

// TODO use checkbox-component to add/remove entries to *Filters, but without the v-model binding

export default {
  components: { FilterGroup, FilterSidebar },
  data () {
    return {
      categoryFilters: [],
      categoryOptions: CategoryOptions,
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
