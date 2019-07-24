<template lang="pug">
  #hair.section.customize-section
    sub-menu.text-center(:items="hairSubMenuItems", :activeSubPage="activeSubPage", @changeSubPage="changeSubPage($event)")

    #hair-color(v-if='activeSubPage === "color"')
      customize-options.col-12(
        :items="freeHairColors",
        propertyToChange="preferences.hair.color",
        :currentValue="user.preferences.hair.color"
      )

      .row(v-if='editing && set.key !== "undefined"', v-for='set in seasonalHairColors')
        customize-options.col-12(
          v-if="!hideSet(set)",
          :items='set.options',
          propertyToChange="preferences.skin",
          :currentValue="user.preferences.skin",
          :fullSet='!userOwnsSet("hair", set.keys, "color")',
          @unlock='unlock(`hair.color.${set.keys.join(",hair.color.")}`)'
        )

    #style.row(v-if='activeSubPage === "style"')
      .row(v-if='editing && set.key !== "undefined"', v-for='set in styleSets')
        customize-options.col-12(
          :items='set.options',
          :fullSet='set.fullSet',
          @unlock='set.unlock()'
        )


      .col-12.customize-options(v-if='editing')
        .option(@click='set({"preferences.hair.base": 0})', :class="{ active: user.preferences.hair.base === 0 }")
          .head_0(:class="['hair_base_0_' + user.preferences.hair.color]")
        .option(v-for='option in baseHair3',
          :class='{active: option.active, locked: option.locked}')
          .base.sprite.customize-option(:class="`hair_base_${option.key}_${user.preferences.hair.color}`", @click='option.click')
          .gem-lock(v-if='option.locked')
            .svg-icon.gem(v-html='icons.gem')
            span 2
        .col-12.text-center(v-if='!userOwnsSet("hair", baseHair3Keys, "base")')
          .gem-lock
            .svg-icon.gem(v-html='icons.gem')
            span 5
          button.btn.btn-secondary.purchase-all(@click='unlock(`hair.base.${baseHair3Keys.join(",hair.base.")}`)') {{ $t('purchaseAll') }}
      .col-12.customize-options(v-if='editing')
        .option(v-for='option in baseHair4',
          :class='{active: option.active, locked: option.locked}')
          .base.sprite.customize-option(:class="`hair_base_${option.key}_${user.preferences.hair.color}`", @click='option.click')
          .gem-lock(v-if='option.locked')
            .svg-icon.gem(v-html='icons.gem')
            span 2
        .col-12.text-center(v-if='!userOwnsSet("hair", baseHair4Keys, "base")')
          .gem-lock
            .svg-icon.gem(v-html='icons.gem')
            span 5
          button.btn.btn-secondary.purchase-all(@click='unlock(`hair.base.${baseHair4Keys.join(",hair.base.")}`)') {{ $t('purchaseAll') }}
      .col-12.customize-options
        .option(v-if="!editing", @click='set({"preferences.hair.base": 0})', :class="{ active: user.preferences.hair.base === 0 }")
          .head_0(:class="['hair_base_0_' + user.preferences.hair.color]")
        .option(v-for='option in baseHair1',
          :class='{active: user.preferences.hair.base === option}')
          .base.sprite.customize-option(:class="`hair_base_${option}_${user.preferences.hair.color}`", @click='set({"preferences.hair.base": option})')
      .col-12.customize-options(v-if='editing')
        .option(v-for='option in baseHair2',
          :class='{active: option.active, locked: option.locked}')
          .base.sprite.customize-option(:class="`hair_base_${option.key}_${user.preferences.hair.color}`", @click='option.click')
          .gem-lock(v-if='option.locked')
            .svg-icon.gem(v-html='icons.gem')
            span 2
        .col-12.text-center(v-if='!userOwnsSet("hair", baseHair2Keys, "base")')
          .gem-lock
            .svg-icon.gem(v-html='icons.gem')
            span 5
          button.btn.btn-secondary.purchase-all(@click='unlock(`hair.base.${baseHair2Keys.join(",hair.base.")}`)') {{ $t('purchaseAll') }}
    #bangs.row(v-if='activeSubPage === "bangs"')
      customize-options.col-12(
        :items='hairBangs',
        propertyToChange="user.preferences.hair.bangs",
        :currentValue="user.preferences.hair.bangs"
      )
    #facialhair.row(v-if='activeSubPage === "facialhair"')
      .col-12.customize-options(v-if='editing')
        .head_0.option(@click='set({"preferences.hair.mustache": 0})', :class="[{ active: user.preferences.hair.mustache === 0 }, 'hair_base_0_' + user.preferences.hair.color]")
        .option(v-for='option in baseHair5',
          :class='{active: option.active, locked: option.locked}')
          .base.sprite.customize-option(:class="`hair_mustache_${option.key}_${user.preferences.hair.color}`", @click='option.click')
          .gem-lock(v-if='option.locked')
            .svg-icon.gem(v-html='icons.gem')
            span 2
      .col-12.customize-options(v-if='editing')
        .head_0.option(@click='set({"preferences.hair.beard": 0})', :class="[{ active: user.preferences.hair.beard === 0 }, 'hair_base_0_' + user.preferences.hair.color]")
        .option(v-for='option in baseHair6',
          :class='{active: option.active, locked: option.locked}')
          .base.sprite.customize-option(:class="`hair_beard_${option.key}_${user.preferences.hair.color}`", @click='option.click')
          .gem-lock(v-if='option.locked')
            .svg-icon.gem(v-html='icons.gem')
            span 2
        .col-12.text-center(v-if="isPurchaseAllNeeded('hair', ['baseHair5', 'baseHair6'], ['mustache', 'beard'])")
          .gem-lock
            .svg-icon.gem(v-html='icons.gem')
            span 5
          button.btn.btn-secondary.purchase-all(@click='unlock(`hair.mustache.${baseHair5Keys.join(",hair.mustache.")},hair.beard.${baseHair6Keys.join(",hair.beard.")}`)') {{ $t('purchaseAll') }}
