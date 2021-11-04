<template>
  <div class="row seasonal">
    <div class="standard-sidebar d-none d-sm-block">
      <filter-sidebar>
        <div
          slot="search"
          class="form-group"
        >
          <input
            v-model="searchText"
            class="form-control input-search"
            type="text"
            :placeholder="$t('search')"
          >
        </div>
        <filter-group>
          <checkbox
            v-for="category in filterCategories"
            :id="`category-${category.key}`"
            :key="category.key"
            :checked.sync="viewOptions[category.key].selected"
            :text="category.value"
          />
        </filter-group>
        <div class="form-group clearfix">
          <h3
            v-once
            class="float-left"
          >
            {{ $t('hidePinned') }}
          </h3>
          <toggle-switch
            v-model="hidePinned"
            class="float-right"
          />
        </div>
      </filter-sidebar>
    </div>
    <div class="standard-page">
      <div class="featuredItems">
        <div
          class="background"
          :class="{opened: seasonal.opened}"
          :style="{'background-image': imageURLs.background}"
        >
          <div
            class="npc"
            :style="{'background-image': imageURLs.npc}"
          >
            <div class="featured-label">
              <span class="rectangle"></span>
              <span class="text">Leslie</span>
              <span class="rectangle"></span>
            </div>
          </div>
          <div
            v-if="!seasonal.opened"
            class="content"
          >
            <div class="featured-label with-border closed">
              <span class="rectangle"></span>
              <span
                class="text"
                v-html="seasonal.notes"
              ></span>
              <span class="rectangle"></span>
            </div>
          </div>
          <div
            v-else-if="seasonal.featured.items.length !== 0"
            class="content"
          >
            <div
              v-if="!featuredGearBought"
              class="featured-label with-border"
            >
              <span class="rectangle"></span>
              <span
                v-once
                class="text"
              >{{ $t('featuredset', { name: seasonal.featured.text }) }}</span>
              <span class="rectangle"></span>
            </div>
            <div
              v-else
              class="featured-label with-border"
            >
              <span class="rectangle"></span>
              <span
                v-once
                class="text"
              >{{ $t('featuredItems') }}</span>
              <span class="rectangle"></span>
            </div>
            <div class="items margin-center">
              <shopItem
                v-for="item in seasonal.featured.items"
                :key="item.key"
                :item="item"
                :price="item.value"
                :empty-item="false"
                :popover-position="'top'"
                :show-event-badge="false"
                @click="itemSelected(item)"
              >
                <template
                  slot="itemBadge"
                  slot-scope="ctx"
                >
                  <span
                    class="badge-top"
                    @click.prevent.stop="togglePinned(ctx.item)"
                  >
                    <pin-badge
                      :pinned="ctx.item.pinned"
                    />
                  </span>
                </template>
              </shopItem>
            </div>
          </div>
        </div>
      </div>
      <h1
        v-if="seasonal.opened"
        v-once
        class="mb-4 page-header"
      >
        {{ $t('seasonalShop') }}
      </h1>
      <div
        v-if="seasonal.opened"
        class="clearfix"
      >
        <h2 class="float-left mb-3">
          {{ $t('classArmor') }}
        </h2>
        <div class="float-right">
          <span class="dropdown-label">{{ $t('sortBy') }}</span>
          <select-translated-array
            :right="true"
            :value="selectedSortItemsBy"
            :items="sortItemsBy"
            :inline-dropdown="false"
            class="inline"
            @select="selectedSortItemsBy = $event"
          />
        </div>
      </div>
      <div
        v-for="(groupSets, categoryGroup) in getGroupedCategories(categories)"
        :key="categoryGroup"
      >
        <h3
          v-if="categoryGroup !== 'spells' && categoryGroup !== 'quests'"
          class="classgroup"
        >
          <span
            class="svg-icon inline"
            v-html="icons[categoryGroup]"
          ></span>
          <span
            class="name"
            :class="categoryGroup"
          >{{ getClassName(categoryGroup) }}</span>
        </h3>
        <div class="grouped-parent">
          <div
            v-for="category in groupSets"
            :key="category.identifier"
            class="group"
          >
            <h3>{{ category.text }}</h3>
            <div class="items">
              <!-- eslint-disable max-len -->
              <shopItem
                v-for="item in seasonalItems(category, selectedSortItemsBy, searchTextThrottled, viewOptions, hidePinned)"
                :key="item.key"
                :item="item"
                :price="item.value"
                :empty-item="false"
                :popover-position="'top'"
                :show-event-badge="false"
                @click="itemSelected(item)"
              >
                <!-- eslint-enable max-len -->
                <template
                  slot="itemBadge"
                  slot-scope="ctx"
                >
                  <span
                    class="badge-top"
                    @click.prevent.stop="togglePinned(ctx.item)"
                  >
                    <pin-badge
                      :pinned="ctx.item.pinned"
                    />
                  </span>
                </template>
              </shopItem>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable max-len -->
