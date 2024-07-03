<template>
  <div
    class="row"
  >
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

        <div class="form">
          <filter-group :title="$t('equipmentType')">
            <checkbox
              v-for="group in groups"
              :id="group.key"
              :key="group.key"
              :checked.sync="group.selected"
              :text="$t(group.key)"
            />
          </filter-group>
        </div>
      </filter-sidebar>
    </div>
    <div class="standard-page">
      <div class="clearfix">
        <h1
          v-once
          class="float-left mb-3 page-header"
        >
          {{ $t('items') }}
        </h1>
        <div class="float-right">
          <span class="dropdown-label">{{ $t('sortBy') }}</span>
          <select-translated-array
            :right="true"
            :items="['quantity', 'AZ']"
            :value="sortBy"
            class="inline"
            :inline-dropdown="false"
            @select="sortBy = $event"
          />
        </div>
      </div>

      <!-- eslint-disable vue/no-use-v-if-with-v-for -->
      <div
        v-for="group in groups"
        v-if="!anyFilterSelected || group.selected"
        :key="group.key"
      >
        <!-- eslint-enable vue/no-use-v-if-with-v-for -->
        <h2 class="d-flex align-items-center mb-3 sub-header">
          {{ $t(group.key) }}
          <span
            v-if="group.key != 'special'"
            class="badge badge-pill badge-default ml-2"
          >{{ group.quantity }}</span>
        </h2>
        <itemRows
          v-if="group.key === 'eggs'"
          :items="items[group.key]"
          :item-width="94"
          :item-margin="24"
          :type="group.key"
          :no-items-label="$t('noGearItemsOfType', { type: $t(group.key) })"
        >
          <template
            slot="item"
            slot-scope="context"
          >
            <item
              :key="context.item.key"
              v-drag.drop.hatch="context.item.key"
              :item="context.item"
              :item-content-class="context.item.class"
              :show-popover="currentDraggingEgg == null"
              :active="currentDraggingEgg == context.item"
              :highlight-border="isHatchable(currentDraggingPotion, context.item)"
              @itemDragOver="onDragOver($event, context.item)"
              @itemDropped="onDrop($event, context.item)"
              @itemDragLeave="onDragLeave()"
              @click="onEggClicked($event, context.item)"
            >
              <template
                slot="popoverContent"
                slot-scope="context"
              >
                <h4 class="popover-content-title">
                  {{ context.item.text }}
                </h4>
                <div
                  v-if="!currentDraggingPotion"
                  class="popover-content-text"
                >
                  {{ context.item.notes }}
                </div>
              </template>
              <template
                slot="itemBadge"
                slot-scope="context"
              >
                <countBadge
                  :show="true"
                  :count="context.item.quantity"
                />
              </template>
            </item>
          </template>
        </itemRows>
        <itemRows
          v-else-if="group.key === 'hatchingPotions'"
          :items="items[group.key]"
          :item-width="94"
          :item-margin="24"
          :type="group.key"
          :no-items-label="$t('noGearItemsOfType', { type: $t(group.key) })"
        >
          <template
            slot="item"
            slot-scope="context"
          >
            <item
              :key="context.item.key"
              v-drag.hatch="context.item.key"
              :item="context.item"
              :item-content-class="context.item.class"
              :show-popover="currentDraggingPotion == null"
              :active="currentDraggingPotion == context.item"
              :highlight-border="isHatchable(context.item, currentDraggingEgg)"
              @itemDragEnd="onDragEnd($event, context.item)"
              @itemDragStart="onDragStart($event, context.item)"
              @click="onPotionClicked($event, context.item)"
            >
              <template
                slot="popoverContent"
                slot-scope="context"
              >
                <h4 class="popover-content-title">
                  {{ context.item.text }}
                </h4>
                <div class="popover-content-text" v-if="!currentDraggingEgg">
                  {{ context.item.notes }}
                </div>
              </template>
              <template
                slot="itemBadge"
                slot-scope="context"
              >
                <countBadge
                  :show="true"
                  :count="context.item.quantity"
                />
              </template>
            </item>
          </template>
        </itemRows>
        <itemRows
          v-else
          :items="items[group.key]"
          :item-width="94"
          :item-margin="24"
          :type="group.key"
          :no-items-label="$t('noGearItemsOfType', { type: $t(group.key) })"
        >
          <template
            slot="item"
            slot-scope="context"
          >
            <item
              :key="context.item.key"
              :item="context.item"
              :item-content-class="context.item.class"
              :show-popover="currentDraggingPotion == null"
              @click="itemClicked(group.key, context.item)"
            >
              <template
                slot="popoverContent"
                slot-scope="context"
              >
                <div
                  v-if="group.key === 'quests'"
                  class="questPopover"
                >
                  <h4 class="popover-content-title">
                    {{ context.item.text }}
                  </h4>
                  <questInfo
                    :quest="context.item"
                    :purchased="true"
                  />
                </div>
                <div v-else>
                  <h4 class="popover-content-title">
                    {{ context.item.text }}
                  </h4>
                  <div
                    class="popover-content-text"
                    v-html="context.item.notes"
                  ></div>
                </div>
              </template>
              <template
                slot="itemBadge"
                slot-scope="context"
              >
                <countBadge
                  :show="true"
                  :count="context.item.quantity"
                />
              </template>
            </item>
          </template>
        </itemRows>
      </div>
    </div>
    <hatchedPetDialog />
    <ItemPopover
      :dragged-item="currentDraggingEgg"
      popoverTextKey="clickOnPotionToHatch"
      translationKey="eggName" />
    <ItemPopover
      :dragged-item="currentDraggingPotion"
      popoverTextKey="clickOnEggToHatch"
      translationKey="potionName" />
    <questDetailModal :group="user.party" />
    <cards-modal :card-options="cardOptions" />
  </div>
