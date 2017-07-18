<template lang="pug">
.row
  sidebar(@search="updateSearch", @filter="updateFilters")

  .standard-page
    .clearfix
        h1.page-header.float-left(v-once) {{ $t('publicGuilds') }}
        .float-right
          span.dropdown-label {{ $t('sortBy') }}
          b-dropdown(:text="$t('sort')", right=true)
            b-dropdown-item(v-for='sortOption in sortOptions', :key="sortOption.value", @click='sort(sortOption.value)') {{sortOption.text}}
    .col-md-12
      public-guild-item(v-for="guild in filteredGuilds", :key='guild._id', :guild="guild", :display-leave='true')
      mugen-scroll(
        :handler="fetchGuilds",
        :should-handle="!loading && !this.hasLoadedAllGuilds",
        :handle-on-mount="false",
        v-show="loading",
      )
        span(v-once) {{ $t('loading') }}
</template>

<style>
.sort-select {
  margin: 2em;
}
</style>

<script>
import MugenScroll from 'vue-mugen-scroll';
import PublicGuildItem from './publicGuildItem';
import Sidebar from './sidebar';
import groupUtilities from 'client/mixins/groupsUtilities';

import bFormSelect from 'bootstrap-vue/lib/components/form-select';
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';

export default {
  mixins: [groupUtilities],
  components: { PublicGuildItem, MugenScroll, Sidebar, bFormSelect, bDropdown, bDropdownItem },
  data () {
    return {
      loading: false,
      hasLoadedAllGuilds: false,
      lastPageLoaded: 0,
      search: '',
      filters: {},
      sort: 'none',
      sortOptions: [
        {
          text: this.$t('none'),
          value: 'none',
        },
        {
          text: this.$t('memberCount'),
          value: 'member_count',
        },
        {
          text: this.$t('recentActivity'),
          value: 'recent_activity',
        },
      ],
      guilds: [],
    };
  },
  created () {
    if (!this.$store.state.publicGuilds) this.fetchGuilds();
  },
  computed: {
    filteredGuilds () {
      let search = this.search;
      let filters = this.filters;
      let user = this.$store.state.user.data;
      let filterGuild = this.filterGuild;
      // @TODO: Move this to the server
      return this.guilds.filter((guild) => {
        return filterGuild(guild, filters, search, user);
      });
    },
  },
  methods: {
    updateSearch (eventData) {
      this.search = eventData.searchTerm;
    },
    updateFilters (eventData) {
      this.filters = eventData;
    },
    async fetchGuilds () {
      // We have the data cached
      if (this.lastPageLoaded === 0 && this.guilds.length > 0) return;

      this.loading = true;
      let guilds = await this.$store.dispatch('guilds:getPublicGuilds', {page: this.lastPageLoaded});
      if (guilds.length === 0) this.hasLoadedAllGuilds = true;

      this.guilds.push(...guilds);

      this.lastPageLoaded++;
      this.loading = false;
    },
  },
};
</script>
