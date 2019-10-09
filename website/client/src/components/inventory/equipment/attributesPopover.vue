<template lang="pug">
div
  div(v-if='item.locked')
    h4.popover-content-title {{ `${$t('lockedItem')}` }}
    .popover-content-text(v-if='item.specialClass') {{ `${$t('classLockedItem')}` }}
    .popover-content-text(v-else) {{ `${$t('tierLockedItem')}` }}
    p
  div(v-else)
    h4.popover-content-title {{ itemText }}
    .popover-content-text {{ itemNotes }}
    attributesGrid(:user="user", :item="item")
</template>

<style scoped>
  .popover-content-text {
    margin-bottom: 25px;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import attributesGrid from './attributesGrid';
import statsMixin from '@/mixins/stats';

export default {
  components: {
    attributesGrid,
  },
  mixins: [statsMixin],
  props: {
    item: {
      type: Object,
    },
  },
  computed: {
    ...mapState({
      ATTRIBUTES: 'constants.ATTRIBUTES',
      user: 'user.data',
    }),
    itemText () {
      if (this.item.text instanceof Function) {
        return this.item.text();
      }
      return this.item.text;
    },
    itemNotes () {
      if (this.item.notes instanceof Function) {
        return this.item.notes();
      }
      return this.item.notes;
    },
  },
};
</script>
