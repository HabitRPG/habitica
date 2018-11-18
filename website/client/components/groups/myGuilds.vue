<template lang="pug">
.row
  sidebar(v-on:search="updateSearch", v-on:filter="updateFilters")

  .standard-page
    .row
      .col-md-8.text-left
        h1.page-header(v-once) {{ $t('myGuilds') }}
        h2(v-if='loading && guilds.length === 0') {{ $t('loading') }}
      .col-4
        button.btn.btn-secondary.create-group-button.float-right(@click='createGroup()')
          .svg-icon.positive-icon(v-html="icons.positiveIcon")
          span(v-once) {{$t('createGuild2')}}
        // @TODO: Add when we implement recent activity .float-right
          span.dropdown-label {{ $t('sortBy') }}
          b-dropdown(:text="$t('sort')", right=true)
            b-dropdown-item(v-for='sortOption in sortOptions', :key="sortOption.value", @click='sort(sortOption.value)') {{sortOption.text}}

    .row
      .no-guilds.text-center.col-md-6.offset-md-3(v-if='!loading && guilds.length === 0')
        .svg-icon(v-html='icons.greyBadge')
        h2(v-once) {{$t('noGuildsTitle')}}
        p(v-once) {{$t('noGuildsParagraph1')}}
        p(v-once) {{$t('noGuildsParagraph2')}}

    .row
      .no-guilds.text-center.col-md-6.offset-md-3(v-if='!loading && guilds.length > 0 && filteredGuilds.length === 0')
        h2(v-once) {{$t('noGuildsMatchFilters')}}

    .row
      .col-md-12
        public-guild-item(v-for="guild in filteredGuilds", :key='guild._id', :guild="guild", :display-gem-bank='true')
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
import { mapState } from 'client/libs/store';
import groupUtilities from 'client/mixins/groupsUtilities';

import MugenScroll from 'vue-mugen-scroll';

import PublicGuildItem from './publicGuildItem';
import Sidebar from './sidebar';

import greyBadgeIcon from 'assets/svg/grey-badge.svg';
import positiveIcon from 'assets/svg/positive.svg';

export default {
  mixins: [groupUtilities],
  components: { PublicGuildItem, MugenScroll, Sidebar },
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
        if (guild.categories) {
          guild.categorySlugs = guild.categories.map(cat => {
            return cat.slug;
          });
        }
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
