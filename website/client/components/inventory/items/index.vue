<template lang="pug">
.row(v-mousePosition="30", @mouseMoved="mouseMoved($event)")
  .standard-sidebar.d-none.d-sm-block
    .form-group
      input.form-control.input-search(type="text", v-model="searchText", :placeholder="$t('search')")

    .form
      h2(v-once) {{ $t('filter') }}
      h3(v-once) {{ $t('equipmentType') }}
      .form-group
        .form-check(
          v-for="group in groups",
          :key="group.key",
        )
          .custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", v-model="group.selected", :id="group.key")
            label.custom-control-label(v-once, :for="group.key") {{ $t(group.key) }}
  .standard-page
    .clearfix
      h1.float-left.mb-4.page-header(v-once) {{ $t('items') }}
      .float-right
        span.dropdown-label {{ $t('sortBy') }}
        b-dropdown(:text="$t(sortBy)", right=true)
          b-dropdown-item(@click="sortBy = 'quantity'", :active="sortBy === 'quantity'") {{ $t('quantity') }}
          b-dropdown-item(@click="sortBy = 'AZ'", :active="sortBy === 'AZ'") {{ $t('AZ') }}
    div(
      v-for="group in groups",
      v-if="group.selected",
      :key="group.key",
    )
      h2.mb-3
       | {{ $t(group.key) }}
       |
       span.badge.badge-pill.badge-default(v-if="group.key != 'special'") {{group.quantity}}


      itemRows(
        v-if="group.key === 'eggs'",
        :items="items[group.key]",
        :itemWidth=94,
        :itemMargin=24,
        :type="group.key",
        :noItemsLabel="$t('noGearItemsOfType', { type: $t(group.key) })"
      )
        template(slot="item", slot-scope="context")
          item(
            :item="context.item",
            :key="context.item.key",
            :itemContentClass="context.item.class",
            :showPopover="currentDraggingEgg == null",
            :active="currentDraggingEgg == context.item",
            :highlightBorder="isHatchable(currentDraggingPotion, context.item)",
            v-drag.drop.hatch="context.item.key",

            @itemDragOver="onDragOver($event, context.item)",
            @itemDropped="onDrop($event, context.item)",
            @itemDragLeave="onDragLeave()",

            @click="onEggClicked($event, context.item)",
          )
            template(slot="popoverContent", slot-scope="context")
              h4.popover-content-title {{ context.item.text }}
              .popover-content-text(v-if="currentDraggingPotion == null") {{ context.item.notes }}
            template(slot="itemBadge", slot-scope="context")
              countBadge(
                :show="true",
                :count="context.item.quantity"
              )

      itemRows(
        v-else-if="group.key === 'hatchingPotions'",
        :items="items[group.key]",
        :itemWidth=94,
        :itemMargin=24,
        :type="group.key",
        :noItemsLabel="$t('noGearItemsOfType', { type: $t(group.key) })"
      )
        template(slot="item", slot-scope="context")
          item(
            :item="context.item",
            :key="context.item.key",
            :itemContentClass="context.item.class",
            :showPopover="currentDraggingPotion == null",
            :active="currentDraggingPotion == context.item",
            :highlightBorder="isHatchable(context.item, currentDraggingEgg)",
            v-drag.hatch="context.item.key",

            @itemDragEnd="onDragEnd($event, context.item)",
            @itemDragStart="onDragStart($event, context.item)",

            @click="onPotionClicked($event, context.item)"
          )
            template(slot="popoverContent", slot-scope="context")
              h4.popover-content-title {{ context.item.text }}
              .popover-content-text {{ context.item.notes }}
            template(slot="itemBadge", slot-scope="context")
              countBadge(
                :show="true",
                :count="context.item.quantity"
              )

      itemRows(
        v-else,
        :items="items[group.key]",
        :itemWidth=94,
        :itemMargin=24,
        :type="group.key",
        :noItemsLabel="$t('noGearItemsOfType', { type: $t(group.key) })"
      )
        template(slot="item", slot-scope="context")
          item(
            :item="context.item",
            :key="context.item.key",
            :itemContentClass="context.item.class",
            :showPopover="currentDraggingPotion == null",
            @click="itemClicked(group.key, context.item)",
          )
            template(slot="popoverContent", slot-scope="context")
              div.questPopover(v-if="group.key === 'quests'")
                h4.popover-content-title {{ context.item.text }}
                questInfo(:quest="context.item")

              div(v-else)
                h4.popover-content-title {{ context.item.text }}
                .popover-content-text(v-html="context.item.notes")
            template(slot="itemBadge", slot-scope="context")
              countBadge(
                :show="true",
                :count="context.item.quantity"
              )

  hatchedPetDialog()

  div.eggInfo(ref="draggingEggInfo")
    div(v-if="currentDraggingEgg != null")
      div.potion-icon(:class="'Pet_Egg_'+currentDraggingEgg.key")
      div.popover
        div.popover-content {{ $t('dragThisEgg', {eggName: currentDraggingEgg.text }) }}

  div.eggInfo.mouse(ref="clickEggInfo", v-if="eggClickMode")
    div(v-if="currentDraggingEgg != null")
      div.potion-icon(:class="'Pet_Egg_'+currentDraggingEgg.key")
      div.popover
        div.popover-content {{ $t('clickOnPotionToHatch', {eggName: currentDraggingEgg.text }) }}

  div.hatchingPotionInfo(ref="draggingPotionInfo")
    div(v-if="currentDraggingPotion != null")
      div.potion-icon(:class="'Pet_HatchingPotion_'+currentDraggingPotion.key")
      div.popover
        div.popover-content {{ $t('dragThisPotion', {potionName: currentDraggingPotion.text }) }}

  div.hatchingPotionInfo.mouse(ref="clickPotionInfo", v-if="potionClickMode")
    div(v-if="currentDraggingPotion != null")
      div.potion-icon(:class="'Pet_HatchingPotion_'+currentDraggingPotion.key")
      div.popover
        div.popover-content {{ $t('clickOnEggToHatch', {potionName: currentDraggingPotion.text }) }}

  startQuestModal(
    :group="user.party"
  )

  cards-modal(:card-options='cardOptions')
