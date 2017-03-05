<template lang="pug">
.row
  .sixteen.wide.column
    .ui.secondary.menu.center-content
      router-link.item(:to="{name: 'tavern'}")
        span(v-once) {{ $t('tavern') }}
      router-link.item(:to="{name: 'guilds'}")
        span(v-once) {{ $t('guilds') }}
      router-link.item(:to="{name: 'inbox'}")
        span(v-once) {{ $t('inbox') }}

  .sixteen.wide.column
    router-view
</template>

<script>
export default {};
</script>