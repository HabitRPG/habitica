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
        @click="save"
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
      required: true,
    },
    onSave: {
      type: Function,
      default: null
    },
  },
  data () {
    return {
      expand: false,
    };
  },
  methods: {
    save () {
      this.expand = !this.expand;
      if (this.onSave) this.onSave();
    },
  }
};
</script>
