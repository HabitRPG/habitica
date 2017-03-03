<template lang="pug">
.ui.grid
  .three.wide.column
    .ui.left.icon.input
      i.search.icon
      input(type="text", :placeholder="$t('search')")
    h3(v-once) {{ $t('filter') }}

    .ui.form
      h4 Interests
      .field
        .ui.checkbox
          input(type="checkbox")
          label(v-once) Habitica Official
      .field
        .ui.checkbox
          input(type="checkbox")
          label(v-once) Nature
      .field
        .ui.checkbox
          input(type="checkbox")
          label(v-once) Animals

  .thirteen.wide.column
    h2(v-once) {{ $t('publicGuilds') }}
    public-guild-item(v-for="guild in guilds", :key='guild._id', :guild="guild")
</template>

<script>
import { mapState, mapActions } from '../../../../store';
import PublicGuildItem from './publicGuildItem';

export default {
  components: { PublicGuildItem },
  computed: {
    ...mapState(['guilds']),
  },
  methods: {
    ...mapActions({
      fetchGuilds: 'guilds:fetchAll',
    }),
  },
  created () {
    if (!this.guilds) this.fetchGuilds();
  },
};
</script>
