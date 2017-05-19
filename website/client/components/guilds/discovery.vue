<template lang="pug">
.row
  sidebar(v-on:search="updateSearch", v-on:filter="updateFilters")

  .col-10
    .row
      .col-md-12
        h2.float-left(v-once) {{ $t('publicGuilds') }}
        b-form-select.float-right.sort-select(v-model='sort', :options='sortOptions')
    .row
      .col-md-12
        public-guild-item(v-for="guild in filteredGuilds", :key='guild._id', :guild="guild", :display-leave='true')
        mugen-scroll(
          :handler="fetchGuilds",
          :should-handle="!loading && !this.hasLoadedAllGuilds",
          :handle-on-mount="false",
          v-show="loading",
        )
          span {{ $t('loading') }}
</template>

<style>
.sort-select {
  margin: 2em;
}

h2 {
  height: 40px;
  font-size: 24px;
  font-weight: bold;
  font-stretch: condensed;
  line-height: 1.67;
  color: #4f2a93;
  margin-top: 1em;
  margin-bottom: 1em;
}
</style>

<script>
import MugenScroll from 'vue-mugen-scroll';
import PublicGuildItem from './publicGuildItem';
import Sidebar from './sidebar';
import groupUtilities from 'client/mixins/groupsUtilities';
import bFormSelect from 'bootstrap-vue/lib/components/form-select';
// import { GUILDS_PER_PAGE } from 'common/script/constants';

export default {
  mixins: [groupUtilities],
  components: { PublicGuildItem, MugenScroll, Sidebar, bFormSelect },
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
          text: 'None',
          value: 'none',
        },
        {
          text: 'Member Count',
          value: 'member_count',
        },
        {
          text: 'Recent Activity',
          value: 'recent_activity',
        },
      ],
    };
  },
  created () {
    if (!this.$store.state.publicGuilds) this.fetchGuilds();
  },
  computed: {
    guilds () {
      return this.$store.state.publicGuilds;
    },
    filteredGuilds () {
      let search = this.search;
      let filters = this.filters;
      let user = this.$store.state.user.data;
      let filterGuild = this.filterGuild;
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
      let response = await this.$store.dispatch('guilds:getPublicGuilds', {page: this.lastPageLoaded});

      if (response.length === 0) this.hasLoadedAllGuilds = true;

      this.lastPageLoaded++;
      this.loading = false;
    },
  },
};
</script>
