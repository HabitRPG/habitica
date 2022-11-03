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
      <filter-group
        :title="$t('membership')"
        class="form-group"
      >
        <div
          v-for="group in membershipOptions"
          :key="group.key"
          class="form-check"
        >
          <div class="custom-control custom-checkbox">
            <input
              :id="group.key"
              v-model="membershipFilters"
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
      <filter-group :title="$t('ownership')">
        <div
          v-for="group in ownershipOptions"
          :key="group.key"
          class="form-check"
        >
          <div class="custom-control custom-checkbox">
            <input
              :id="group.key"
              v-model="ownershipFilters"
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

export default {
  components: { FilterGroup, FilterSidebar },
  data () {
    return {
      categoryFilters: [],
      categoryOptions: CategoryOptions,
      membershipFilters: [],
      membershipOptions: [
        {
          label: 'participating',
          key: 'participating',
        },
        {
          label: 'not_participating',
          key: 'not_participating',
        },
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
    ownershipFilters: function ownershipFilters () {
      this.emitFilters();
    },
    membershipFilters: function membershipFilters () {
      this.emitFilters();
    },
    searchTerm: throttle(function searchTerm (newSearch) {
      this.$emit('search', {
        searchTerm: newSearch,
      });
    }, 500),
  },
  methods: {
    emitFilters () {
      this.$emit('filter', {
        categories: this.categoryFilters,
        ownership: this.ownershipFilters,
        membership: this.membershipFilters,
      });
    },
  },
};
</script>
