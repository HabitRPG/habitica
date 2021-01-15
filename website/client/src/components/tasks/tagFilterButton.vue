<template>
  <div
    class="col-6 d-flex tag"
    :class="{ editable, draggable }"
  >
    <span class="svg-icon inline drag-handle" v-html="icons.drag"></span>
    <input
      :id="checkBoxId"
      type="checkbox"
      :checked="selected"
      @change="toggle"
      :disabled="editable"
      :class="{ invisible: editable }"
    >
    <label
      :for="checkBoxId"
      v-markdown="tag.name"
      :class="{ 'd-none': editable }"
    ></label>
    <input
      v-model="tag.name"
      type="text"
      :disabled="!editable"
      :class="{ 'd-none': !editable }"
    >
    <a class="svg-icon inline remove-button" v-html="icons.destroy" @click="remove"></a>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .svg-icon {
    color: $gray-200;
    display: none;
    position: absolute;
  }

  .tag {
    margin: 4px 0;

    .drag-handle {
      cursor: grab;
      top: 2px;
      left: 6px;
      width: 24px;
      color: $gray-400;

      &:hover {
        color: $gray-200;
      }
    }

    input[type=checkbox] {
      margin: auto 7px;
    }

    input[type=text],label {
      margin: 0;
      padding: 5px 0 0 5px;
      height: 1.71rem;
      width: 100%;
    }

    input[type=text] {
      border: none;
      border-bottom: 1px solid $gray-500;

      &:focus {
        border-color: $purple-500 !important;
      }
    }

    .remove-button {
      top: 5px;
      right: 12px;
      width: 16px;
    }

    &:hover.editable {
      .remove-button {
        display: block;
      }

      &.draggable .drag-handle {
        display: block;
      }
    }
  }
</style>

<script>
import markdown from '@/directives/markdown';

import deleteIcon from '@/assets/svg/delete.svg';
import dragIcon from '@/assets/svg/drag_indicator.svg';

export default {
  directives: { markdown },
  props: {
    editable: Boolean,
    draggable: Boolean,
    selected: Boolean,
    tag: Object,
  },
  data () {
    return {
      icons: Object.freeze({
        destroy: deleteIcon,
        drag: dragIcon,
      }),
    };
  },
  computed: {
    checkBoxId () {
      return `tag-${this.tag.id}`;
    },
  },
  methods: {
    toggle () {
      this.$emit('toggle', this.tag);
    },
    remove () {
      this.$emit('remove', this.tag);
    },
  },
};
</script>
