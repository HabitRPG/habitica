<template lang="pug">
.row
  sidebar(v-on:search="updateSearch", v-on:filter="updateFilters")

  .no-guilds.standard-page(v-if='filteredGuilds.length === 0')
    .no-guilds-wrapper
      .svg-icon(v-html='icons.greyBadge')
      h2 {{$t('noGuildsTitle')}}
      p {{$t('noGuildsParagraph1')}}
      p {{$t('noGuildsParagraph2')}}
      span(v-if='loading') {{ $t('loading') }}

  .standard-page(v-if='filteredGuilds.length > 0')
    .row
      .col-md-8
        h1.page-header.float-left(v-once) {{ $t('myGuilds') }}
      .col-4
        button.btn.btn-secondary.create-group-button.float-right(@click='createGroup()')
          .svg-icon.positive-icon(v-html="icons.positiveIcon")
          span(v-once) {{$t('createGuild2')}}
        // @TODO: Add when we implement recent activity .float-right
          span.dropdown-label {{ $t('sortBy') }}
          b-dropdown(:text="$t('sort')", right=true)
            b-dropdown-item(v-for='sortOption in sortOptions', :key="sortOption.value", @click='sort(sortOption.value)') {{sortOption.text}}
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

      .svg-icon {
        width: 60px;
        margin: 0 auto;
      }
    }
  }

  @media only screen and (max-width: 768px) {
    .no-guilds-wrapper {
      width: 100% !important;
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
