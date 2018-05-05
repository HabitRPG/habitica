<template lang="pug">
span.badge.badge-pill.badge-item.badge-star(
  :class="{'item-selected-badge': selected === true}",
  @click.stop="click",
  v-if="show",
) &#9733;
</template>

<style lang="scss">
@import '~client/assets/scss/colors.scss';

.badge-star {
  cursor: pointer;
  display: none;
  left: -9px;
  color: $gray-400;
  background: $white;
  padding: 4.5px 6px;

  &.item-selected-badge {
    display: block;
    background: $teal-50;
    color: $white;
  }
}

.item:hover > .badge-star {
  display: block;
}
</style>

<script>
  export default {
    props: {
      show: {
        type: Boolean,
      },
      selected: {
        type: Boolean,
      },
    },
    methods: {
      click () {
        this.$emit('click');
      },
    },
  };
</script>