<style lang="scss">
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/variables.scss';

  // these styles may be applied to other pages too

  .featured-label {
    margin: 24px auto;
  }

  .group {
    display: inline-block;
    width: 50%;
    margin-bottom: 24px;

    .items {
      border-radius: 2px;
      background-color: #edecee;
      display: inline-block;
      padding: 8px;
    }

    .item-wrapper {
      margin-bottom: 0;
    }

    .items > div:not(:last-of-type) {
      margin-right: 16px;
    }
  }

  .seasonal {
    .standard-page {
      position: relative;
    }

    .badge-pin:not(.pinned) {
        display: none;
      }

    .item:hover .badge-pin {
      display: block;
    }

    h3.classgroup {
      line-height: 1.5;
      display: flex;
      align-items: center;

      span.svg-icon.inline {
        height: 24px;
        width: 24px;
        margin-right: 8px;
      }
    }

    .healer {
      color: #cf8229;
    }

    .rogue {
      color: #4f2a93;
    }

    .warrior {
      color: #b01515;
    }

    .wizard {
      color: #1f6ea2;
    }

    .featuredItems {
      height: 216px;

      .background {
        background-repeat: repeat-x;

        width: 100%;
        height: 216px;
        position: absolute;

        top: 0;
        left: 0;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .background.opened {
        background-repeat: repeat-x;
      }

      .content {
        display: flex;
        flex-direction: column;
      }

      .npc {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 216px;
        background-repeat: no-repeat;

        .featured-label {
          position: absolute;
          bottom: -14px;
          margin: 0;
          left: 60px;
        }
      }

      .opened .npc {
        background-repeat: no-repeat;
      }
    }
  }
</style>
<!-- eslint-enable max-len -->

<style scoped>
  .margin-center {
    margin: 0 auto;
  }
</style>

<script>
import _filter from 'lodash/filter';
import _map from 'lodash/map';
import _mapValues from 'lodash/mapValues';
import _forEach from 'lodash/forEach';
import _sortBy from 'lodash/sortBy';
import _throttle from 'lodash/throttle';
import _groupBy from 'lodash/groupBy';
import _reverse from 'lodash/reverse';
import { mapState } from '@/libs/store';

import Checkbox from '@/components/ui/checkbox';
import PinBadge from '@/components/ui/pinBadge';
import ShopItem from '../shopItem';
import toggleSwitch from '@/components/ui/toggleSwitch';
import buyMixin from '@/mixins/buy';
import currencyMixin from '../_currencyMixin';
import pinUtils from '@/mixins/pinUtils';

import svgWarrior from '@/assets/svg/warrior.svg';
import svgWizard from '@/assets/svg/wizard.svg';
import svgRogue from '@/assets/svg/rogue.svg';
import svgHealer from '@/assets/svg/healer.svg';

import isPinned from '@/../../common/script/libs/isPinned';
import getOfficialPinnedItems from '@/../../common/script/libs/getOfficialPinnedItems';

import i18n from '@/../../common/script/i18n';

import shops from '@/../../common/script/libs/shops';
import SelectTranslatedArray from '@/components/tasks/modal-controls/selectTranslatedArray';
import FilterSidebar from '@/components/ui/filterSidebar';
import FilterGroup from '@/components/ui/filterGroup';
import { getClassName } from '../../../../../common/script/libs/getClassName';
import { worldStateMixin } from '@/mixins/worldState';

export default {
  components: {
    SelectTranslatedArray,
    FilterGroup,
    FilterSidebar,
    Checkbox,
    PinBadge,
    ShopItem,
    toggleSwitch,
  },
  mixins: [buyMixin, currencyMixin, pinUtils, worldStateMixin],
  data () {
    return {
      viewOptions: {},
      searchText: null,
      searchTextThrottled: null,

      icons: Object.freeze({
        warrior: svgWarrior,
        wizard: svgWizard,
        rogue: svgRogue,
        healer: svgHealer,
      }),

      gearTypesToStrings: Object.freeze({ // TODO use content.itemList?
        weapon: i18n.t('weaponCapitalized'),
        shield: i18n.t('offHandCapitalized'),
        head: i18n.t('headgearCapitalized'),
        armor: i18n.t('armorCapitalized'),
        headAccessory: i18n.t('headAccessory'),
        body: i18n.t('body'),
        back: i18n.t('back'),
        eyewear: i18n.t('eyewear'),
      }),

      sortItemsBy: ['AZ'],
      selectedSortItemsBy: 'AZ',

      hidePinned: false,
      featuredGearBought: false,

      backgroundUpdate: new Date(),
    };
  },
  computed: {
    ...mapState({
      content: 'content',
      user: 'user.data',
      userStats: 'user.data.stats',
      currentEvent: 'worldState.data.currentEvent',
    }),

    usersOfficalPinnedItems () {
      return getOfficialPinnedItems(this.user);
    },

    seasonal () {
      // vue subscriptions, don't remove
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      const myUserVersion = this.user._v; // eslint-disable-line

      const seasonal = shops.getSeasonalShop(this.user);

      const itemsNotOwned = seasonal.featured.items
        .filter(item => !this.user.items.gear.owned[item.key]);
      seasonal.featured.items = _map(itemsNotOwned, e => ({
        ...e,
        pinned: isPinned(this.user, e, this.usersOfficalPinnedItems),
      }));

      // If we are out of gear, show the spells
      // @TODO: add dates to check instead?
      if (seasonal.featured.items.length === 0) {
        this.featuredGearBought = true; // eslint-disable-line vue/no-side-effects-in-computed-properties, max-len
        if (seasonal.categories.length > 0) {
          seasonal.featured.items = seasonal.featured.items.concat(seasonal.categories[0].items);
        }
      }

      return seasonal;
    },
    seasonalCategories () {
      return this.seasonal.categories;
    },
    categories () {
      if (this.seasonalCategories) {
        return _reverse(_sortBy(this.seasonalCategories, c => {
          if (c.event) {
            return c.event.start;
          }
          return -1;
        }));
      }
      return [];
    },
    filterCategories () {
      if (this.content) {
        const equipmentList = _mapValues(this.gearTypesToStrings, (value, key) => ({
          key,
          value,
        }));

        _forEach(equipmentList, value => {
          this.$set(this.viewOptions, value.key, {
            selected: false,
          });
        });

        return equipmentList;
      }
      return [];
    },

    anyFilterSelected () {
      return Object.values(this.viewOptions).some(g => g.selected);
    },
    imageURLs () {
      if (!this.seasonal.opened || !this.currentEvent || !this.currentEvent.season) {
        return {
          background: 'url(/static/npc/normal/seasonal_shop_closed_background.png)',
          npc: 'url(/static/npc/normal/seasonal_shop_closed_npc.png)',
        };
      }
      return {
        background: `url(/static/npc/${this.currentEvent.season}/seasonal_shop_opened_background.png)`,
        npc: `url(/static/npc/${this.currentEvent.season}/seasonal_shop_opened_npc.png)`,
      };
    },
  },
  watch: {
    searchText: _throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText.toLowerCase();
    }, 250),
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('seasonalShop'),
      section: this.$t('shops'),
    });

    this.$root.$on('buyModal::boughtItem', () => {
      this.backgroundUpdate = new Date();
    });

    this.triggerGetWorldState();
  },
  beforeDestroy () {
    this.$root.$off('buyModal::boughtItem');
  },
  methods: {
    getClassName (classType) {
      return this.$t(getClassName(classType));
    },
    seasonalItems (category, sortBy, searchBy, viewOptions, hidePinned) {
      let result = _map(category.items, e => ({
        ...e,
        pinned: isPinned(this.user, e, this.usersOfficalPinnedItems),
      }));

      result = _filter(result, i => {
        if (hidePinned && i.pinned) {
          return false;
        }

        if (this.anyFilterSelected && viewOptions[i.type] && !viewOptions[i.type].selected) {
          return false;
        }

        return !searchBy || i.text.toLowerCase().indexOf(searchBy) !== -1;
      });

      switch (sortBy) { // eslint-disable-line default-case
        case 'AZ': {
          result = _sortBy(result, ['text']);

          break;
        }
      }

      return result;
    },
    getGroupedCategories (categories) {
      const spellCategory = _filter(categories, c => c.identifier === 'spells')[0];

      const questsCategory = _filter(categories, c => c.identifier === 'quests')[0];

      const setCategories = _filter(categories, 'specialClass');

      const result = _groupBy(setCategories, 'specialClass');

      if (spellCategory) {
        result.spells = [
          spellCategory,
        ];
      }

      if (questsCategory) {
        result.quests = [
          questsCategory,
        ];
      }

      return result;
    },
    isGearLocked (gear) {
      if (gear.value > this.userStats.gp) {
        return true;
      }

      return false;
    },
    itemSelected (item) {
      this.$root.$emit('buyModal::showItem', item);
    },
  },
};
</script>
