<template>
  <div class="sub-menu text-center">
    <div
      v-for="item of items"
      :key="item.id"
      class="sub-menu-item"
      :class="{active: activeSubPage === item.id}"
      @click="$emit('changeSubPage', item.id)"
    >
      <strong v-once>{{ item.label }}</strong>
    </div>
  </div>
</template>

<script>
export default {
  props: ['items', 'activeSubPage'],
};
</script>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  .sub-menu {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
    padding-top: 12px;
    flex-wrap: wrap;
  }

  .sub-menu:hover {
    cursor: pointer;
  }

  .sub-menu-item {
    padding: 6px 16px;
    text-align: center;
    border-bottom: 2px solid #f9f9f9;
    height: 32px;
    font-size: 12px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.67;
    letter-spacing: normal;
    text-align: center;
    color: $gray-100;
  }

  .sub-menu .sub-menu-item:hover, .sub-menu .sub-menu-item.active {
    color: $purple-200;
    border-bottom: 2px solid $purple-200;
  }
</style>
