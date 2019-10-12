<template>
  <div>
    <div class="clearfix">
      <h2 class="float-left mb-3 filters-title">
        {{ title }}
      </h2>
      <div class="filters float-right">
        <slot name="filters"></slot>
      </div>
    </div>
    <br>
    <slot name="content"></slot>
  </div>
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