</template>

<style lang="scss" scoped>
  .eggInfo, .hatchingPotionInfo {
    position: absolute;
    left: -500px;

    z-index: 1080;

    &.mouse {
      position: fixed;
      pointer-events: none
    }

    .potion-icon {
      margin: 0 auto 8px;
    }

    .popover {
      position: inherit;
      width: 180px;
    }

    .popover-content {
      color: white;
      margin: 15px;
    }
  }
</style>

<script>
import { mapState } from 'client/libs/store';
import each from 'lodash/each';
import throttle from 'lodash/throttle';

import Item from 'client/components/inventory/item';
import ItemRows from 'client/components/ui/itemRows';
import CountBadge from 'client/components/ui/countBadge';

import cardsModal from './cards-modal';
import HatchedPetDialog from '../stable/hatchedPetDialog';

import startQuestModal from '../../groups/startQuestModal';

import createAnimal from 'client/libs/createAnimal';

import QuestInfo from '../../shops/quests/questInfo.vue';

import moment from 'moment';

const allowedSpecialItems = ['snowball', 'spookySparkles', 'shinySeed', 'seafoam'];

import notifications from 'client/mixins/notifications';
import DragDropDirective from 'client/directives/dragdrop.directive';
import MouseMoveDirective from 'client/directives/mouseposition.directive';

const groups = [
  ['eggs', 'Pet_Egg_'],
  ['hatchingPotions', 'Pet_HatchingPotion_'],
  ['food', 'Pet_Food_'],
  ['special', 'inventory_special_', allowedSpecialItems],
  ['quests', 'inventory_quest_scroll_'],
].map(([group, classPrefix, allowedItems]) => {
  return {
    key: group,
    quantity: 0,
    selected: true,
    classPrefix,
    allowedItems,
  };
});

let lastMouseMoveEvent = {};