</template>

<script>
import each from 'lodash/each';
import throttle from 'lodash/throttle';
import moment from 'moment';
import ItemPopover from '@/components/inventory/itemPopover';
import Item from '@/components/inventory/item';
import ItemRows from '@/components/ui/itemRows';
import CountBadge from '@/components/ui/countBadge';
import FilterSidebar from '@/components/ui/filterSidebar';

import cardsModal from './cards-modal';

import HatchedPetDialog from '../stable/hatchedPetDialog';
import questDetailModal from '../../groups/questDetailModal';
import QuestInfo from '../../shops/quests/questInfo.vue';

import { mapState } from '@/libs/store';
import { createAnimal } from '@/libs/createAnimal';

import notifications from '@/mixins/notifications';
import DragDropDirective from '@/directives/dragdrop.directive';
import FilterGroup from '@/components/ui/filterGroup';
import Checkbox from '@/components/ui/checkbox';
import SelectTranslatedArray from '@/components/tasks/modal-controls/selectTranslatedArray';

const allowedSpecialItems = ['snowball', 'spookySparkles', 'shinySeed', 'seafoam'];

const groups = [
  ['eggs', 'Pet_Egg_'],
  ['hatchingPotions', 'Pet_HatchingPotion_'],
  ['food', 'Pet_Food_'],
  ['special', 'inventory_special_', allowedSpecialItems],
  ['quests', 'inventory_quest_scroll_'],
].map(([group, classPrefix, allowedItems]) => ({
  key: group,
  quantity: 0,
  selected: false,
  classPrefix,
  allowedItems,
}));

