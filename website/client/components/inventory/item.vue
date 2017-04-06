<!-- IMPORTANT
  All .item-container divs must be inside a .items div that 
  contains all of them in order to get the right margins. 
-->

<template lang="pug">
.item-container
  span.item-selected-badge.badge.badge-pill(v-if="selected === true") &#9733;
  span(:class="'shop_' + item.key")
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

.items {
  margin-bottom: 12px;
}

.item-container {
  position: relative;
  display: inline-block;
  width: 94px;
  height: 92px;
  margin-right: 24px;
  margin-bottom: 12px;
  border-radius: 2px;
  background: $white;
  box-shadow: 0 2px 2px 0 rgba($black, 0.15), 0 1px 4px 0 rgba($black, 0.1);
  cursor: pointer;
}

.items > .item-container:last-of-type {
  margin-right: 0px;
}

.item-container > span[class^="shop_"] {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  padding: 4px;
  margin-top: 22px;
  display: block;
}

.item-selected-badge {
  position: absolute;
  top: -12px;
  left: -12px;
  background: $teal-50;
  padding: 2px 6px;
  color: $white;
}
</style>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
    selected: {
      type: Boolean,
      required: false,
    },
  },
};
</script>