export default {
  mixins: [notifications],
  name: 'Items',
  components: {
    Item,
    ItemRows,
    HatchedPetDialog,
    CountBadge,
    startQuestModal,
    cardsModal,
    QuestInfo,
  },
  directives: {
    drag: DragDropDirective,
    mousePosition: MouseMoveDirective,
  },
  data () {
    return {
      searchText: null,
      searchTextThrottled: null,
      groups,
      sortBy: 'quantity', // or 'AZ'

      currentDraggingEgg: null,
      eggClickMode: false,
      currentDraggingPotion: null,
      potionClickMode: false,
      cardOptions: {
        cardType: '',
        messageOptions: 0,
      },
    };
  },
  watch: {
    searchText: throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText.toLowerCase();
    }, 250),
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
        let itemsArray = itemsByType[groupKey] = [];
        const contentItems = this.content[groupKey];

        each(this.user.items[groupKey], (itemQuantity, itemKey) => {
          let isAllowed = !group.allowedItems || group.allowedItems.indexOf(itemKey) !== -1;

          if (itemQuantity > 0 && isAllowed) {
            const item = contentItems[itemKey];

            const isSearched = !searchText || item.text().toLowerCase().indexOf(searchText) !== -1;
            if (isSearched) {
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

        itemsArray.sort((a, b) => {
          if (this.sortBy === 'quantity') {
            return b.quantity - a.quantity;
          } else { // AZ
            return a.text.localeCompare(b.text);
          }
        });
      });

      let specialArray = itemsByType.special;

      if (this.user.purchased.plan.customerId) {
        specialArray.push({
          key: 'mysteryItem',
          class: `inventory_present inventory_present_${moment().format('MM')}`,
          text: this.$t('subscriberItemText'),
          quantity: this.user.purchased.plan.mysteryItems.length,
        });
      }

      for (let type in this.content.cardTypes) {
        let card = this.user.items.special[`${type}Received`] || [];
        if (this.user.items.special[type] > 0 || card.length > 0) {
          specialArray.push({
            type: 'card',
            key: type,
            class: `inventory_special_${type}`,
            text: this.$t('toAndFromCard', { toName: this.user.profile.name, fromName: card[0]}),
            quantity: this.user.items.special[type],
          });
        }
      }

      return itemsByType;
    },
  },
  methods: {
    userHasPet (potionKey, eggKey) {
      let animalKey = `${eggKey}-${potionKey}`;

      let result =  this.user.items.pets[animalKey] > 0;

      return result;
    },
    hatchPet (potion, egg) {
      this.$store.dispatch('common:hatch', {egg: egg.key, hatchingPotion: potion.key});
      this.$root.$emit('hatchedPet::open', createAnimal(egg, potion, 'pet', this.content, this.user.items));
    },
    onDragEnd () {
      this.currentDraggingPotion = null;
    },
    onDragStart ($event, potion) {
      // Dragging needs to be added for egg items
      this.currentDraggingPotion = potion;

      let itemRef = this.$refs.draggingPotionInfo;

      let dragEvent = $event.event;

      dragEvent.dataTransfer.setDragImage(itemRef, -20, -20);
    },
    isHatchable (potion, egg) {
      if (potion === null || egg === null)
        return false;

      let petKey = `${egg.key}-${potion.key}`;

      if (!this.content.petInfo[petKey])
        return false;

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
        this.potionClickMode = false;
        return;
      }

      if (this.currentDraggingEgg === null || this.currentDraggingEgg !== egg) {
        this.currentDraggingEgg = egg;
        this.eggClickMode = true;

        this.$nextTick(() => {
          this.mouseMoved(lastMouseMoveEvent);
        });
      } else {
        this.currentDraggingEgg = null;
        this.eggClickMode = false;
      }
    },
    onPotionClicked ($event, potion) {
      if (this.currentDraggingEgg !== null) {
        if (this.isHatchable(potion, this.currentDraggingEgg)) {
          this.hatchPet(potion, this.currentDraggingEgg);
        }

        this.currentDraggingEgg = null;
        this.eggClickMode = false;
        return;
      }
      if (this.currentDraggingPotion === null || this.currentDraggingPotion !== potion) {
        this.currentDraggingPotion = potion;
        this.potionClickMode = true;

        this.$nextTick(() => {
          this.mouseMoved(lastMouseMoveEvent);
        });
      } else {
        this.currentDraggingPotion = null;
        this.potionClickMode = false;
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
          this.$router.push({name: 'time'});
        } else if (item.key === 'mysteryItem') {
          if (item.quantity === 0)
            return;

          let result = await this.$store.dispatch('user:openMysteryItem');

          let openedItem = result.data.data;
          let text = this.content.gear.flat[openedItem.key].text();
          this.drop(this.$t('messageDropMysteryItem', {dropText: text}), openedItem);
          item.quantity--;
          this.$forceUpdate();
        } else {
          this.$root.$emit('selectMembersModal::showItem', item);
        }
      } else if (groupKey === 'quests') {
        this.$root.$emit('bv::show::modal', 'start-quest-modal');

        this.$root.$emit('selectQuest', item);
      }
    },

    mouseMoved ($event) {
      if (this.potionClickMode) {
        // dragging potioninfo is 180px wide (90 would be centered)
        this.$refs.clickPotionInfo.style.left = `${$event.x - 70}px`;
        this.$refs.clickPotionInfo.style.top = `${$event.y}px`;
      } else if (this.eggClickMode) {
         // dragging eggInfo is 180px wide (90 would be centered)
        this.$refs.clickEggInfo.style.left = `${$event.x - 70}px`;
        this.$refs.clickEggInfo.style.top = `${$event.y}px`;
      } else {
        lastMouseMoveEvent = $event;
      }
    },
  },
};
</script>
