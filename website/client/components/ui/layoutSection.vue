<template lang="pug">
div
  .clearfix
    h2.float-left.mb-3.filters-title {{ title }}

    .filters.float-right
      slot(name="filters")

  br

  slot(name="content")

</template>

<script>
    export default {
      props: {
        title: String,
      },
    };
</script>

<style scoped lang="scss">
 @media only screen and (max-width: 768px) {
    .filters, .filters-title {
      float: none;
      button {
        margin-right: 4em;
        margin-bottom: 1em;
      }
    }
  }
</style>
