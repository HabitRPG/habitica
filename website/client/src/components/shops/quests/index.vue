<template>
  <div class="row quests">
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
        </filter-group>
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
      </filter-sidebar>
    </div>
    <div class="standard-page">
      <div class="featuredItems">
        <div
          class="background"
        ></div>
        <div
          class="background"
          :style="{'background-image': imageURLs.background}"
        >
          <div
            class="npc"
            :style="{'background-image': imageURLs.npc}"
          >
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
                  <quest-popover :item="item" />
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

  // these styles may be applied to other pages too

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
        background-repeat: no-repeat;

        .featured-label {
          position: absolute;
          bottom: -14px;
          margin: 0;
          left: 70px;
        }
      }
    }
  }
</style>

<script>
import find from 'lodash/find';
import _filter from 'lodash/filter';
import _sortBy from 'lodash/sortBy';
import _throttle from 'lodash/throttle';
import _groupBy from 'lodash/groupBy';
import _map from 'lodash/map';
import _each from 'lodash/each';
import * as stopword from 'stopword/dist/stopword.esm.mjs';
import { mapState } from '@/libs/store';

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
import FilterSidebar from '@/components/ui/filterSidebar';
import FilterGroup from '@/components/ui/filterGroup';
import SelectTranslatedArray from '@/components/tasks/modal-controls/selectTranslatedArray';
import QuestPopover from './questPopover';
import { worldStateMixin } from '@/mixins/worldState';

function splitMultipleDelims (text, delims) {
  const omniDelim = 'θνι';
  let workingText = text;
  for (const delim of delims) {
    workingText = workingText.replace(new RegExp(delim, 'g'), omniDelim);
  }
  return workingText.split(omniDelim);
}

function removeStopwordsFromText (text, language) {
  // list of supported languages https://www.npmjs.com/package/stopword
  const langs = {
    bg: stopword.bul,
    cs: stopword.ces,
    da: stopword.dan,
    de: stopword.deu,
    en: stopword.eng,
    en_GB: stopword.eng,
    'en@pirate': stopword.eng.concat(["th'"]),
    es: stopword.spa,
    es_419: stopword.spa,
    fr: stopword.fra,
    he: stopword.heb,
    hu: stopword.hun,
    id: stopword.ind,
    it: stopword.ita,
    ja: stopword.jpn,
    nl: stopword.nld,
    pl: stopword.pol,
    pt: stopword.por,
    pt_BR: stopword.porBr,
    ro: stopword.ron,
    ru: stopword.rus,
    sk: stopword.slv,
    // sr: stopword.,
    sv: stopword.swe,
    tr: stopword.tur,
    uk: stopword.ukr,
    zh: stopword.zho,
    zh_TW: stopword.zho,
  };
  const splitText = splitMultipleDelims(text, [' ', "'"]);
  return stopword.removeStopwords(splitText, langs[language] || stopword.eng).join(' ').toLowerCase();
}

export default {
  components: {
    QuestPopover,
    SelectTranslatedArray,
    FilterGroup,
    FilterSidebar,
    ShopItem,
    Item,
    CountBadge,
    ItemRows,
    toggleSwitch,

    BuyModal,
    PinBadge,
    QuestInfo,
  },
  mixins: [buyMixin, currencyMixin, pinUtils, worldStateMixin],
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
      currentEventList: 'worldState.data.currentEventList',
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
    imageURLs () {
      const currentEvent = find(this.currentEventList, event => Boolean(event.season));
      if (!currentEvent) {
        return {
          background: 'url(/static/npc/normal/quest_shop_background.png)',
          npc: 'url(/static/npc/normal/quest_shop_npc.png)',
        };
      }
      return {
        background: `url(/static/npc/${currentEvent.season}/quest_shop_background.png)`,
        npc: `url(/static/npc/${currentEvent.season}/quest_shop_npc.png)`,
      };
    },
  },
  watch: {
    searchText: _throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText.toLowerCase();
    }, 250),
  },
  async mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('quests'),
      section: this.$t('shops'),
    });
    await this.triggerGetWorldState();

    this.$root.$on('bv::modal::hidden', event => {
      if (event.componentId === 'buy-quest-modal') {
        this.$root.$emit('buyModal::hidden', this.selectedItemToBuy.key);
      }
    });
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
          if (category.identifier === 'pet' || category.identifier === 'hatchingPotion') {
            _each(result, item => {
              item.sortText = removeStopwordsFromText(item.text, this.user.preferences.language);
            });
            result = _sortBy(result, ['sortText']);
          } else {
            result = _sortBy(result, ['text']);
          }

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
    selectItem (item) {
      if (item.locked) return;
      this.selectedItemToBuy = item;

      this.$root.$emit('bv::show::modal', 'buy-quest-modal');
    },
  },
};
</script>
