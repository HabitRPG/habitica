<template lang="pug">
.ui.clearing.raised.segment
  .ui.right.floated.button(:class="[isMember ? 'red' : 'green']") {{ isMember ? $t('leave') : $t('join') }}
  .floated
    // TODO v-once?
    h3.ui.header {{ guild.name }}
    p {{ guild.description }}
</template>

<script>
import { mapState } from '../../../../store';
import groupUtilities from '../../../../mixins/groupsUtilities';

export default {
  mixins: [groupUtilities],
  props: ['guild'],
  computed: {
    ...mapState(['user']),
    isMember () {
      return this.isMemberOfGroup(this.user, this.guild);
    },
  },
};
</script>