<template>
  <div class="col-12 col-md-4 offset-md-4">
    <div class="d-flex">
      <input
        v-model="searchText"
        class="form-control input-search"
        type="text"
        :placeholder="$t('search')"
      >
      <button
        class="btn btn-secondary dropdown-toggle ml-2 d-flex align-items-center search-button"
        type="button"
        :class="{ active: selectedTags.length }"
        @click="toggleFilterPanel"
      >
        <div class="svg-icon filter-icon mr-2" v-html="icons.filter"></div>
        <span v-once>{{ $t('tags') }}</span>
      </button>
    </div>
    <task-tag-panel
      v-if="isFilterPanelOpen"
      :selectedTags="selectedTags"
      @close="closeFilterPanel"
      @filter="filter"
    />
  </div>
</template>

<style lang="scss" scoped>
  .filter-icon {
    width: 16px;
    height: 16px;
  }
</style>

<script>
import throttle from 'lodash/throttle';

import TaskTagPanel from './taskTagPanel';
import filterIcon from '@/assets/svg/filter.svg';

import { mapState } from '@/libs/store';

export default {
  components: {
    TaskTagPanel,
  },
  props: {
    selectedTags: Array,
  },
  data () {
    return {
      searchText: null,
      isFilterPanelOpen: false,
      icons: Object.freeze({
        filter: filterIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  watch: {
    searchText: throttle(function throttleSearch () {
      this.$emit('search', this.searchText.toLowerCase());
    }, 250),
  },
  methods: {
    filter (tags) {
      this.$emit('filter', tags);
    },
    toggleFilterPanel () {
      this.isFilterPanelOpen = !this.isFilterPanelOpen;
    },
    closeFilterPanel () {
      this.isFilterPanelOpen = false;
    },
  },
};
</script>
