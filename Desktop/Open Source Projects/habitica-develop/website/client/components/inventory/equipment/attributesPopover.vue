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
    .popover-content-attr(v-for="attr in ATTRIBUTES", :key="attr")
      span.popover-content-attr-key {{ `${$t(attr)}: ` }}
      span.popover-content-attr-val {{ `+${item[attr]}` }}
</template>

<script>
  import { mapState } from 'client/libs/store';

  export default {
    props: {
      item: {
        type: Object,
      },
    },
    computed: {
      ...mapState({
        ATTRIBUTES: 'constants.ATTRIBUTES',
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
