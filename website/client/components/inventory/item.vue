<!-- IMPORTANT
  All .item-container divs must be inside a .items div that 
  contains all of them in order to get the right margins. 
-->

<template lang="pug">
.item-container
  .item-inner-container
    span(:class="'shop_' + item.key")
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

.items {
  margin-bottom: 12px;
}

.item-container {
  display: inline-block;
  width: 94px;
  height: 92px;
  border-radius: 2px;
  background: $white;
  box-shadow: 0 2px 2px 0 rgba($black, 0.15), 0 1px 4px 0 rgba($black, 0.1);
  margin-right: 24px;
  margin-bottom: 12px;
}

.items > .item-container:last-of-type {
  margin-right: 0px;
}

.item-inner-container {
  width: 48px;
  height: 48px;
  margin: 0 auto;
  padding: 4px;
  margin-top: 22px;

  & span {
    display: block;
  }
}
</style>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
};
</script>