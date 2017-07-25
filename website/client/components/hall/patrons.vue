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

export default {
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
    // @TODO: This is used to style usernames. WE should abstract this to helper mixer
    userLevelStyle (user, style) {
      style = style || '';
      let npc = user && user.backer && user.backer.npc ? user.backer.npc : '';
      let level = user && user.contributor && user.contributor.level ? user.contributor.level : '';
      style += this.userLevelStyleFromLevel(level, npc, style);
      return style;
    },
    userLevelStyleFromLevel (level, npc, style) {
      style = style || '';
      if (npc) style += ' label-npc';
      if (level) style +=   ` label-contributor-${level}`;
      return style;
    },
    //@TODO: Import member modal - clickMember()
  },
};
</script>
