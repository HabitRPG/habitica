<template lang="pug">
.row
  .sixteen.wide.column
    .ui.secondary.menu
      router-link.item(:to="{name: 'inventory'}", exact)
        span(v-once) {{ $t('inventory') }}
      router-link.item(:to="{name: 'equipment'}")
        span(v-once) {{ $t('equipment') }}
      router-link.item(:to="{name: 'stable'}")
        span(v-once) {{ $t('stable') }}

  .sixteen.wide.column
    router-view
</template>

<script>
export default {
};
</script>