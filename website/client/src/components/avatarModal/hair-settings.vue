<template>
  <div
    id="hair"
    class="section customize-section"
  >
    <sub-menu
      class="text-center"
      :items="hairSubMenuItems"
      :active-sub-page="activeSubPage"
      @changeSubPage="changeSubPage($event)"
    />
    <div
      v-if="activeSubPage === 'color'"
      id="hair-color"
    >
      <customize-options
        :items="freeHairColors"
        :current-value="user.preferences.hair.color"
      />
      <!-- eslint-disable vue/no-use-v-if-with-v-for -->
      <div
        v-for="set in seasonalHairColors"
        v-if="editing && set.key !== 'undefined'"
        :key="set.key"
      >
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
        <customize-options
          :items="set.options"
          :current-value="user.preferences.hair.color"
          :full-set="!hideSet(set.key) && !userOwnsSet('hair', set.keys, 'color')"
          @unlock="unlock(`hair.color.${set.keys.join(',hair.color.')}`)"
        />
      </div>
    </div>
    <div
      v-if="activeSubPage === 'style'"
      id="style"
    >
      <!-- eslint-disable vue/require-v-for-key NO KEY AVAILABLE HERE -->
      <div v-for="set in styleSets">
        <customize-options
          :items="set.options"
          :full-set="set.fullSet"
          @unlock="set.unlock()"
        />
      </div>
      <!-- eslint-enable vue/require-v-for-key -->
    </div>
    <div
      v-if="activeSubPage === 'bangs'"
      id="bangs"
    >
      <customize-options
        :items="hairBangs"
        :current-value="user.preferences.hair.bangs"
      />
    </div>
    <div
      v-if="activeSubPage === 'facialhair'"
      id="facialhair"
    >
      <customize-options
        v-if="editing"
        :items="mustacheList"
      />
      <!-- eslint-disable max-len -->
      <customize-options
        v-if="editing"
        :items="beardList"
        :full-set="isPurchaseAllNeeded('hair', ['baseHair5', 'baseHair6'], ['mustache', 'beard'])"
        @unlock="unlock(`hair.mustache.${baseHair5Keys.join(',hair.mustache.')},hair.beard.${baseHair6Keys.join(',hair.beard.')}`)"
      />
      <!-- eslint-enable max-len -->
    </div>
  </div>
</template>

<script>
import groupBy from 'lodash/groupBy';
import appearance from '@/../../common/script/content/appearance';
import { subPageMixin } from '../../mixins/subPage';
import { userStateMixin } from '../../mixins/userState';
import { avatarEditorUtilies } from '../../mixins/avatarEditUtilities';
import subMenu from './sub-menu';
import customizeOptions from './customize-options';
import gem from '@/assets/svg/gem.svg';
import appearanceSets from '@/../../common/script/content/appearance/sets';

const hairColorBySet = groupBy(appearance.hair.color, 'set.key');
const freeHairColorKeys = hairColorBySet[undefined].map(s => s.key);

