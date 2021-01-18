<template>
  <div class="col-12 col-md-6 offset-md-4">
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
      <a
        @click="filter([])"
        class='col-md-2'
        :class="{ invisible: !selectedTags.length }"
      >{{ $t('clearTags') }}</a>
    </div>
    <tag-filter-panel
      v-if="isFilterPanelOpen"
      :selectedTags="selectedTags"
      @close="closeFilterPanel"
      @filter="filter"
    />
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .filter-icon {
    width: 16px;
    height: 16px;
  }

  a {
    margin: auto;
    color: $blue-10;

    &:hover, &:active, &:focus {
      text-decoration: underline;
    }
  }
</style>

<script>
import throttle from 'lodash/throttle';

import TagFilterPanel from './tagFilterPanel';
import filterIcon from '@/assets/svg/filter.svg';

export default {
  components: { TagFilterPanel },
  props: { selectedTags: Array },
  data () {
    return {
      searchText: null,
      isFilterPanelOpen: false,
      icons: Object.freeze({
        filter: filterIcon,
      }),
    };
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
