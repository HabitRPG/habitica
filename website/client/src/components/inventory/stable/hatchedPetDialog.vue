<template>
  <b-modal
    id="hatchedPet-modal"
    :hide-header="true"
  >
    <span
      class="close-icon svg-icon inline icon-10"
      @click="close()"
      v-html="icons.close"
    ></span>
    <div
      v-if="pet != null"
      class="content"
    >
      <div
        v-once
        class="dialog-header title"
      >
        {{ $t('hatchedPetGeneric') }}
      </div>
      <div class="inner-content">
        <div class="pet-background d-flex align-items-center">
          <div :class="pet.class"></div>
        </div>
        <h4 class="title">
          {{ pet.name }}
        </h4>
        <div
          v-if="!hideText"
          v-markdown="$t('hatchedPetHowToUse', { stableUrl: '/inventory/stable' })"
          class="text"
        ></div>
        <button
          class="btn btn-primary"
          @click="close()"
        >
          {{ $t('onward') }}
        </button>
      </div>
    </div>
    <div
      slot="modal-footer"
      class="clearfix"
    ></div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/mixins.scss';
  @import '~@/assets/scss/colors.scss';

  #hatchedPet-modal {
    @include centeredModal();

    .modal-dialog {
      width: 330px;
    }

    .modal-footer {
      padding-top: 0px;
    }

    .content {
      text-align: center;
    }

    .inner-content {
      margin: 24px auto auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .pet-background {
      width: 112px;
      height: 112px;
      border-radius: 4px;
      background-color: $gray-700;
    }

    .Pet {
      margin: auto;
    }

    .dialog-header {
      color: $purple-200;
      margin-top: 16px;
    }

    .text {
      margin-bottom: 24px;
      min-height: 0;

      &.markdown {
        p {
          margin-bottom: 0px;
        }
      }
    }
  }
</style>

<script>
import markdownDirective from '@/directives/markdown';
import svgClose from '@/assets/svg/close.svg';

export default {
  directives: {
    markdown: markdownDirective,
  },
  props: {
    hideText: {
      type: Boolean,
    },
  },
  data () {
    return {
      pet: null,
      icons: Object.freeze({
        close: svgClose,
      }),
    };
  },
  mounted () {
    this.$root.$on('hatchedPet::open', this.openDialog);
  },
  beforeDestroy () {
    this.$root.$off('hatchedPet::open', this.openDialog);
  },
  methods: {
    openDialog (item) {
      this.pet = item;
      this.$root.$emit('bv::show::modal', 'hatchedPet-modal');
    },
    close () {
      this.$emit('closed', this.item);
      this.$root.$emit('bv::hide::modal', 'hatchedPet-modal');
      this.pet = null;
    },
  },
};
</script>
