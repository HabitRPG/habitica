<template>
  <b-dropdown
    class="select-list"
    right="right"
    toggle-class="with-icon"
  >
    <template v-slot:button-content>
      <span
        class="svg-icon inline color"
        v-html="icons.unequipIcon"
      >
      </span>
      <span
        v-once
        class="button-label"
      >{{ $t('unequip') }}</span>
    </template>
    <b-dropdown-item
      class="selectListItem"
      @click="unequipBattleGear()"
    >
      {{ $t('battleGear') }}
    </b-dropdown-item>
    <b-dropdown-item
      class="selectListItem"
      @click="unequipCostume()"
    >
      {{ $t('costume') }}
    </b-dropdown-item>
    <b-dropdown-item
      class="selectListItem"
      @click="unequipPetMount()"
    >
      {{ $t('petAndMount') }}
    </b-dropdown-item>
    <b-dropdown-item
      class="selectListItem"
      @click="unequipBackground()"
    >
      {{ $t('background') }}
    </b-dropdown-item>
    <b-dropdown-item
      class="selectListItem"
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
  name: 'UnequipDropdown',
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

.select-list {
  ::v-deep {
    .dropdown-menu {
      min-width: 8rem; // instead of the normal 10
    }
  }
}

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
  margin-right: 0.5rem;
}

.button-label {
  width: 3.25rem;
  height: 1.5rem;
  font-size: 14px;
  font-weight: bold;
  line-height: 1.71;
}

</style>
