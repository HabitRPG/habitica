<template>
  <b-modal id="hatching-modal">
    <div
      v-if="hatchablePet"
      class="content"
    >
      <div class="potionEggGroup">
        <div class="potionEggBackground">
          <div :class="'Pet_HatchingPotion_'+hatchablePet.potionKey"></div>
        </div>
        <div class="potionEggBackground">
          <div :class="'Pet_Egg_'+hatchablePet.eggKey"></div>
        </div>
      </div>
      <h4 class="title">
        {{ hatchablePet.name }}
      </h4>
      <div
        class="text"
        v-html="$t('hatchDialogText', {
          potionName: hatchablePet.potionName,
          eggName: hatchablePet.eggName, petName: hatchablePet.name })"
      ></div>
    </div>
    <span
      slot="modal-header"
      class="svg-icon icon-10"
      @click="closeHatchPetDialog()"
      v-html="icons.close"
    ></span>
    <div slot="modal-footer">
      <button
        class="btn btn-primary"
        @click="hatchPet(hatchablePet)"
      >
        {{ $t('hatch') }}
      </button>
      <button
        class="btn btn-secondary btn-flat"
        @click="closeHatchPetDialog()"
      >
        {{ $t('cancel') }}
      </button>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/mixins.scss';
  @import '~@/assets/scss/colors.scss';

  #hatching-modal {
    @include centeredModal();

    .modal-dialog {
      width: 310px;
    }

    .content {
      text-align: center;
      margin: 9px;
    }

    .title {
      margin-top: 24px;
      font-size: 20px;
      font-weight: bold;
      line-height: 1.2;
      text-align: center;
      color: $gray-50;
    }

    .text {
      height: auto;
      min-height: 60px;
      font-size: 14px;
      line-height: 1.43;
      text-align: center;
      color: $gray-100;
    }

    span.svg-icon.icon-10 {
      position: absolute;
      right: 10px;
      top: 10px;
    }

    .modal-footer {
      justify-content: center;
    }

    .potionEggGroup {
      margin: 0 auto;
    }

    .potionEggBackground {
      display: inline-flex;
      align-items: center;
      width: 112px;
      height: 112px;
      border-radius: 4px;
      background-color: $gray-700;

      &:first-child {
        margin-right: 24px;
      }

      div {
        margin: 0 auto;
      }
    }
  }
</style>

<script>
import svgClose from '@/assets/svg/close.svg';

import petMixin from '@/mixins/petMixin';

export default {
  mixins: [petMixin],
  props: ['hatchablePet'],
  data () {
    return {
      icons: Object.freeze({
        close: svgClose,
      }),
    };
  },
};
</script>
