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
  import { mapState } from 'client/libs/store';
  import attributesGrid from './attributesGrid';
  import statsMixin from 'client/mixins/stats';

  export default {
    mixins: [statsMixin],
    components: {
      attributesGrid,
    },
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
        } else {
          return this.item.text;
        }
      },
      itemNotes () {
        if (this.item.notes instanceof Function) {
          return this.item.notes();
        } else {
          return this.item.notes;
        }
      },
    },
  };
</script>
