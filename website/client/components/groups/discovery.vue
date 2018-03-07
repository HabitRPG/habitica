<template lang="pug">
.row
  sidebar(@search="updateSearch", @filter="updateFilters")

  .standard-page
    .header.row
      .col-8
        h1.page-header.float-left(v-once) {{ $t('publicGuilds') }}
      .col-4
        // @TODO: Add when we implement recent activity .float-right
          span.dropdown-label {{ $t('sortBy') }}
          b-dropdown(:text="$t('sort')", right=true)
            b-dropdown-item(v-for='sortOption in sortOptions', :key="sortOption.value", @click='sort(sortOption.value)') {{sortOption.text}}
        button.btn.btn-secondary.create-group-button.float-right(@click='createGroup()')
          .svg-icon.positive-icon(v-html="icons.positiveIcon")
          span(v-once) {{$t('createGuild2')}}
    .row
      .col-md-12
        public-guild-item(v-for="guild in filteredGuilds", :key='guild._id', :guild="guild", :display-leave='true')
        mugen-scroll(
          :handler="fetchGuilds",
          :should-handle="!loading && !this.hasLoadedAllGuilds",
          :handle-on-mount="true",
          v-show="loading",
        )
          span(v-once) {{ $t('loading') }}
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .sort-select {
    margin: 2em;
  }

  .positive-icon {
    color: $green-10;
    width: 10px;
    display: inline-block;
    margin-right: .5em;
  }
</style>

<script>
import MugenScroll from 'vue-mugen-scroll';
import PublicGuildItem from './publicGuildItem';
import Sidebar from './sidebar';
import groupUtilities from 'client/mixins/groupsUtilities';

import positiveIcon from 'assets/svg/positive.svg';

function _mapCategories (guilds) {
  guilds.forEach((guild) => {
    if (!guild.categories) return;
    guild.categorySlugs = guild.categories.map(cat => {
      if (!cat) return;
      return cat.slug;
    });
  });
}

export default {
  mixins: [groupUtilities],
  components: { PublicGuildItem, MugenScroll, Sidebar },
  data () {
    return {
      icons: Object.freeze({
        positiveIcon,
      }),
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
      queryFilters: {
        minMemberCount: 0,
        maxMemberCount: 0,
        leader: false,
        member: false,
        categories: '',
      },
    };
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
    async updateSearch (eventData) {
      // this.search = eventData.searchTerm; @TODO: Probably don't need this anymore

      // Reset the page when filters are updated but not the other queries
      this.lastPageLoaded = 0;
      this.queryFilters.page = this.lastPageLoaded;

      this.queryFilters.search = eventData.searchTerm;

      let guilds = await this.$store.dispatch('guilds:getPublicGuilds', this.queryFilters);
      _mapCategories(guilds);
      this.guilds = guilds;
    },
    async updateFilters (eventData) {
      // this.filters = eventData; @TODO: Probably don't need this anymore

      //  Reset all filters
      this.queryFilters = {
        minMemberCount: 0,
        maxMemberCount: 0,
        leader: false,
        member: false,
        categories: '',
      };

      // Reset the page when filters are updated
      this.lastPageLoaded = 0;
      this.hasLoadedAllGuilds = false;
      this.queryFilters.page = this.lastPageLoaded;

      this.queryFilters.categories = eventData.categories.join(',');

      // Role filters
      let filteringRole = eventData.roles && eventData.roles.length > 0;
      if (filteringRole && eventData.roles.indexOf('member') !== -1) {
        this.queryFilters.member = true;
      }

      if (filteringRole && eventData.roles.indexOf('guild_leader') !== -1) {
        this.queryFilters.leader = true;
      }

      // Size filters
      if (eventData.guildSize && eventData.guildSize.indexOf('gold_tier') !== -1) {
        this.queryFilters.minMemberCount = 1000;
        this.queryFilters.maxMemberCount = 0; // No max
      }

      if (eventData.guildSize && eventData.guildSize.indexOf('silver_tier') !== -1) {
        this.queryFilters.minMemberCount = 100;
        this.queryFilters.maxMemberCount = 999;
      }

      if (eventData.guildSize && eventData.guildSize.indexOf('bronze_tier') !== -1) {
        this.queryFilters.minMemberCount = 0; // No Min
        this.queryFilters.maxMemberCount = 99;
      }

      let guilds = await this.$store.dispatch('guilds:getPublicGuilds', this.queryFilters);
      _mapCategories(guilds);
      this.guilds = guilds;
    },
    async fetchGuilds () {
      // We have the data cached
      if (this.lastPageLoaded === 0 && this.guilds.length > 0) {
        this.lastPageLoaded += 1;
      }

      this.loading = true;
      this.queryFilters.page = this.lastPageLoaded;
      let guilds = await this.$store.dispatch('guilds:getPublicGuilds', this.queryFilters);
      if (guilds.length === 0) this.hasLoadedAllGuilds = true;

      _mapCategories(guilds);
      this.guilds.push(...guilds);

      this.lastPageLoaded++;
      this.loading = false;
    },
    createGroup () {
      this.$store.state.editingGroup = {};
      this.$root.$emit('bv::show::modal', 'guild-form');
    },
  },
};
</script>
