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
        <div
          v-once
          class="svg-icon"
          v-html="icons.close"
        ></div>
      </div>
      <h2
        v-once
        class="mt-3 mb-4"
      >
        {{ $t('foundNewItems') }}
      </h2>
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
      <p
        v-once
        class="mt-4"
      >
        {{ $t('foundNewItemsExplanation') }}
      </p>
      <p
        v-once
        class="strong mb-4"
      >
        {{ $t('foundNewItemsCTA') }}
      </p>
      <button
        v-once
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
      return `Pet_Egg_${this.$store.state.firstDropsOptions.egg}`;
    },
    potionClass () {
      return `Pet_HatchingPotion_${this.$store.state.firstDropsOptions.hatchingPotion}`;
    },
  },
  methods: {
    close () {
      this.$store.state.firstDropsOptions = {
        egg: '',
        hatchingPotion: '',
      };
      this.$root.$emit('bv::hide::modal', 'first-drops');
    },
    toInventory () {
      this.$router.push('/inventory/items');
      this.close();
    },
  },
};
</script>
