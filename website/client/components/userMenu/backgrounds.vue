<template lang="pug">
  .standard-page
    h1 {{ $t('backgrounds') }}
    div.customize-menu(v-for='set in backgroundShopSets')
      h2 {{set.text}}
      div(v-if='showPlainBackgroundBlurb(set.identifier, set.items)') {{ $t('incentiveBackgroundsUnlockedWithCheckins') }}
      div(v-if='!ownsSet("background", set.items) && set.identifier !== "incentiveBackgrounds"')
        //+gemCost(7)
        button.btn.btn-primary(@click='unlock(setKeys("background", set.items))') {{ $t('unlockSet', {cost: 15}) }}
         span.Pet_Currency_Gem1x.inline-gems
      button.customize-option(v-for='bg in set.items',
        type='button',
        :class='[`background_${bg.key}`, backgroundLockedStatus(bg.key)]',
        ng-click='unlock("background." + bg.key)',
        :popover-title='bg.text',
        :popover='bg.notes',
        popover-trigger='mouseenter')
        i.glyphicon.glyphicon-lock(ng-if='!user.purchased.background[bg.key]')
</template>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

  .customize-menu {
    margin-top: 4em;
    margin-bottom: 4em;
  }
</style>

<script>
import map from 'lodash/map';
import get from 'lodash/get';
import { mapState } from 'client/libs/store';

import { getBackgroundShopSets } from '../../../common/script/libs/shops';

export default {
  data () {
    let backgroundShopSets = getBackgroundShopSets();

    return {
      backgroundShopSets,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    showPlainBackgroundBlurb (identifier, set) {
      return identifier === 'incentiveBackgrounds' && !this.ownsSet('background', set);
    },
    ownsSet (type, set) {
      let setOwnedByUser = find(set, (value, key) => {
        if (type === 'background') key = value.key;
        return this.user.purchased[type][key];
      });

      return Boolean(setOwnedByUser);
    },
    /**
     * For gem-unlockable preferences, (a) if owned, select preference (b) else, purchase
     * @param path: User.preferences <-> User.purchased maps like User.preferences.skin=abc <-> User.purchased.skin.abc.
     *  Pass in this paramater as "skin.abc". Alternatively, pass as an array ["skin.abc", "skin.xyz"] to unlock sets
     */
    unlock (path) {
      let fullSet = path.indexOf(',') !== -1;
      let isBackground = Boolean(path.indexOf('background.'));

      let cost;

      if (isBackground) {
        cost = fullSet ? 3.75 : 1.75; // (Backgrounds) 15G per set, 7G per individual
      } else {
        cost = fullSet ? 1.25 : 0.5; // (Hair, skin, etc) 5G per set, 2G per individual
      }

      let loginIncentives = ['background.blue', 'background.green', 'background.red', 'background.purple', 'background.yellow', 'background.violet'];
      if (!loginIncentives.contains(loginIncentives)) {
        if (fullSet) {
          if (confirm(window.env.t('purchaseFor', {cost: cost * 4})) !== true) return;
          // @TODO: implement gem modal
          // if (this.user.balance < cost) return $rootScope.openModal('buyGems');
        } else if (!get(this.user, `purchased.${path}`)) {
          if (confirm(window.env.t('purchaseFor', {cost: cost * 4})) !== true) return;
          // @TODO: implement gem modal
          // if (this.user.balance < cost) return $rootScope.openModal('buyGems');
        }
      }
      // @TODO: Add when we implment the user calls
      // User.unlock({ query:{ path: path } });
    },
    setKeys (type, _set) {
      return map(_set, (v, k) => {
        if (type === 'background') k = v.key;
        return `${type}.${k}`;
      }).join(',');
    },
    backgroundLockedStatus (bgKey) {
      let backgroundClass = 'background-locked';
      if (this.user.purchased.background[bgKey]) backgroundClass = 'background-unlocked';
      return backgroundClass;
    },
  },
};
</script>
