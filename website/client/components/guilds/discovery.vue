<template lang="pug">
.row
  sidebar(v-on:search="updateSearch", v-on:filter="updateFilters")

  .col-10
    h2(v-once) {{ $t('publicGuilds') }}
    public-guild-item(v-for="guild in filteredGuilds", :key='guild._id', :guild="guild")
    mugen-scroll(
      :handler="fetchGuilds",
      :should-handle="!loading && !this.hasLoadedAllGuilds",
      :handle-on-mount="false",
      v-show="loading",
    )
      span {{ $t('loading') }}
</template>

<style>
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
// import { GUILDS_PER_PAGE } from 'common/script/constants';

export default {
  mixins: [groupUtilities],
  components: { PublicGuildItem, MugenScroll, Sidebar },
  data () {
    return {
      loading: false,
      hasLoadedAllGuilds: false,
      lastPageLoaded: 0,
      search: '',
      filters: {},
    };
  },
  created () {
    this.fetchGuilds();
  },
  computed: {
    guilds () {
      return this.$store.state.publicGuilds;
    },
    filteredGuilds: function filteredGuilds () {
      let search = this.search;
      let filters = this.filters;
      let user = this.user;
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
      if (eventData.roles) this.filters.roles = eventData.roles;
      if (eventData.tier) this.filters.tier = eventData.tier;
      if (eventData.categories) this.filters.categories = eventData.categories;
    },
    async fetchGuilds () {
      this.loading = true;

      let response = await this.$store.dispatch('guilds:getPublicGuilds', {page: this.lastPageLoaded});

      if (response.length === 0) this.hasLoadedAllGuilds = true;

      this.lastPageLoaded++;
      this.loading = false;
    },
  },
};
</script>
