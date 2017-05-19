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
    .row
      .col-md-12
        h2.float-left(v-once) {{ $t('myGuilds') }}
        b-form-select.float-right.sort-select(v-model='sort', :options='sortOptions')
    .row
      .col-md-12
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
.sort-select {
  margin: 2em;
}

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
import bFormSelect from 'bootstrap-vue/lib/components/form-select';

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
        {text: 'None', value: 'none'},
      ],
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