export default {
  name: 'Items',
  components: {
    SelectTranslatedArray,
    Checkbox,
    FilterGroup,
    Item,
    ItemRows,
    HatchedPetDialog,
    CountBadge,
    questDetailModal,
    cardsModal,
    QuestInfo,
    FilterSidebar,
    ItemPopover,
  },
  directives: {
    drag: DragDropDirective,
  },
  mixins: [notifications],
  data () {
    return {
      searchText: null,
      searchTextThrottled: null,
      groups,
      sortBy: 'quantity', // or 'AZ'

      currentDraggingEgg: null,
      currentDraggingPotion: null,
      cardOptions: {
        cardType: '',
        messageOptions: 0,
      },
      quantitySnapshot: {
        eggs: null,
        hatchingPotions: null,
        food: null,
      },
    };
  },
  computed: {
    ...mapState({
      content: 'content',
      user: 'user.data',
    }),
    items () {
      const searchText = this.searchTextThrottled;
      const itemsByType = {};

      this.groups.forEach(group => {
        const groupKey = group.key;
        group.quantity = 0; // resetf the count
        itemsByType[groupKey] = [];
        const itemsArray = itemsByType[groupKey];
        const contentItems = this.content[groupKey];

        each(this.user.items[groupKey], (itemQuantity, itemKey) => {
          const isAllowed = !group.allowedItems || group.allowedItems.indexOf(itemKey) !== -1;

          if (itemQuantity > 0 && isAllowed) {
            const item = contentItems[itemKey];

            const isSearched = !searchText || item.text()
              .toLowerCase()
              .indexOf(searchText) !== -1;
            if (isSearched && item) {
              itemsArray.push({
                ...item,
                class: `${group.classPrefix}${item.key}`,
                text: item.text(),
                notes: item.notes(),
                quantity: itemQuantity,
              });

              group.quantity += itemQuantity;
            }
          }
        });

        if (this.sortBy === 'quantity') {
          // Store original quantities, to avoid reordering when using items.
          const quantitySnapshot = this.quantitySnapshot[groupKey] || Object.fromEntries(
            itemsArray.map(item => [item.key, item.quantity]),
          );
          itemsArray.sort((a, b) => quantitySnapshot[b.key] - quantitySnapshot[a.key]);
          this.quantitySnapshot[groupKey] = quantitySnapshot;
        } else {
          itemsArray.sort((a, b) => a.text.localeCompare(b.text));
        }
      });

      const specialArray = itemsByType.special;

      specialArray.push({
        key: 'mysteryItem',
        class: `inventory_present inventory_present_${moment().format('MM')}`,
        text: this.$t('subscriberItemText'),
        quantity: this.user.purchased.plan.mysteryItems.length,
      });

      for (const type of Object.keys(this.content.cardTypes)) {
        const card = this.user.items.special[`${type}Received`] || [];
        if (this.user.items.special[type] > 0 || card.length > 0) {
          specialArray.push({
            type: 'card',
            key: type,
            class: `inventory_special_${type}`,
            text: this.$t('toAndFromCard', { toName: this.user.profile.name, fromName: card[0] }),
            quantity: this.user.items.special[type],
          });
        }
      }

      return itemsByType;
    },

    anyFilterSelected () {
      return this.groups.some(g => g.selected);
    },
  },
  watch: {
    searchText: throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText.toLowerCase();
    }, 250),
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('items'),
      section: this.$t('inventory'),
    });
  },
  methods: {
    userHasPet (potionKey, eggKey) {
      const animalKey = `${eggKey}-${potionKey}`;

      const result = this.user.items.pets[animalKey] > 0;

      return result;
    },
    hatchPet (potion, egg) {
      this.$store.dispatch('common:hatch', { egg: egg.key, hatchingPotion: potion.key });
      this.text(this.$t('hatchedPet', { egg: egg.text, potion: potion.text }));
      if (this.user.preferences.suppressModals.hatchPet) return;
      const newPet = createAnimal(egg, potion, 'pet', this.content, this.user.items);
      this.$root.$emit('hatchedPet::open', newPet);
    },
    onDragEnd () {
      this.currentDraggingPotion = null;
    },
    onDragStart ($event, potion) {
      // Dragging needs to be added for egg items
      this.currentDraggingPotion = potion;

      const itemRef = this.$refs.draggingPotionInfo;

      const dragEvent = $event.event;

      dragEvent.dataTransfer.setDragImage(itemRef, -20, -20);
    },
    isHatchable (potion, egg) {
      if (potion === null || egg === null) return false;

      const petKey = `${egg.key}-${potion.key}`;

      const petInfo = this.content.petInfo[petKey];

      // Check pet exists and is hatchable
      if (!petInfo || !petInfo.potion) return false;

      return !this.userHasPet(potion.key, egg.key);
    },
    onDragOver ($event, egg) {
      if (this.isHatchable(this.currentDraggingPotion, egg)) {
        $event.dropable = false;
      }
    },
    onDrop ($event, egg) {
      this.hatchPet(this.currentDraggingPotion, egg);
    },
    onDragLeave () {
    },
    onEggClicked ($event, egg) {
      if (this.currentDraggingPotion !== null) {
        if (this.isHatchable(this.currentDraggingPotion, egg)) {
          this.hatchPet(this.currentDraggingPotion, egg);
        }

        this.currentDraggingPotion = null;
        return;
      }

      if (this.currentDraggingEgg === null || this.currentDraggingEgg !== egg) {
        this.currentDraggingEgg = egg;
      } else {
        this.currentDraggingEgg = null;
      }
    },
    onPotionClicked ($event, potion) {
      if (this.currentDraggingEgg !== null) {
        if (this.isHatchable(potion, this.currentDraggingEgg)) {
          this.hatchPet(potion, this.currentDraggingEgg);
        }

        this.currentDraggingEgg = null;
        return;
      }
      if (this.currentDraggingPotion === null || this.currentDraggingPotion !== potion) {
        this.currentDraggingPotion = potion;
      } else {
        this.currentDraggingPotion = null;
      }
    },

    async itemClicked (groupKey, item) {
      if (item.type && item.type === 'card') {
        this.cardOptions = {
          cardType: item.key,
          messageOptions: this.content.cardTypes[item.key].messageOptions,
        };
        this.$root.$emit('bv::show::modal', 'card');
        return;
      }

      if (groupKey === 'special') {
        if (item.key === 'timeTravelers') {
          this.$router.push({ name: 'time' });
        } else if (item.key === 'mysteryItem') {
          if (item.quantity === 0) return;

          const result = await this.$store.dispatch('user:openMysteryItem');

          const openedItem = result.data.data;
          const text = this.content.gear.flat[openedItem.key].text();
          this.drop(this.$t('messageDropMysteryItem', { dropText: text }), openedItem);
        } else {
          this.$root.$emit('selectMembersModal::showItem', item);
        }
      } else if (groupKey === 'quests') {
        this.$root.$emit('bv::show::modal', 'quest-detail-modal', {
          key: item.key,
        });
      }
    },
  },
};
</script>
