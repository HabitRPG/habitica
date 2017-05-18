<template lang="pug">
div
  h4.popover-content-title(v-once) {{ item.text() }}
  .popover-content-text(v-once) {{ item.notes() }}
  .popover-content-attr(v-for="attr in ATTRIBUTES", :key="attr", v-once)
    span.popover-content-attr-key(v-once) {{ `${$t(attr)}: ` }}
    span.popover-content-attr-val(v-once) {{ `+${item[attr]}` }}
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
