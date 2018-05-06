<template lang="pug">
.keys-wrap
  shopItem(
    :key="keysToPets.key",
    :item="keysToPets",
    :emptyItem="false",
    popoverPosition="'top'",
    @click="releasePets()",
    v-if='userHasAllPets'
  )
  shopItem(
    :key="keysToMounts.key",
    :item="keysToMounts",
    :emptyItem="false",
    popoverPosition="'top'",
    @click="releaseMounts()",
    v-if='userHasAllMounts'
  )
  shopItem(
    :key="keysToBoth.key",
    :item="keysToBoth",
    :emptyItem="false",
    popoverPosition="'top'",
    @click="releaseBoth()",
    v-if='userHasAllPets && userHasAllMounts'
  )
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
    background-image: url('~assets/images/keys/key-to-the-pet-kennels.png');
    width: 68px;
    height: 68px;
  }

  .key_to_mounts {
    background-image: url('~assets/images/keys/key-to-the-mount-kennels.png');
    width: 68px;
    height: 68px;
  }

  .key_to_both {
    background-image: url('~assets/images/keys/keys-to-the-kennels.png');
    width: 68px;
    height: 68px;
  }
</style>

<script>
import { mapState } from 'client/libs/store';
import ShopItem from '../shopItem';

import count from 'common/script/count';

import notifications from 'client/mixins/notifications';

export default {
  mixins: [notifications],
  components: {
    ShopItem,
  },
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
          if (!confirm(this.$t('releasePetsConfirm'))) return;
          try {
            this.$store.dispatch('shops:releasePets', {user: this.user});
            this.text(this.$t('releasePetsSuccess'));
            // this.$router.push({name: 'stable'});
            // Reload because achievement is set in user.save instead of common
            window.location.reload(true);
          } catch (err) {
            alert(err.message);
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
          if (!confirm(this.$t('releaseMountsConfirm'))) return;
          try {
            this.$store.dispatch('shops:releaseMounts', {user: this.user});
            this.text(this.$t('releaseMountsSuccess'));
            // this.$router.push({name: 'stable'});
            // Reload because achievement is set in user.save instead of common
            window.location.reload(true);
          } catch (err) {
            alert(err.message);
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
          if (!confirm(this.$t('releaseBothConfirm'))) return;
          try {
            this.$store.dispatch('shops:releaseBoth', {user: this.user});
            this.text(this.$t('releaseBothSuccess'));
            // this.$router.push({name: 'stable'});
            // Reload because achievement is set in user.save instead of common
            window.location.reload(true);
          } catch (err) {
            alert(err.message);
          }
        },
      },
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    userHasAllPets () {
      return count.beastCount(this.user.items.pets) === 90;
    },
    userHasAllMounts () {
      return count.mountMasterProgress(this.user.items.mounts) === 90;
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
