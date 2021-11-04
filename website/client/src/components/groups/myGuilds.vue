<template>
  <div class="row">
    <sidebar
      @search="updateSearch"
      @filter="updateFilters"
    />
    <div class="standard-page">
      <div class="row">
        <div class="col-md-8 text-left">
          <h1
            v-once
            class="page-header"
          >
            {{ $t('myGuilds') }}
          </h1>
          <h2 v-if="loading && guilds.length === 0">
            {{ $t('loading') }}
          </h2>
        </div>
        <div class="col-4">
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
          <!-- @TODO: Add when we implement recent activity
          .float-rightspan.dropdown-label {{ $t('sortBy') }}
b-dropdown(:text="$t('sort')", right=true)
  b-dropdown-item(v-for='sortOption in sortOptions',
   :key="sortOption.value", @click='sort(sortOption.value)') {{sortOption.text}}
          -->
        </div>
      </div>
      <div class="row">
        <div
          v-if="!loading && guilds.length === 0"
          class="no-guilds text-center col-md-6 offset-md-3"
        >
          <div
            class="svg-icon"
            v-html="icons.greyBadge"
          ></div>
          <h2 v-once>
            {{ $t('noGuildsTitle') }}
          </h2>
          <p v-once>
            {{ $t('noGuildsParagraph1') }}
          </p>
          <p v-once>
            {{ $t('noGuildsParagraph2') }}
          </p>
        </div>
      </div>
      <div class="row">
        <div
          v-if="!loading && guilds.length > 0 && filteredGuilds.length === 0"
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
            :display-gem-bank="true"
          />
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

    .svg-icon {
      width: 88.7px;
      margin: 1em auto;
    }
  }
</style>

<script>
import { mapState } from '@/libs/store';
import groupUtilities from '@/mixins/groupsUtilities';

import PublicGuildItem from './publicGuildItem';
import Sidebar from './groupSidebar';

import greyBadgeIcon from '@/assets/svg/grey-badge.svg';
import positiveIcon from '@/assets/svg/positive.svg';

export default {
  components: { PublicGuildItem, Sidebar },
  mixins: [groupUtilities],
  data () {
    return {
      icons: Object.freeze({
        greyBadge: greyBadgeIcon,
        positiveIcon,
      }),
      loading: false,
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
    };
  },
  computed: {
    ...mapState({
      guilds: 'myGuilds',
    }),
    filteredGuilds () {
      const { search } = this;
      const { filters } = this;
      const user = this.$store.state.user.data;
      const { filterGuild } = this;
      return this.guilds.filter(guild => {
        if (guild.categories) {
          guild.categorySlugs = guild.categories.map(cat => cat.slug);
        }
        return filterGuild(guild, filters, search, user);
      });
    },
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('myGuilds'),
      section: this.$t('guilds'),
    });
  },
  created () {
    this.fetchGuilds();
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
      await this.$store.dispatch('guilds:getMyGuilds');
      this.loading = false;
    },
    createGroup () {
      this.$store.state.editingGroup = {};
      this.$root.$emit('bv::show::modal', 'guild-form');
    },
  },
};
</script>
