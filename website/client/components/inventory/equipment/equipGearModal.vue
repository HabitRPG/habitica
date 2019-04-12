<template lang="pug">
  b-modal#equipgear-modal(
    :visible="true",
    v-if="item != null",
    :hide-header="true",
    @change="onChange($event)"
    @hide="fixDocBody()"
  )
    div.close
      span.svg-icon.inline.icon-10(aria-hidden="true", v-html="icons.close", @click="hideDialog()")

    div.content(v-if="item != null")

      div.inner-content
        avatar(
          :member="user",
          :avatarOnly="true",
          :withBackground="true",
          :overrideAvatarGear="memberOverrideAvatarGear(item)",
          :spritesMargin='"0px auto auto -1px"',
          :showVisualBuffs="false",
        )

        h4.title {{ itemText }}
        div.text(v-html="itemNotes")

        span.classTag(v-if="showClassTag")
          span.svg-icon.inline.icon-24(v-html="icons[itemClass]")
          span.className.textCondensed(:class="itemClass") {{ getClassName(itemClass) }}

        attributesGrid.attributesGrid(
          :user="user",
          :item="item",
          v-if="attributesGridVisible"
        )

        button.btn.btn-primary(@click="equipItem()") {{ $t(isEquipped ? 'unequip' : 'equip') }}

    div.clearfix(slot="modal-footer")
</template>

<style lang="scss">

  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/modal.scss';

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
        left: 25px;
      }
    }

    button.btn.btn-primary {
      margin-top: 24px;
      margin-bottom: 24px;
    }
  }
</style>

<script>
  import { mapState } from 'client/libs/store';

  import svgClose from 'assets/svg/close.svg';
  import svgWarrior from 'assets/svg/warrior.svg';
  import svgWizard from 'assets/svg/wizard.svg';
  import svgRogue from 'assets/svg/rogue.svg';
  import svgHealer from 'assets/svg/healer.svg';

  import Avatar from 'client/components/avatar';
  import attributesGrid from 'client/components/inventory/equipment/attributesGrid.vue';

  export default {
    components: {
      Avatar,
      attributesGrid,
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
        } else {
          return this.item.text;
        }
      },
      itemNotes () {
        if (this.item.notes instanceof Function) {
          return this.item.notes();
        } else {
          return this.item.notes;
        }
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
        } else {
          return this.$t(classType);
        }
      },
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
  };
</script>
