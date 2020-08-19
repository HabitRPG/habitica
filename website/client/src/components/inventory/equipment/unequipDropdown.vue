<template>
  <b-dropdown
    right="right"
  >
     <template v-slot:button-content>
       <span class="svg-icon inline"
            v-html="icons.unequipIcon">
      </span>
      <span class="button-label" v-once>{{ $t('unequip') }}</span>
    </template>
    <b-dropdown-item
      @click="unequipBattleGear()"
    >
      {{ $t('battleGear') }}
    </b-dropdown-item>
    <b-dropdown-item
      @click="unequipCostume()"
    >
      {{ $t('costume') }}
    </b-dropdown-item>
    <b-dropdown-item
      @click="unequipPetMount()"
    >
      {{ $t('petAndMount') }}
    </b-dropdown-item>
    <b-dropdown-item
      @click="unequipBackground()"
    >
      {{ $t('background') }}
    </b-dropdown-item>
    <b-dropdown-item
      @click="unequipAllItems()"
    >
      {{ $t('allItems') }}
    </b-dropdown-item>
</b-dropdown>
</template>

<script>
import {
  UNEQUIP_ALL,
  UNEQUIP_COSTUME,
  UNEQUIP_EQUIPPED,
  UNEQUIP_BACKGROUND,
  UNEQUIP_PET_MOUNT,
} from '../../../../../common/script/ops/unequip';

import unequipIcon from '@/assets/svg/unequip.svg';

export default {
  name: 'unequipDropdown',
  data () {
    return {
      icons: Object.freeze({
        unequipIcon,
      }),
    };
  },
  methods: {
    unequipPetMountBackground () {
      this.$store.dispatch('user:unequip', {
        type: UNEQUIP_PET_MOUNT,
      });
    },
    unequipBattleGear () {
      this.$store.dispatch('user:unequip', {
        type: UNEQUIP_EQUIPPED,
      });
    },
    unequipCostume () {
      this.$store.dispatch('user:unequip', {
        type: UNEQUIP_COSTUME,
      });
    },
    unequipPetMount () {
      this.$store.dispatch('user:unequip', {
        type: UNEQUIP_PET_MOUNT,
      });
    },
    unequipBackground () {
      this.$store.dispatch('user:unequip', {
        type: UNEQUIP_BACKGROUND,
      });
    },
    unequipAllItems () {
      this.$store.dispatch('user:unequip', {
        type: UNEQUIP_ALL,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';

::v-deep {
  .btn {
    display: flex;
    align-items: center;

    &::after {
      margin-bottom: 0;
    }
  }
}

.svg-icon {
  width: 1rem;
  height: 1rem;
  color: $gray-200;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  margin-right: 0.5rem;
}

.button-label {
  width: 3.25rem;
  height: 1.5rem;
  font-size: 14px;
  font-weight: bold;
  line-height: 1.71;
  color: $gray-50;
}

</style>
