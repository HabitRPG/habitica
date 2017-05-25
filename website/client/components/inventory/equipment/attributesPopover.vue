<template lang="pug">
div
  h4.popover-content-title {{ item.text() }}
  .popover-content-text {{ item.notes() }}
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
    },
  };
</script>
