<template lang="pug">
.row
  sidebar
  .col-10
    h2(v-once) {{ $t('myGuilds') }}
    public-guild-item(v-for="guild in guilds", :key='guild._id', :guild="guild")
    mugen-scroll(
      :handler="fetchGuilds",
      :should-handle="loading === false && hasLoadedAllGuilds === false",
      :handle-on-mount="false",
      v-show="hasLoadedAllGuilds === false",
    )
      span loading...
</template>

<script>
import MugenScroll from 'vue-mugen-scroll';
import PublicGuildItem from './publicGuildItem';
import Sidebar from './sidebar';
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
      return this.$store.state.myGuilds;
    },
  },
  methods: {
    async fetchGuilds () {
      this.loading = true;
      await this.$store.dispatch('guilds:getMyGuilds', {page: this.lastPageLoaded});

      // if (guilds.length < GUILDS_PER_PAGE) this.hasLoadedAllGuilds = true;
      // this.lastPageLoaded++;

      this.loading = false;
      this.hasLoadedAllGuilds = true;
    },
  },
};
</script>
