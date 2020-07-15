<template>
  <div class="row quests">
    <div class="standard-sidebar d-none d-sm-block">
      <div class="form-group">
        <input
          v-model="searchText"
          class="form-control input-search"
          type="text"
          :placeholder="$t('search')"
        >
      </div>
      <div class="form">
        <h2 v-once>
          {{ $t('filter') }}
        </h2>
        <div class="form-group">
          <div
            v-for="category in categories"
            :key="category.identifier"
            class="form-check"
          >
            <div class="custom-control custom-checkbox">
              <input
                :id="`category-${category.identifier}`"
                v-model="viewOptions[category.identifier].selected"
                class="custom-control-input"
                type="checkbox"
              >
              <label
                v-once
                class="custom-control-label"
                :for="`category-${category.identifier}`"
              >{{ category.text }}</label>
            </div>
          </div>
        </div>
        <div class="form-group clearfix">
          <h3
            v-once
            class="float-left"
          >
            {{ $t('hideLocked') }}
          </h3>
          <toggle-switch
            v-model="hideLocked"
            class="float-right"
          />
        </div>
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
      </div>
    </div>
    <div class="standard-page">
      <div class="featuredItems">
        <div
          class="background"
          :class="{broken: broken}"
        ></div>
        <div
          class="background"
          :class="{cracked: broken, broken: broken}"
        >
          <div class="npc">
            <div class="featured-label">
              <span class="rectangle"></span>
              <span class="text">Ian</span>
              <span class="rectangle"></span>
            </div>
          </div>
          <div class="content">
            <div class="featured-label with-border">
              <span class="rectangle"></span>
              <span class="text">{{ shop.featured.text }}</span>
              <span class="rectangle"></span>
            </div>
            <div class="items margin-center">
              <shopItem
                v-for="item in shop.featured.items"
                :key="item.key"
                :item="item"
                :price="item.goldValue ? item.goldValue : item.value"
                :price-type="item.goldValue ? 'gold' : 'gem'"
                :item-content-class="'inventory_quest_scroll_'+item.key"
                :empty-item="false"
                :popover-position="'top'"
                @click="selectItem(item)"
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
        v-once
        class="mb-4 page-header"
      >
        {{ $t('quests') }}
      </h1>
      <div class="clearfix">
        <div class="float-right">
          <span class="dropdown-label">{{ $t('sortBy') }}</span>
          <b-dropdown
            :text="$t(selectedSortItemsBy)"
            right="right"
          >
            <b-dropdown-item
              v-for="sort in sortItemsBy"
              :key="sort"
              :active="selectedSortItemsBy === sort"
              @click="selectedSortItemsBy = sort"
            >
              {{ $t(sort) }}
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
      <!-- eslint-disable vue/no-use-v-if-with-v-for -->
      <div
        v-for="category in categories"
        v-if="!anyFilterSelected || viewOptions[category.identifier].selected"
        :key="category.identifier"
      >
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
        <h2 class="mb-3">
          {{ category.text }}
        </h2>
        <!-- eslint-disable max-len -->
        <itemRows
          v-if="category.identifier === 'pet'"
          :items="questItems(category, selectedSortItemsBy, searchTextThrottled, hideLocked, hidePinned)"
          :item-width="94"
          :item-margin="24"
          :type="'pet_quests'"
        >
          <!-- eslint-enable max-len -->
          <template
            slot="item"
            slot-scope="ctx"
          >
            <shopItem
              :key="ctx.item.key"
              :item="ctx.item"
              :price="ctx.item.value"
              :price-type="ctx.item.currency"
              :item-content-class="ctx.item.class"
              :empty-item="false"
              @click="selectItem(ctx.item)"
            >
              <span
                slot="popoverContent"
                slot-scope="ctx"
              >
                <div class="questPopover">
                  <h4 class="popover-content-title">{{ ctx.item.text }}</h4>
                  <questInfo :quest="ctx.item" />
                </div>
              </span>
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
                <countBadge
                  :show="userItems.quests[ctx.item.key] > 0"
                  :count="userItems.quests[ctx.item.key] || 0"
                />
              </template>
            </shopItem>
          </template>
        </itemRows>
        <div
          v-else-if="category.identifier === 'unlockable' || category.identifier === 'gold'"
          class="grouped-parent"
        >
          <!-- eslint-disable vue/no-use-v-if-with-v-for, max-len -->
          <div
            v-for="(items, key) in getGrouped(questItems(category, selectedSortItemsBy,searchTextThrottled, hideLocked, hidePinned))"
            :key="key"
            class="group"
          >
            <!-- eslint-enable vue/no-use-v-if-with-v-for, max-len -->
            <h3>{{ $t(key) }}</h3>
            <div class="items">
              <shopItem
                v-for="item in items"
                :key="item.key"
                :item="item"
                :price="item.value"
                :empty-item="false"
                :popover-position="'top'"
                :owned="!isNaN(userItems.quests[item.key])"
                @click="selectItem(item)"
              >
                <span slot="popoverContent">
                  <div class="questPopover">
                    <div></div>
                    <h4
                      v-if="item.locked"
                      class="popover-content-title"
                    >{{ `${$t('lockedItem')}` }}</h4>
                    <h4
                      v-else
                      class="popover-content-title"
                    >{{ item.text }}</h4>
                    <div
                      v-if="item.locked && item.key === 'lostMasterclasser1'"
                      class="popover-content-text"
                    >{{ `${$t('questUnlockLostMasterclasser')}` }}</div>
                    <div
                      v-if="item.locked && item.unlockCondition
                        && item.unlockCondition.incentiveThreshold"
                      class="popover-content-text"
                    >{{ `${$t('loginIncentiveQuest', {
                      count: item.unlockCondition.incentiveThreshold})}` }}</div>
                    <div
                      v-if="item.locked && item.previous && isBuyingDependentOnPrevious(item)"
                      class="popover-content-text"
                    >{{ `${$t('unlockByQuesting', {title: item.previous})}` }}</div>
                    <div
                      v-if="item.lvl > user.stats.lvl"
                      class="popover-content-text"
                    >{{ `${$t('mustLvlQuest', {level: item.lvl})}` }}</div>
                    <questInfo
                      v-if="!item.locked"
                      :quest="item"
                    />
                  </div>
                </span>
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
                  <countBadge
                    :show="userItems.quests[ctx.item.key] > 0"
                    :count="userItems.quests[ctx.item.key] || 0"
                  />
                </template>
              </shopItem>
            </div>
          </div>
        </div>
        <div
          v-else
          class="items"
        >
          <shopItem
            v-for="item in questItems(category, selectedSortItemsBy,
                                      searchTextThrottled, hideLocked, hidePinned)"
            :key="item.key"
            :item="item"
            :price="item.value"
            :empty-item="false"
            :popover-position="'top'"
            @click="selectItem(item)"
          >
            <span slot="popoverContent">
              <div class="questPopover">
                <h4 class="popover-content-title">{{ item.text }}</h4>
                <questInfo
                  :quest="item"
                  :popover-version="true"
                />
              </div>
            </span>
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
              <countBadge
                :show="userItems.quests[ctx.item.key] > 0"
                :count="userItems.quests[ctx.item.key] || 0"
              />
            </template>
          </shopItem>
        </div>
      </div>
    </div>
    <buyModal
      :item="selectedItemToBuy || {}"
      :price-type="selectedItemToBuy ? selectedItemToBuy.currency : ''"
      :with-pin="true"
      @change="resetItemToBuy($event)"
    >
      <template
        slot="item"
        slot-scope="ctx"
      >
        <item
          class="flat"
          :item="ctx.item"
          :item-content-class="ctx.item.class"
          :show-popover="false"
        />
      </template>
    </buyModal>
  </div>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/variables.scss';

  .featured-label {
    margin: 24px auto;
  }

  .group {
    display: inline-block;
    width: 33%;
    margin-bottom: 24px;
    vertical-align: top;

    .items {
      border-radius: 2px;
      background-color: #edecee;
      display: inline-block;
      padding: 0;
      margin-right: 12px;
    }

    .item-wrapper {
      margin-bottom: 0;
    }

    .items > div {
      margin: 8px;
    }
  }

  .quests {
    .standard-page {
      position: relative;
    }

    .badge-pin:not(.pinned) {
        display: none;
      }

    .item:hover .badge-pin {
      display: block;
    }

    .featuredItems {
      height: 216px;

      .background {
        background: url('~@/assets/images/npc/#{$npc_quests_flavor}/quest_shop_background.png');

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

      .content {
        display: flex;
        flex-direction: column;
      }

      .npc {
        width: 100%;
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        background: url('~@/assets/images/npc/#{$npc_quests_flavor}/quest_shop_npc.png');
        background-repeat: no-repeat;

        .featured-label {
          position: absolute;
          bottom: -14px;
          margin: 0;
          left: 70px;
        }
      }

      .background.broken {
        background: url('~@/assets/images/npc/broken/quest_shop_broken_background.png');

        background-repeat: repeat-x;
      }

      .background.cracked {
        background: url('~@/assets/images/npc/broken/quest_shop_broken_layer.png');

        background-repeat: repeat-x;
      }

      .broken .npc {
        background: url('~@/assets/images/npc/broken/quest_shop_broken_npc.png');
        background-repeat: no-repeat;
      }
    }
  }
</style>


<script>
import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';
import _throttle from 'lodash/throttle';
import _groupBy from 'lodash/groupBy';
import _map from 'lodash/map';
import { mapState, mapGetters } from '@/libs/store';

import ShopItem from '../shopItem';
import Item from '@/components/inventory/item';
import CountBadge from '@/components/ui/countBadge';
import ItemRows from '@/components/ui/itemRows';
import toggleSwitch from '@/components/ui/toggleSwitch';
import buyMixin from '@/mixins/buy';
import pinUtils from '@/mixins/pinUtils';
import currencyMixin from '../_currencyMixin';

import BuyModal from './buyQuestModal.vue';
import PinBadge from '@/components/ui/pinBadge';
import QuestInfo from './questInfo.vue';

import shops from '@/../../common/script/libs/shops';

import isPinned from '@/../../common/script/libs/isPinned';


export default {
  components: {
    ShopItem,
    Item,
    CountBadge,
    ItemRows,
    toggleSwitch,

    BuyModal,
    PinBadge,
    QuestInfo,
  },
  mixins: [buyMixin, currencyMixin, pinUtils],
  data () {
    return {
      viewOptions: {},

      searchText: null,
      searchTextThrottled: null,

      sortItemsBy: ['AZ', 'sortByNumber'],
      selectedSortItemsBy: 'AZ',

      selectedItemToBuy: null,

      hideLocked: false,
      hidePinned: false,
    };
  },
  computed: {
    ...mapState({
      content: 'content',
      user: 'user.data',
      userStats: 'user.data.stats',
      userItems: 'user.data.items',
    }),
    ...mapGetters({
      broken: 'worldState.brokenQuests',
    }),
    shop () {
      return shops.getQuestShop(this.user);
    },
    categories () {
      if (this.shop.categories) {
        this.shop.categories.forEach(category => {
          // do not reset the viewOptions if already set once
          if (typeof this.viewOptions[category.identifier] === 'undefined') {
            this.$set(this.viewOptions, category.identifier, {
              selected: false,
            });
          }
        });

        return this.shop.categories;
      }
      return [];
    },

    anyFilterSelected () {
      return Object.values(this.viewOptions).some(g => g.selected);
    },
  },
  watch: {
    searchText: _throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText.toLowerCase();
    }, 250),
  },
  async mounted () {
    await this.$store.dispatch('worldState:getWorldState');
  },
  methods: {
    questItems (category, sortBy, searchBy, hideLocked, hidePinned) {
      let result = _map(category.items, e => ({
        ...e,
        pinned: isPinned(this.user, e),
      }));

      result = _filter(result, i => {
        if (hideLocked && i.locked) {
          return false;
        }
        if (hidePinned && i.pinned) {
          return false;
        }

        return !searchBy || i.text.toLowerCase().indexOf(searchBy) !== -1;
      });

      switch (sortBy) { // eslint-disable-line default-case
        case 'AZ': {
          result = _sortBy(result, ['text']);

          break;
        }
        case 'sortByNumber': {
          result = _sortBy(result, ['value']);

          break;
        }
      }

      return result;
    },
    getGrouped (entries) {
      return _groupBy(entries, 'group');
    },
    resetItemToBuy ($event) {
      if (!$event) {
        this.selectedItemToBuy = null;
      }
    },
    isGearLocked (gear) {
      if (gear.value > this.userStats.gp) {
        return true;
      }

      return false;
    },
    selectItem (item) {
      this.selectedItemToBuy = item;

      this.$root.$emit('bv::show::modal', 'buy-quest-modal');
    },
    isBuyingDependentOnPrevious (item) {
      const questsNotDependentToPrevious = ['moon2', 'moon3'];
      if (item.key in questsNotDependentToPrevious) return false;
      return true;
    },
  },
};
</script>
