<template>
  <b-modal
    id="first-drops"
    size="md"
    :hide-header="true"
    :hide-footer="true"
  >
    <div class="text-center">
      <div
        class="modal-close"
        @click="close()"
      >
        <div class="svg-icon" v-html="icons.close"></div>
      </div>
      <h2 class="mt-3 mb-4">{{ $t('foundNewItems') }}</h2>
      <div class="d-flex justify-content-center">
        <div
          class="item-box ml-auto mr-3"
          :class="eggClass"
        >
        </div>
        <div
          class="item-box mr-auto"
          :class="potionClass"
        >
        </div>
      </div>
      <p class="mt-4">{{ $t('foundNewItemsExplanation') }}</p>
      <p class="strong mb-4">{{ $t('foundNewItemsCTA') }}</p>
      <button
        class="btn btn-primary mb-2"
        @click="toInventory()"
      >
        {{ $t('letsgo') }}
      </button>
    </div>
  </b-modal>
</template>

<style lang="scss">
  #first-drops {
    .modal-body {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }

    .modal-dialog {
      margin-top: 15vh;
      width: 21rem;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  h2 {
    color: $purple-200;
  }

  .item-box {
    background-color: $gray-600;
  }

  .modal-close {
    position: absolute;
    width: 18px;
    height: 18px;
    padding: 4px;
    right: 16px;
    top: 16px;
    cursor: pointer;
    .svg-icon {
      width: 12px;
      height: 12px;
    }
  }

  .strong {
    font-weight: bold;
  }
</style>

<script>
import closeIcon from '@/assets/svg/close.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        close: closeIcon,
      }),
    };
  },
  computed: {
    eggClass () {
      return this.$store.state.firstDropsOptions.egg;
    },
    potionClass () {
      return this.$store.state.firstDropsOptions.potion;
    },
  },
  methods: {
    close () {
      this.$root.$emit('habitica::dismiss-modal', 'first-drops');
    },
    toInventory () {
      this.$router.push('/inventory/items');
      this.close();
    },
  },
};
</script>
