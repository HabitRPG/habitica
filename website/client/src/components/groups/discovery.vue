<template>
  <div class="row">
    <sidebar
      @search="updateSearch"
      @filter="updateFilters"
    />
    <div class="standard-page">
      <div class="header row">
        <div class="col-8">
          <h1
            v-once
            class="page-header float-left"
          >
            {{ $t('publicGuilds') }}
          </h1>
        </div>
        <div class="col-4">
          <!-- @TODO: Add when we implement recent activity
           .float-rightspan.dropdown-label {{ $t('sortBy') }}
b-dropdown(:text="$t('sort')", right=true)
          b-dropdown-item(v-for='sortOption in sortOptions',
           :key="sortOption.value", @click='sort(sortOption.value)') {{sortOption.text}}-->
          <button
            class="btn btn-secondary create-group-button float-right"
            @click="createGroup()"
          >
            <div
              class="svg-icon positive-icon"
              v-html="icons.positiveIcon"
            ></div>
            <span v-once>{{ $t('create') }}</span>
          </button>
        </div>
      </div>
      <div class="row">
        <div
          v-if="!loading && filteredGuilds.length === 0"
          class="no-guilds text-center col-md-6 offset-md-3"
        >
          <h2 v-once>
            {{ $t('noGuildsMatchFilters') }}
          </h2>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <public-guild-item
            v-for="guild in filteredGuilds"
            :key="guild._id"
            :guild="guild"
            :display-leave="true"
          />
          <mugen-scroll
            v-show="loading"
            :handler="triggerFetchGuilds"
            :should-handle="!loading && !hasLoadedAllGuilds"
            :handle-on-mount="true"
          >
            <span v-once>{{ $t('loading') }}</span>
          </mugen-scroll>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .sort-select {
    margin: 2em;
  }

  .positive-icon {
    color: $green-10;
    width: 10px;
    display: inline-block;
    margin-right: .5em;
  }

  .no-guilds {
    color: $gray-200;
    margin-top: 10em;

    h2 {
      color: $gray-200;
    }
  }
</style>

<script>
import MugenScroll from 'vue-mugen-scroll';
import debounce from 'lodash/debounce';
import PublicGuildItem from './publicGuildItem';
import Sidebar from './groupSidebar';
import groupUtilities from '@/mixins/groupsUtilities';

import positiveIcon from '@/assets/svg/positive.svg';

function _mapCategories (guilds) {
  guilds.forEach(guild => {
    if (!guild.categories) return;
    guild.categorySlugs = guild.categories.map(cat => {
      if (!cat) return undefined;
      return cat.slug;
    });
  });
}

export default {
  components: { PublicGuildItem, MugenScroll, Sidebar },
  mixins: [groupUtilities],
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
      const { search } = this;
      const { filters } = this;
      const user = this.$store.state.user.data;
      const { filterGuild } = this;
      // @TODO: Move this to the server
      return this.guilds.filter(guild => filterGuild(guild, filters, search, user));
    },
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('guildsDiscovery'),
      section: this.$t('guilds'),
    });
  },
  methods: {
    async updateSearch (eventData) {
      // this.search = eventData.searchTerm; @TODO: Probably don't need this anymore

      // Reset the page when filters are updated but not the other queries
      this.lastPageLoaded = 0;
      this.queryFilters.page = this.lastPageLoaded;

      this.queryFilters.search = eventData.searchTerm;

      const guilds = await this.$store.dispatch('guilds:getPublicGuilds', this.queryFilters);
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
      const filteringRole = eventData.roles && eventData.roles.length > 0;
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

      const guilds = await this.$store.dispatch('guilds:getPublicGuilds', this.queryFilters);
      _mapCategories(guilds);
      this.guilds = guilds;
    },
    triggerFetchGuilds () {
      this.loading = true;
      this.debounceFetchGuilds();
    },
    debounceFetchGuilds: debounce(function debounceFetchGuilds () {
      this.fetchGuilds();
    }, 1000),
    async fetchGuilds () {
      // We have the data cached
      if (this.lastPageLoaded === 0 && this.guilds.length > 0) {
        this.lastPageLoaded += 1;
      }

      this.queryFilters.page = this.lastPageLoaded;
      const guilds = await this.$store.dispatch('guilds:getPublicGuilds', this.queryFilters);
      if (guilds.length === 0) this.hasLoadedAllGuilds = true;

      _mapCategories(guilds);
      this.guilds.push(...guilds);

      this.lastPageLoaded += 1;
      this.loading = false;
    },
    createGroup () {
      this.$store.state.editingGroup = {};
      this.$root.$emit('bv::show::modal', 'guild-form');
    },
  },
};
</script>
