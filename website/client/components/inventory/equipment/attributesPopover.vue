<template lang="pug">
div
  h4.popover-content-title {{ itemText }}
  .popover-content-text {{ itemNotes }}
  .popover-content-attr(v-for="attr in ATTRIBUTES", :key="attr", v-once)
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
