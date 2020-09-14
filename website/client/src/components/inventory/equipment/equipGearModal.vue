<template>
  <b-modal
    v-if="item != null"
    id="equipgear-modal"
    :visible="true"
    :hide-header="true"
    :hide-footer="true"
    @change="onChange($event)"
  >
    <div class="close">
      <span
        class="svg-icon color"
        aria-hidden="true"
        @click="hideDialog()"
        v-html="icons.close"
      ></span>
    </div>
    <div
      v-if="item != null"
      class="content"
    >
      <div class="inner-content">
        <avatar
          :member="user"
          :avatar-only="true"
          :with-background="true"
          :hide-class-badge="true"
          :override-avatar-gear="memberOverrideAvatarGear(item)"
          :sprites-margin="'0px auto auto -1px'"
          :show-visual-buffs="false"
        />
        <h4 class="title mt-3">
          {{ itemText }}
        </h4>
        <div
          class="text"
          v-html="itemNotes"
        ></div>
        <span
          v-if="showClassTag"
          class="classTag mt-3"
        >
          <span
            class="svg-icon inline icon-24"
            v-html="icons[itemClass]"
          ></span>
          <span
            class="className textCondensed"
            :class="itemClass"
          >{{ getClassName(itemClass) }}</span>
        </span>
        <attributesGrid
          v-if="attributesGridVisible"
          class="attributesGrid"
          :user="user"
          :item="item"
        />
        <button
          class="btn"
          :class="{'btn-primary': !isEquipped, 'btn-secondary': isEquipped }"
          @click="equipItem()"
        >
          <span
            class="svg-icon color inline icon-16 mr-2"
            v-html="isEquipped ? icons.unEquip : icons.equip"
          ></span>
          <span class="button-label">
            {{ $t(isEquipped ? 'unequip' : 'equip') }}
          </span>
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

  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/modal.scss';

  #equipgear-modal {
    @include centeredModal();

    .modal-content {
      border-radius: 8px;
      box-shadow: 0 14px 28px 0 #1a181d3d, 0 10px 10px 0 #1a181d47;
    }

    .modal-body {
      padding: 2rem 1.5rem;
    }

    .close {
      position: absolute;
      top: 1.125rem;
      right: 1.125rem;
      width: 0.75rem;
      height: 0.75rem;
      cursor: pointer;
      opacity: 1;

      .svg-icon.color {
        color: $gray-200;
      }
    }

    .modal-dialog {
      width: 330px;
    }

    .text {
      font-size: 0.875rem;
      line-height: 1.71;
      text-align: center;
      color: $gray-50;
    }

    .content {
      text-align: center;
    }

    .item-wrapper {
      margin-bottom: 0 !important;
    }

    .inner-content {
      width: 282px;
    }

    .classTag {
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .className {
      height: 24px;
      font-size: 16px;
      line-height: 1.5;
      text-align: left;
      margin-left: 8px;
    }

    .healer {
      color: $healer-color;
    }

    .rogue {
      color: $rogue-color;
    }

    .warrior {
      color: $warrior-color;
    }

    .wizard {
      color: $wizard-color;
    }

    .attributesGrid {
      background-color: $gray-500;
      margin: 1.5rem 0;
    }

    .avatar {
      cursor: default;
      margin: 0 auto;

      .character-sprites span {
        left: 24px;
      }
    }

    button.btn {
      display: inline-flex;
      align-items: center;
    }

    .btn-primary .svg-icon.color {
      color: $purple-500;
    }

    .btn-secondary .svg-icon.color {
      color: $gray-200;
    }
  }
</style>

<script>
import { mapState } from '@/libs/store';

import svgClose from '@/assets/svg/close.svg';
import svgWarrior from '@/assets/svg/warrior.svg';
import svgWizard from '@/assets/svg/wizard.svg';
import svgRogue from '@/assets/svg/rogue.svg';
import svgHealer from '@/assets/svg/healer.svg';
import svgEquipIcon from '@/assets/svg/equip.svg';
import svgUnEquipIcon from '@/assets/svg/unequip.svg';

import Avatar from '@/components/avatar';
import attributesGrid from '@/components/inventory/equipment/attributesGrid.vue';

export default {
  components: {
    Avatar,
    attributesGrid,
  },
  props: {
    item: {
      type: Object,
    },
    priceType: {
      type: String,
    },
    costumeMode: {
      type: Boolean,
    },
    isEquipped: {
      type: Boolean,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        close: svgClose,
        warrior: svgWarrior,
        wizard: svgWizard,
        rogue: svgRogue,
        healer: svgHealer,
        equip: svgEquipIcon,
        unEquip: svgUnEquipIcon,
      }),
    };
  },
  computed: {
    ...mapState({
      content: 'content',
      user: 'user.data',
    }),
    showClassTag () {
      return this.content.classes.includes(this.itemClass);
    },
    itemText () {
      if (this.item.text instanceof Function) {
        return this.item.text();
      }
      return this.item.text;
    },
    itemNotes () {
      if (this.item.notes instanceof Function) {
        return this.item.notes();
      }
      return this.item.notes;
    },
    itemClass () {
      return this.item.klass || this.item.specialClass;
    },
    attributesGridVisible () {
      if (this.costumeMode) {
        return false;
      }

      return true;
    },
  },
  methods: {
    onChange ($event) {
      this.$emit('change', $event);
    },
    equipItem () {
      this.$emit('equipItem', this.item);
      this.hideDialog();
    },
    hideDialog () {
      this.$root.$emit('bv::hide::modal', 'equipgear-modal');
    },
    memberOverrideAvatarGear (gear) {
      return {
        [gear.type]: gear.key,
      };
    },
    getClassName (classType) {
      if (classType === 'wizard') {
        return this.$t('mage');
      }
      return this.$t(classType);
    },
  },
};
</script>
