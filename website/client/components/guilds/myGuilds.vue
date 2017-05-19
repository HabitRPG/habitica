<template lang="pug">
.row
  sidebar(v-on:search="updateSearch", v-on:filter="updateFilters")

  .col-10.no-guilds(v-if='filteredGuilds.length === 0')
    .no-guilds-wrapper
      img(src='~assets/guilds/grey-badge.svg')
      h2 {{$t('noGuildsTitle')}}
      p {{$t('noGuildsParagraph1')}}
      p {{$t('noGuildsParagraph2')}}
      span(v-if='loading') {{ $t('loading') }}

  .col-10(v-if='filteredGuilds.length > 0')
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

<style lang="scss" scoped>
.no-guilds {
  text-align: center;
  color: #878190;
  margin-top: 15em;

  h2 {
    font-size: 20px;
    font-weight: bold;
    font-stretch: condensed;
    line-height: 1.2;
    color: #878190;
  }

  p {
    font-size: 14px;
    line-height: 1.43;
  }

  .no-guilds-wrapper {
    width: 400px;
    margin: 0 auto;
  }
}
</style>

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
    // this.fetchGuilds();
  },
  computed: {
    guilds () {
      return this.$store.state.myGuilds;
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
      await this.$store.dispatch('guilds:getMyGuilds', {page: this.lastPageLoaded});

      this.loading = false;
      this.hasLoadedAllGuilds = true;
    },
  },
};
</script>