</template>

<script>
  import appearance from 'common/script/content/appearance';
  import {subPageMixin} from '../../mixins/subPage';
  import {userStateMixin} from '../../mixins/userState';
  import {avatarEditorUtilies} from '../../mixins/avatarEditUtilities';
  import subMenu from './sub-menu';
  import customizeOptions from './customize-options';
  import gem from 'assets/svg/gem.svg';
  import appearanceSets from 'common/script/content/appearance/sets';
  import groupBy from 'lodash/groupBy';

  const hairColorBySet = groupBy(appearance.hair.color, 'set.key');
  const freeHairColorKeys = hairColorBySet[undefined].map(s => s.key);

  export default {
    props: [
      'editing',
    ],
    components: {
      subMenu,
      customizeOptions,
    },
    mixins: [
      subPageMixin,
      userStateMixin,
      avatarEditorUtilies,
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
        hairSubMenuItems: [
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
          {
            id: 'facialhair',
            label: this.$t('facialhair'),
          },
        ],
      };
    },
    computed: {
      freeHairColors () {
        return freeHairColorKeys.map(s => ({
          key: s,
          class: `hair_bangs_1_${s}`, // todo add current hair bangs setting
        }));
      },
      seasonalHairColors () {
        // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

        let seasonalHairColors = [];
        for (let key in hairColorBySet) {
          let set = hairColorBySet[key];

          let keys = set.map(item => {
            return item.key;
          });

          let options = keys.map(optionKey => {
            const option = this.mapKeysToOption(optionKey, 'hair', 'color', key);
            option.class = `hair_bangs_1_${option.key}`; // TODO hair bangs setting
            return option;
          });

          let text = this.$t(key);
          if (appearanceSets[key] && appearanceSets[key].text) {
            text = appearanceSets[key].text();
          }

          let compiledSet = {
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
        // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
        let keys = this.premiumHairColorKeys;
        let options = keys.map(key => {
          return this.mapKeysToOption(key, 'hair', 'color');
        });
        return options;
      },
      baseHair2 () {
        // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
        let keys = this.baseHair2Keys;
        let options = keys.map(key => {
          return this.mapKeysToOption(key, 'hair', 'base');
        });
        return options;
      },
      baseHair3 () {
        // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
        let keys = this.baseHair3Keys;
        let options = keys.map(key => {
          const option = this.mapKeysToOption(key, 'hair', 'base');
          option.class =  `hair_bangs_${key}_${this.user.preferences.hair.color}`;
          return option;
        });
        return options;
      },
      baseHair4 () {
        // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
        let keys = this.baseHair4Keys;
        let options = keys.map(key => {
          return this.mapKeysToOption(key, 'hair', 'base');
        });
        return options;
      },
      baseHair5 () {
        // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
        let keys = this.baseHair5Keys;
        let options = keys.map(key => {
          return this.mapKeysToOption(key, 'hair', 'mustache');
        });
        return options;
      },
      baseHair6 () {
        // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
        let keys = this.baseHair6Keys;
        let options = keys.map(key => {
          return this.mapKeysToOption(key, 'hair', 'beard');
        });
        return options;
      },
      hairBangs () {
        const none = {
          key: 0,
          none: true,
          class: `hair_bangs_0_${this.user.preferences.hair.color}`, // todo add current hair bangs setting
        };

        const options = [1, 2, 3, 4].map(s => ({
          key: s,
          class: `hair_bangs_${s}_${this.user.preferences.hair.color}`, // todo add current hair bangs setting
        }));

        return [none, ...options];
      },
      styleSets () {
        /*
        .col-12.customize-options(v-if='editing')
        .option(@click='set({"preferences.hair.base": 0})', :class="{ active: user.preferences.hair.base === 0 }")
          .head_0(:class="['hair_base_0_' + user.preferences.hair.color]")
        .option(v-for='option in baseHair3',
          :class='{active: option.active, locked: option.locked}')
          .base.sprite.customize-option(:class="`hair_base_${option.key}_${user.preferences.hair.color}`", @click='option.click')
          .gem-lock(v-if='option.locked')
            .svg-icon.gem(v-html='icons.gem')
            span 2
        .col-12.text-center(v-if='!userOwnsSet("hair", baseHair3Keys, "base")')
          .gem-lock
            .svg-icon.gem(v-html='icons.gem')
            span 5
          button.btn.btn-secondary.purchase-all(@click='') {{ $t('purchaseAll') }}

         */

        const sets = [];

        if (this.editing) {
          sets.push({
            fullSet: !this.userOwnsSet('hair', this.baseHair3Keys, 'base'),
            unlock: () => this.unlock(`hair.base.${this.baseHair3Keys.join(',hair.base.')}`),
            options: [
              {
                key: 0,
                none: true,
                active: this.user.preferences.hair.base === 0,
                class: `hair_bangs_0_${this.user.preferences.hair.color}`, // todo add current hair bangs setting
              },
              ...this.baseHair3,
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
       * Allows you to find out whether you need the "Purchase All" button or not. If there are more than 2 unpurchased items, returns true, otherwise returns false.
       * @param {string} category - The selected category.
       * @param {string[]} keySets - The items keySets.
       * @param {string[]} [types] - The items types (subcategories). Optional.
       * @returns {boolean} - Determines whether the "Purchase All" button is needed (true) or not (false).
       */
      isPurchaseAllNeeded (category, keySets, types) {
        const purchasedItemsLengths = [];
        // If item types are specified, count them
        if (types && types.length > 0) {
          // Types can be undefined, so we must check them.
          types.forEach((type) => {
            if (this.user.purchased[category][type]) {
              purchasedItemsLengths
                .push(Object.keys(this.user.purchased[category][type]).length);
            }
          });
        } else {
          let purchasedItemsCounter = 0;

          // If types are not specified, recursively
          // search for purchased items in the category
          const findPurchasedItems = (item) => {
            if (typeof item === 'object') {
              Object.values(item)
                .forEach((innerItem) => {
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
        keySets.forEach((keySet) => {
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
