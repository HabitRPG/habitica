<template>
  <b-modal
    :id="id"
    size="sm"
    :title="title"
    ok-only
    :ok-title="$t(buttonTextKey)"
    @ok="$emit('buttonClicked')"
    :footer-class="{ greyed: isGreyedSlotPresent}"
    :hide-footer="hideFooter"
    :static="disableLazyRender"
  >
    <slot></slot>

    <footer class="greyed" v-if="isGreyedSlotPresent && !hideFooter">
      <slot name="greyed"></slot>
    </footer>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/mixins.scss';

  .modal-dialog.modal-sm {
    @include smallModal();
  }
</style>


<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    buttonTextKey: {
      type: String,
      default: 'onwards',
    },
    hideFooter: Boolean,
  },
  data () {
    return { disableLazyRender: false };
  },
  computed: {
    isGreyedSlotPresent () {
      return Boolean(this.$slots.greyed);
    },
  },
};
</script>
