<template lang="pug">
.row
  small.muted {{ $t('blurbHallPatrons') }}
  .table-responsive
    table.table.table-striped(infinite-scroll="loadMore()")
      thead
        tr
          th {{ $t('name') }}
          th(v-if='user.contributor.admin') {{ $t('UUID') }}
          th {{ $t('backerTier') }}
      tbody
        tr(v-for='patron in patrons')
          td
            a.label.label-default(v-class='userLevelStyle(patron)', @click='clickMember(patron._id, true)')
            | {{patron.profile.name}}
          td(v-if='user.contributor.admin') {{patron._id}}
          td {{patron.backer.tier}}
</template>

<script>
import { mapState } from 'client/libs/store';
import styleHelper from 'client/mixins/styleHelper';

export default {
  mixins: [styleHelper],
  data () {
    return {
      patrons: [],
    };
  },
  async mounted () {
    this.patrons = await this.$store.dispatch('hall:getPatrons', { page: 0 });
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    //  @TODO: Import member modal - clickMember()
  },
};
</script>
