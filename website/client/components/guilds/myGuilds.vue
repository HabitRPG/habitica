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

  .col-10.standard-page(v-if='filteredGuilds.length > 0')
    .row
      .col-md-12
        h1.page-header.float-left(v-once) {{ $t('myGuilds') }}
        b-form-select.float-right.sort-select(v-model='sort', :options='sortOptions')
    .row
      .col-md-12
        public-guild-item(v-for="guild in filteredGuilds", :key='guild._id', :guild="guild", :display-gem-bank='true')
        mugen-scroll(
          :handler="fetchGuilds",
          :should-handle="loading === false && hasLoadedAllGuilds === false",
          :handle-on-mount="false",
          v-show="hasLoadedAllGuilds === false",
        )
          span(v-once) {{ $t('loading') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';
  .sort-select {
    margin: 2em;
  }

  .no-guilds {
    text-align: center;
    color: $gray-200;
    margin-top: 15em;

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
import { mapState } from 'client/libs/store';
import groupUtilities from 'client/mixins/groupsUtilities';

import MugenScroll from 'vue-mugen-scroll';
import bFormSelect from 'bootstrap-vue/lib/components/form-select';

import PublicGuildItem from './publicGuildItem';
import Sidebar from './sidebar';

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
    this.fetchGuilds();
  },
  computed: {
    ...mapState({
      guilds: 'myGuilds',
    }),
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
