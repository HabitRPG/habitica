<template lang="pug">
  b-modal#equipgear-modal(
    :visible="true",
    v-if="item != null",
    :hide-header="true",
    @change="onChange($event)"
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

        equipmentAttributesGrid.bordered(
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

    .bordered {
      border-radius: 2px;
      background-color: #f9f9f9;
      margin-bottom: 24px;
      padding: 24px 24px 10px;
    }

    .avatar {
      cursor: default;
      margin: 0 auto;

      .character-sprites span {
        left: 25px;
      }
    }

    .content-text {
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      font-weight: normal;
      line-height: 1.43;

      width: 400px;
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

  import Avatar from 'client/components/avatar';
  import EquipmentAttributesGrid from 'client/components/shops/market/equipmentAttributesGrid.vue';

  export default {
    components: {
      Avatar,
      EquipmentAttributesGrid,
    },
    data () {
      return {
        icons: Object.freeze({
          close: svgClose,
        }),
      };
    },
    computed: {
      ...mapState({
        content: 'content',
        user: 'user.data',
      }),
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
