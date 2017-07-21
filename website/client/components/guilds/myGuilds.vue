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
      .col-md-12
        h1.page-header.float-left(v-once) {{ $t('myGuilds') }}
        .float-right
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
import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';

import PublicGuildItem from './publicGuildItem';
import Sidebar from './sidebar';

import greyBadgeIcon from 'assets/svg/grey-badge.svg';

export default {
  mixins: [groupUtilities],
  components: { PublicGuildItem, MugenScroll, Sidebar, bFormSelect, bDropdown, bDropdownItem },
  data () {
    return {
      icons: Object.freeze({
        greyBadge: greyBadgeIcon,
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
  },
};
</script>