export default {
  components: {
    subMenu,
    customizeOptions,
  },
  mixins: [
    subPageMixin,
    userStateMixin,
    avatarEditorUtilies,
  ],
  props: [
    'editing',
  ],
  data () {
    return {
      freeHairColorKeys,
      icons: Object.freeze({
        gem,
      }),
      baseHair1: [1, 3],
      baseHair2Keys: [2, 4, 5, 6, 7, 8],
      baseHair3Keys: [9, 10, 11, 12, 13, 14],
      baseHair4Keys: [15, 16, 17, 18, 19, 20],
      baseHair5Keys: [1, 2],
      baseHair6Keys: [1, 2, 3],
    };
  },
  computed: {
    hairSubMenuItems () {
      const items = [
        {
          id: 'color',
          label: this.$t('color'),
        },
        {
          id: 'bangs',
          label: this.$t('bangs'),
        },
        {
          id: 'style',
          label: this.$t('style'),
        },
      ];

      if (this.editing) {
        items.push({
          id: 'facialhair',
          label: this.$t('facialhair'),
        });
      }

      return items;
    },
    freeHairColors () {
      return freeHairColorKeys.map(s => this.mapKeysToFreeOption(s, 'hair', 'color'));
    },
    seasonalHairColors () {
      // @TODO: For some resonse when I use $set on the user purchases object,
      // this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

      const seasonalHairColors = [];
      for (const key of Object.keys(hairColorBySet)) {
        const set = hairColorBySet[key];

        const keys = set.map(item => item.key);

        const options = keys.map(optionKey => {
          const option = this.mapKeysToOption(optionKey, 'hair', 'color', key);
          return option;
        });

        let text = this.$t(key);
        if (appearanceSets[key] && appearanceSets[key].text) {
          text = appearanceSets[key].text();
        }

        const compiledSet = {
          key,
          options,
          keys,
          text,
        };
        seasonalHairColors.push(compiledSet);
      }

      return seasonalHairColors;
    },
    premiumHairColors () {
      // @TODO: For some resonse when I use $set on the user purchases object,
      // this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      const keys = this.premiumHairColorKeys;
      const options = keys.map(key => this.mapKeysToOption(key, 'hair', 'color'));
      return options;
    },
    baseHair2 () {
      // @TODO: For some resonse when I use $set on the user purchases object,
      // this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      const keys = this.baseHair2Keys;
      const options = keys.map(key => this.mapKeysToOption(key, 'hair', 'base'));
      return options;
    },
    baseHair3 () {
      // @TODO: For some resonse when I use $set on the user purchases object,
      // this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      const keys = this.baseHair3Keys;
      const options = keys.map(key => {
        const option = this.mapKeysToOption(key, 'hair', 'base');
        return option;
      });
      return options;
    },
    baseHair4 () {
      // @TODO: For some resonse when I use $set on the user purchases object,
      // this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      const keys = this.baseHair4Keys;
      const options = keys.map(key => this.mapKeysToOption(key, 'hair', 'base'));
      return options;
    },
    baseHair5 () {
      // @TODO: For some resonse when I use $set on the user purchases object,
      // this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      const keys = this.baseHair5Keys;
      const options = keys.map(key => this.mapKeysToOption(key, 'hair', 'mustache'));
      return options;
    },
    baseHair6 () {
      // @TODO: For some resonse when I use $set on the user purchases object,
      // this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      const keys = this.baseHair6Keys;
      const options = keys.map(key => this.mapKeysToOption(key, 'hair', 'beard'));
      return options;
    },
    hairBangs () {
      const none = this.mapKeysToFreeOption(0, 'hair', 'bangs');
      none.none = true;

      const options = [1, 2, 3, 4].map(s => this.mapKeysToFreeOption(s, 'hair', 'bangs'));

      return [none, ...options];
    },
    mustacheList () {
      const noneOption = this.mapKeysToFreeOption(0, 'hair', 'mustache');
      noneOption.none = true;

      return [noneOption, ...this.baseHair5];
    },
    beardList () {
      const noneOption = this.mapKeysToFreeOption(0, 'hair', 'beard');
      noneOption.none = true;

      return [noneOption, ...this.baseHair6];
    },
    styleSets () {
      const sets = [];

      const emptyHairBase = {
        ...this.mapKeysToFreeOption(0, 'hair', 'base'),
        none: true,
      };

      sets.push({
        options: [
          emptyHairBase,
          ...this.baseHair1.map(key => this.mapKeysToFreeOption(key, 'hair', 'base')),
        ],
      });

      if (this.editing) {
        sets.push({
          fullSet: !this.userOwnsSet('hair', this.baseHair3Keys, 'base'),
          unlock: () => this.unlock(`hair.base.${this.baseHair3Keys.join(',hair.base.')}`),
          options: [
            ...this.baseHair3,
          ],
        });

        sets.push({
          fullSet: !this.userOwnsSet('hair', this.baseHair4Keys, 'base'),
          unlock: () => this.unlock(`hair.base.${this.baseHair4Keys.join(',hair.base.')}`),
          options: [
            ...this.baseHair4,
          ],
        });
      }

      if (this.editing) {
        sets.push({
          fullSet: !this.userOwnsSet('hair', this.baseHair2Keys, 'base'),
          unlock: () => this.unlock(`hair.base.${this.baseHair2Keys.join(',hair.base.')}`),
          options: [
            ...this.baseHair2,
          ],
        });
      }

      return sets;
    },
  },
  mounted () {
    this.changeSubPage('color');
  },
  methods: {
    /**
       * Allows you to find out whether you need the "Purchase All" button or not.
       * If there are more than 2 unpurchased items, returns true, otherwise returns false.
       * @param {string} category - The selected category.
       * @param {string[]} keySets - The items keySets.
       * @param {string[]} [types] - The items types (subcategories). Optional.
       * @returns {boolean} - Determines whether the "Purchase All" button
       * is needed (true) or not (false).
       */
    isPurchaseAllNeeded (category, keySets, types) {
      const purchasedItemsLengths = [];
      // If item types are specified, count them
      if (types && types.length > 0) {
        // Types can be undefined, so we must check them.
        types.forEach(type => {
          if (this.user.purchased[category][type]) {
            purchasedItemsLengths
              .push(Object.keys(this.user.purchased[category][type]).length);
          }
        });
      } else {
        let purchasedItemsCounter = 0;

        // If types are not specified, recursively
        // search for purchased items in the category
        const findPurchasedItems = item => {
          if (typeof item === 'object') {
            Object.values(item)
              .forEach(innerItem => {
                if (typeof innerItem === 'boolean' && innerItem === true) {
                  purchasedItemsCounter += 1;
                }
                return findPurchasedItems(innerItem);
              });
          }
          return purchasedItemsCounter;
        };

        findPurchasedItems(this.user.purchased[category]);
        if (purchasedItemsCounter > 0) {
          purchasedItemsLengths.push(purchasedItemsCounter);
        }
      }

      // We don't need to count the key sets (below)
      // if there are no purchased items at all.
      if (purchasedItemsLengths.length === 0) {
        return true;
      }

      const allItemsLengths = [];
      // Key sets must be specify correctly.
      keySets.forEach(keySet => {
        allItemsLengths.push(Object.keys(this[keySet]).length);
      });

      // Simply sum all the length values and
      // write them into variables for the convenience.
      const allItems = allItemsLengths.reduce((acc, val) => acc + val);
      const purchasedItems = purchasedItemsLengths.reduce((acc, val) => acc + val);

      const unpurchasedItems = allItems - purchasedItems;
      return unpurchasedItems > 2;
    },
  },
};
</script>

<style scoped>

</style>
