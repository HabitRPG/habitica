<template>
  <div class="card mt-2">
    <div class="card-header">
      <h3
        class="mb-0 mt-0"
        :class="{'open': expand}"
        @click="expand = !expand"
      >
        <slot name="title">
          {{ title }}
        </slot>
      </h3>
    </div>
    <div
      v-if="expand"
      class="card-body"
    >
      <slot></slot>
    </div>
    <div
      v-if="expand && onSave"
      class="card-footer"
    >
      <button
        class="btn btn-primary mt-1"
        @click="onSave"
      >
        {{ $t('save') }}
      </button>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    title: {
      type: String,
      required: false,
    },
    onSave: {
      type: Function,
      required: false,
    },
  },
  data () {
    return {
      expand: false,
    };
  },
};
</script>
