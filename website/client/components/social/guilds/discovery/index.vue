<template lang="pug">
.row
  .col-3
    .form-group
      input.form-control(type="text", :placeholder="$t('search')")
    
    form
      h3(v-once) {{ $t('filter') }}

      .form-group
        h5 Interests
        .form-check
          .label.form-check-label
            input.form-check-input(type="checkbox")
            span Habitica Official
        .form-check
          .label.form-check-label
            input.form-check-input(type="checkbox")
            span Nature
        .form-check
          .label.form-check-label
            input.form-check-input(type="checkbox")
            span Animals

  .col-9
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

<script>
import axios from 'axios';
import MugenScroll from 'vue-mugen-scroll';
import { mapState } from 'client/store';
import PublicGuildItem from './publicGuildItem';
import { GUILDS_PER_PAGE } from 'common/script/constants';

export default {
  components: { PublicGuildItem, MugenScroll },
  data () {
    return {
      loading: false,
      hasLoadedAllGuilds: false,
      lastPageLoaded: 0,
      guilds: [],
    };
  },
  computed: {
    ...mapState(['guilds']),
  },
  created () {
    this.fetchGuilds();
  },
  methods: {
    async fetchGuilds () {
      this.loading = true;
      let response = await axios.get('/api/v3/groups', {
        params: {
          type: 'publicGuilds',
          paginate: true,
          page: this.lastPageLoaded,
        },
      });
      let guilds = response.data.data;
      this.guilds.push(...guilds);
      if (guilds.length < GUILDS_PER_PAGE) this.hasLoadedAllGuilds = true;
      this.lastPageLoaded++;
      this.loading = false;
    },
  },
};
</script>
