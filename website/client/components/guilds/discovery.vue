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
      span $t('loading') 
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
import intersection from 'lodash/intersection';
// import { GUILDS_PER_PAGE } from 'common/script/constants';

export default {
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
      return this.guilds.filter((guild) => {
        let passedSearch = true;
        let hasCategories = true

        if (search) {
          passedSearch = guild.name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
        }

        if (filters.categories && filters.categories.length > 0) {
          let intersectingCats = intersection(filters.categories, guild.categories);
          hasCategories = intersectingCats.length > 0;
        }

        return passedSearch && hasCategories;
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

      let response = await this.$store.dispatch('guilds:getPublicGuilds', {page: this.lastPageLoaded});

      if (response.length === 0) this.hasLoadedAllGuilds = true;

      this.lastPageLoaded++;
      this.loading = false;
    },
  },
};
</script>
