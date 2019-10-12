<template>
  <b-modal
    v-if="item != null"
    id="equipgear-modal"
    :visible="true"
    :hide-header="true"
    @change="onChange($event)"
  >
    <div class="close">
      <span
        class="svg-icon inline icon-10"
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
          :override-avatar-gear="memberOverrideAvatarGear(item)"
          :sprites-margin="'0px auto auto -1px'"
          :show-visual-buffs="false"
        />
        <h4 class="title">
          {{ itemText }}
        </h4>
        <div
          class="text"
          v-html="itemNotes"
        ></div>
        <span
          v-if="showClassTag"
          class="classTag"
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
          class="btn btn-primary"
          @click="equipItem()"
        >
          {{ $t(isEquipped ? 'unequip' : 'equip') }}
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

    .modal-dialog {
      width: 330px;
    }

    .content {
      text-align: center;
    }

    .item-wrapper {
      margin-bottom: 0 !important;
    }

    .inner-content {
      margin: 33px auto auto;
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

      margin: 10px 0 24px;
    }

    .avatar {
      cursor: default;
      margin: 0 auto;

      .character-sprites span {
        left: 24px;
      }
    }

    button.btn.btn-primary {
      margin-top: 24px;
      margin-bottom: 24px;
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
