<template lang="pug">
.row
  sidebar

  .col-10
    h2(v-once) {{ $t('publicGuilds') }}
    public-guild-item(v-for="guild in guilds", :key='guild._id', :guild="guild")
    mugen-scroll(
      :handler="fetchGuilds",
      :should-handle="loading === false && hasLoadedAllGuilds === false",
      :handle-on-mount="false",
      v-show="hasLoadedAllGuilds === false",
    )
      span loading...
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
import { mapState, mapGetters } from 'client/libs/store';
// import { GUILDS_PER_PAGE } from 'common/script/constants';

export default {
  components: { PublicGuildItem, MugenScroll, Sidebar },
  data () {
    return {
      loading: false,
      hasLoadedAllGuilds: false,
      lastPageLoaded: 0,
    };
  },
  created () {
    this.fetchGuilds();
  },
  computed: {
    guilds () {
      return this.$store.state.publicGuilds
    }
  },
  methods: {
    async fetchGuilds () {
      this.loading = true;
      await this.$store.dispatch('guilds:getPublicGuilds', {page: this.lastPageLoaded});

      // if (guilds.length < GUILDS_PER_PAGE) this.hasLoadedAllGuilds = true;
      // this.lastPageLoaded++;

      this.loading = false;
      this.hasLoadedAllGuilds = true;

      this.$store.state.publicGuilds.push({
        name: 'Test',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla scelerisque ultrices libero, ultricies pharetra metus. Sed vel vestibulum nibh. Vestibulum ultricies, lorem non bibendum consequat, nisl lacus semper nulla, hendrerit dignissim ipsum erat eu odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla at aliquet urna. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla non est ut nisl interdum tincidunt in eu dui. Proin condimentum a.',
        categories: [
          'one',
          'two',
          'three',
        ],
      });
    },
    filterGuilds () {

    },
  },
};
</script>
