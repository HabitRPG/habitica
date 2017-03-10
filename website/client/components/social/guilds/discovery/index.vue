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
