<template>
  <div class="keys-wrap">
    <shopItem
      v-if="userHasAllPets"
      :key="keysToPets.key"
      :item="keysToPets"
      :empty-item="false"
      popover-position="'top'"
      @click="releasePets()"
    />
    <shopItem
      v-if="userHasAllMounts"
      :key="keysToMounts.key"
      :item="keysToMounts"
      :empty-item="false"
      popover-position="'top'"
      @click="releaseMounts()"
    />
    <shopItem
      v-if="userHasAllPets && userHasAllMounts"
      :key="keysToBoth.key"
      :item="keysToBoth"
      :empty-item="false"
      popover-position="'top'"
      @click="releaseBoth()"
    />
  </div>
</template>

<style lang="scss" scoped>
  .keys-wrap {
    width: 400px;

    div {
      display: inline-block;
      margin-right: 24px;
    }
  }
</style>

<style>
  .key_to_pets {
    background-image: url('~@/assets/images/keys/key-to-the-pet-kennels.png');
    width: 68px;
    height: 68px;
  }

  .key_to_mounts {
    background-image: url('~@/assets/images/keys/key-to-the-mount-kennels.png');
    width: 68px;
    height: 68px;
  }

  .key_to_both {
    background-image: url('~@/assets/images/keys/keys-to-the-kennels.png');
    width: 68px;
    height: 68px;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import ShopItem from '../shopItem';

import { beastCount, mountMasterProgress } from '@/../../common/script/count';

import notifications from '@/mixins/notifications';

export default {
  components: {
    ShopItem,
  },
  mixins: [notifications],
  data () {
    // @TODO: should these be clases
    return {
      keysToPets: {
        key: 'keyToPets',
        text: this.$t('keyToPets'),
        notes: this.$t('keyToPetsDesc'),
        value: 4,
        currency: 'gems',
        class: 'key_to_pets',
        locked: false,
        purchaseType: 'keys',
        pinType: 'keys',
        buy: () => {
          if (!window.confirm(this.$t('releasePetsConfirm'))) return; // eslint-disable-line no-alert
          try {
            this.$store.dispatch('shops:releasePets', { user: this.user });
            this.text(this.$t('releasePetsSuccess'));
          } catch (err) {
            window.alert(err.message); // eslint-disable-line no-alert
          }
        },
      },
      keysToMounts: {
        key: 'keysToMounts',
        text: this.$t('keyToMounts'),
        notes: this.$t('keyToMountsDesc'),
        value: 4,
        currency: 'gems',
        class: 'key_to_mounts',
        locked: false,
        purchaseType: 'keys',
        pinType: 'keys',
        buy: () => {
          if (!window.confirm(this.$t('releaseMountsConfirm'))) return; // eslint-disable-line no-alert
          try {
            this.$store.dispatch('shops:releaseMounts', { user: this.user });
            this.text(this.$t('releaseMountsSuccess'));
          } catch (err) {
            window.alert(err.message); // eslint-disable-line no-alert
          }
        },
      },
      keysToBoth: {
        key: 'keysToBoth',
        text: this.$t('keyToBoth'),
        notes: this.$t('keyToBothDesc'),
        value: 0,
        currency: 'gems',
        class: 'key_to_both',
        locked: false,
        purchaseType: 'keys',
        pinType: 'keys',
        buy: () => {
          if (!window.confirm(this.$t('releaseBothConfirm'))) return; // eslint-disable-line no-alert
          try {
            this.$store.dispatch('shops:releaseBoth', { user: this.user });
            this.text(this.$t('releaseBothSuccess'));
          } catch (err) {
            window.alert(err.message); // eslint-disable-line no-alert
          }
        },
      },
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    userHasAllPets () {
      return beastCount(this.user.items.pets) === 90;
    },
    userHasAllMounts () {
      return mountMasterProgress(this.user.items.mounts) === 90;
    },
  },
  methods: {
    releasePets () {
      this.$root.$emit('buyModal::showItem', this.keysToPets);
    },
    releaseMounts () {
      this.$root.$emit('buyModal::showItem', this.keysToMounts);
    },
    releaseBoth () {
      this.$root.$emit('buyModal::showItem', this.keysToBoth);
    },
  },
};
</script>
