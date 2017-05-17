<template lang="pug">
.row
  sidebar(v-on:search="updateSearch", v-on:filter="updateFilters")

  .col-10
    h2(v-once) {{ $t('myGuilds') }}
    public-guild-item(v-for="guild in filteredGuilds", :key='guild._id', :guild="guild")
    mugen-scroll(
      :handler="fetchGuilds",
      :should-handle="loading === false && hasLoadedAllGuilds === false",
      :handle-on-mount="false",
      v-show="hasLoadedAllGuilds === false",
    )
      span {{ $t('loading') }}
</template>

<script>
import MugenScroll from 'vue-mugen-scroll';
import PublicGuildItem from './publicGuildItem';
import Sidebar from './sidebar';
import groupUtilities from 'client/mixins/groupsUtilities';

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
      return this.$store.state.myGuilds;
    },
    filteredGuilds () {
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
      this.filters = eventData;
    },
    async fetchGuilds () {
      this.loading = true;
      await this.$store.dispatch('guilds:getMyGuilds', {page: this.lastPageLoaded});

      this.loading = false;
      this.hasLoadedAllGuilds = true;
    },
  },
};
</script>
