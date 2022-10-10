import moment from 'moment';
import axios from 'axios';

import get from 'lodash/get';
import unlock from '@/../../common/script/ops/unlock';
import buy from '@/../../common/script/ops/buy/buy';

import appearanceSets from '@/../../common/script/content/appearance/sets';

import { userStateMixin } from './userState';

export const avatarEditorUtilies = { // eslint-disable-line import/prefer-default-export
  mixins: [userStateMixin],
  data () {
    return {
      backgroundUpdate: new Date(),
    };
  },
  methods: {
    hideSet (setKey) {
      if (appearanceSets[setKey].availableFrom) {
        return !moment().isBetween(
          appearanceSets[setKey].availableFrom,
          appearanceSets[setKey].availableUntil,
        );
      }
      return moment(appearanceSets[setKey].availableUntil).isBefore(moment());
    },
    mapKeysToFreeOption (key, type, subType) {
      const userPreference = subType
        ? this.user.preferences[type][subType]
        : this.user.preferences[type];
      const pathKey = subType ? `${type}.${subType}` : `${type}`;

      const option = {};
      option.key = key;
      option.pathKey = pathKey;
      option.active = userPreference === key;
      option.class = this.createClass(type, subType, key);
      option.click = optionParam => (option.gemLocked ? this.unlock(`${optionParam.pathKey}.${key}`) : this.set({ [`preferences.${optionParam.pathKey}`]: optionParam.key }));
      return option;
    },
    mapKeysToOption (key, type, subType, set) {
      const option = this.mapKeysToFreeOption(key, type, subType);

      const userPurchased = subType
        ? this.user.purchased[type][subType]
        : this.user.purchased[type];
      const locked = !userPurchased || !userPurchased[key];
      let hide = false;

      if (set && appearanceSets[set] && locked) {
        hide = this.hideSet(set);
      }

      option.gemLocked = locked;
      option.hide = hide;
      if (locked) {
        option.gem = 2;
      }

      return option;
    },
    createClass (type, subType, key) {
      let str = `${type} ${subType} `;

      switch (type) {
        case 'shirt': {
          str += `${this.user.preferences.size}_shirt_${key}`;
          break;
        }
        case 'size': {
          str += `${key}_shirt_black`;
          break;
        }
        case 'hair': {
          if (subType === 'color') {
            str += `hair_bangs_1_${key}`; // todo get current hair-bang setting
          } else {
            str += `hair_${subType}_${key}_${this.user.preferences.hair.color}`;
          }
          break;
        }
        case 'skin': {
          str += `skin skin_${key}`;
          break;
        }
        default: {
          // `hair_base_${option.key}_${user.preferences.hair.color}`
          // console.warn('unknown type', type, key);
        }
      }

      return str;
    },
    userOwnsSet (type, setKeys, subType) {
      let owns = true;

      setKeys.forEach(key => {
        if (subType) {
          if (
            !this.user.purchased[type]
            || !this.user.purchased[type][subType]
            || !this.user.purchased[type][subType][key]
          ) owns = false;
          return;
        }
        if (!this.user.purchased[type][key]) owns = false;
      });

      return owns;
    },
    set (settings) {
      this.$store.dispatch('user:set', settings);
    },
    equip (key, type) {
      this.$store.dispatch('common:equip', { key, type });
    },
    /**
     * For gem-unlockable preferences, (a) if owned, select preference (b) else, purchase
     * @param path: User.preferences <-> User.purchased maps like
     *User.preferences.skin=abc <-> User.purchased.skin.abc.
     *  Pass in this paramater as "skin.abc". Alternatively, pass as an
     * array ["skin.abc", "skin.xyz"] to unlock sets
     */
    async unlock (path) {
      const fullSet = path.indexOf(',') !== -1;
      const isBackground = path.indexOf('background.') !== -1;

      let cost;

      if (isBackground) {
        cost = fullSet ? 3.75 : 1.75; // (Backgrounds) 15G per set, 7G per individual
      } else {
        cost = fullSet ? 1.25 : 0.5; // (Hair, skin, etc) 5G per set, 2G per individual
      }

      const loginIncentives = [
        'background.blue',
        'background.green',
        'background.red',
        'background.purple',
        'background.yellow',
        'background.violet',
      ];

      if (loginIncentives.indexOf(path) === -1) {
        if (fullSet) {
          if (window.confirm(this.$t('purchaseFor', { cost: cost * 4 })) !== true) return; // eslint-disable-line no-alert
          // @TODO: implement gem modal
          // if (this.user.balance < cost) return $rootScope.openModal('buyGems');
        } else if (!get(this.user, `purchased.${path}`)) {
          if (window.confirm(this.$t('purchaseFor', { cost: cost * 4 })) !== true) return; // eslint-disable-line no-alert
          // @TODO: implement gem modal
          // if (this.user.balance < cost) return $rootScope.openModal('buyGems');
        }
      }

      await axios.post(`/api/v4/user/unlock?path=${path}`);
      try {
        unlock(this.user, {
          query: {
            path,
          },
        });
        this.backgroundUpdate = new Date();
      } catch (e) {
        window.alert(e.message); // eslint-disable-line no-alert
      }
    },
    async buy (item) {
      const options = {
        currency: 'gold',
        key: item,
        type: 'marketGear',
        quantity: 1,
        pinType: 'marketGear',
      };
      await axios.post(`/api/v4/user/buy/${item}`, options);
      try {
        buy(this.user, {
          params: options,
        });
        this.backgroundUpdate = new Date();
      } catch (e) {
        window.alert(e.message); // eslint-disable-line no-alert
      }
    },
  },
};
