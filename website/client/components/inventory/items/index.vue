<template lang="pug">
.row(v-mousePosition="30", @mouseMoved="mouseMoved($event)")
  .standard-sidebar
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
          label.custom-control.custom-checkbox
            input.custom-control-input(type="checkbox", v-model="group.selected")
            span.custom-control-indicator
            span.custom-control-description(v-once) {{ $t(group.key) }}
  .standard-page
    .clearfix
      h1.float-left.mb-0.page-header(v-once) {{ $t('items') }}
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
      h2
       | {{ $t(group.key) }}
       |
       span.badge.badge-pill.badge-default {{group.quantity}}

      .items(v-if="group.key === 'eggs'")
        item(
          v-for="({data: item, quantity}, index) in items[group.key]",
          v-if="group.open || index < itemsPerLine",
          :item="item",
          :key="item.key",
          :itemContentClass="`${group.classPrefix}${item.key}`",
          v-drag.drop.hatch="item.key",

          @itemDragOver="onDragOver($event, item)",
          @itemDropped="onDrop($event, item)",
          @itemDragLeave="onDragLeave()",

          @click="onEggClicked($event, item)"
        )
          template(slot="popoverContent", scope="ctx")
            h4.popover-content-title {{ ctx.item.text() }}
            .popover-content-text {{ ctx.item.notes() }}
          template(slot="itemBadge", scope="ctx")
            span.badge.badge-pill.badge-item.badge-quantity {{ quantity }}

      .items(v-else-if="group.key === 'hatchingPotions'")
        item(
          v-for="({data: item, quantity}, index) in items[group.key]",
          v-if="group.open || index < itemsPerLine",
          :item="item",
          :key="item.key",
          :itemContentClass="`${group.classPrefix}${item.key}`",
          v-drag.hatch="item.key",

          @itemDragEnd="onDragEnd($event, item)",
          @itemDragStart="onDragStart($event, item)",

          @click="onPotionClicked($event, item)"
        )
          template(slot="popoverContent", scope="ctx")
            h4.popover-content-title {{ ctx.item.text() }}
            .popover-content-text {{ ctx.item.notes() }}
          template(slot="itemBadge", scope="ctx")
            span.badge.badge-pill.badge-item.badge-quantity {{ quantity }}
      .items(v-else)
        item(
          v-for="({data: item, quantity}, index) in items[group.key]",
          v-if="group.open || index < itemsPerLine",
          :item="item",
          :key="item.key",
          :itemContentClass="`${group.classPrefix}${item.key}`",
        )
          template(slot="popoverContent", scope="ctx")
            h4.popover-content-title {{ ctx.item.text() }}
            .popover-content-text {{ ctx.item.notes() }}
          template(slot="itemBadge", scope="ctx")
            span.badge.badge-pill.badge-item.badge-quantity {{ quantity }}
      div(v-if="items[group.key].length === 0")
        p(v-once) {{ $t('noGearItemsOfType', { type: $t(group.key) }) }}
      a.btn.btn-show-more(
        v-if="items[group.key].length > itemsPerLine",
        @click="group.open = !group.open"
      ) {{ group.open ? $t('showLessItems', { type: $t(group.key) }) : $t('showAllItems', { type: $t(group.key), items: items[group.key].length }) }}

  div.hatchingPotionInfo(ref="draggingPotionInfo")
    div(v-if="currentDraggingPotion != null")
      div.potion-icon(:class="'Pet_HatchingPotion_'+currentDraggingPotion.key")
      div.popover
        div.popover-content {{ $t('dragThisPotion', {potionName: currentDraggingPotion.text() }) }}

  div.hatchingPotionInfo.mouse(ref="clickPotionInfo", v-if="potionClickMode")
    div(v-if="currentDraggingPotion != null")
      div.potion-icon(:class="'Pet_HatchingPotion_'+currentDraggingPotion.key")
      div.popover
        div.popover-content {{ $t('clickOnEggToHatch', {potionName: currentDraggingPotion.text() }) }}

</template>

<style lang="scss" scoped>

  .hatchingPotionInfo {
    position: absolute;
    left: -500px;

    &.mouse {
      position: fixed;
      pointer-events: none
    }

    .potion-icon {
      margin: 0 auto;
    }

    .popover {
      position: inherit;
      width: 100px;
    }
  }
</style>

<script>
import { mapState } from 'client/libs/store';
import each from 'lodash/each';
import throttle from 'lodash/throttle';

import bDropdown from 'bootstrap-vue/lib/components/dropdown';
import bDropdownItem from 'bootstrap-vue/lib/components/dropdown-item';
import Item from 'client/components/inventory/item';

const allowedSpecialItems = ['snowball', 'spookySparkles', 'shinySeed', 'seafoam'];

import DragDropDirective from 'client/directives/dragdrop.directive';
import MouseMoveDirective from 'client/directives/mouseposition.directive';

const groups = [
  ['eggs', 'Pet_Egg_'],
  ['hatchingPotions', 'Pet_HatchingPotion_'],
  ['food', 'Pet_Food_'],
  ['special', 'inventory_special_', allowedSpecialItems],
].map(([group, classPrefix, allowedItems]) => {
  return {
    key: group,
    quantity: 0,
    selected: true,
    open: false,
    classPrefix,
    allowedItems,
  };
});

export default {
  name: 'Items',
  components: {
    Item,
    bDropdown,
    bDropdownItem,
  },
  directives: {
    drag: DragDropDirective,
    mousePosition: MouseMoveDirective,
  },
  data () {
    return {
      itemsPerLine: 9,
      searchText: null,
      searchTextThrottled: null,
      groups,
      sortBy: 'quantity', // or 'AZ'


      currentDraggingPotion: null,
      potionClickMode: false,
    };
  },
  watch: {
    searchText: throttle(function throttleSearch () {
      this.searchTextThrottled = this.searchText;
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
        let itemsArray = itemsByType[groupKey] = [];
        const contentItems = this.content[groupKey];

        each(this.user.items[groupKey], (itemQuantity, itemKey) => {
          if (itemQuantity > 0 && (!group.allowedItems || group.allowedItems.indexOf(itemKey) !== -1)) {
            const item = contentItems[itemKey];

            const isSearched = !searchText || item.text().toLowerCase().indexOf(searchText) !== -1;
            if (isSearched) {
              itemsArray.push({
                data: item,
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
            return a.data.text().localeCompare(b.data.text());
          }
        });
      });

      return itemsByType;
    },
  },
  methods: {
    petExists (potionKey, eggKey) {
      let animalKey = `${eggKey}-${potionKey}`;

      let result =  this.user.items.pets[animalKey] > 0;

      return result;
    },

    hatchPet (potionKey, eggKey) {
      this.$store.dispatch('common:hatch', {egg: eggKey, hatchingPotion: potionKey});
    },

    onDragEnd () {
      this.currentDraggingPotion = null;
    },
    onDragStart ($event, potion) {
      this.currentDraggingPotion = potion;

      let itemRef = this.$refs.draggingPotionInfo;

      let dragEvent = $event.event;

      dragEvent.dataTransfer.setDragImage(itemRef, -20, -20);
    },

    onDragOver ($event, egg) {
      let potionKey = this.currentDraggingPotion.key;

      if (this.petExists(potionKey, egg.key)) {
        $event.dropable = false;
      }
    },
    onDrop ($event, egg) {
      this.hatchPet(this.currentDraggingPotion.key, egg.key);
    },
    onDragLeave () {

    },

    onEggClicked ($event, egg) {
      if (!this.petExists(this.currentDraggingPotion.key, egg.key)) {
        this.hatchPet(this.currentDraggingPotion.key, egg.key);
      }

      this.currentDraggingPotion = null;
      this.potionClickMode = false;
    },

    onPotionClicked ($event, potion) {
      if (this.currentDraggingPotion === null || this.currentDraggingPotion !== potion) {
        this.currentDraggingPotion = potion;
        this.potionClickMode = true;
      } else {
        this.currentDraggingPotion = null;
        this.potionClickMode = false;
      }
    },

    mouseMoved ($event) {
      if (this.potionClickMode) {
        this.$refs.clickPotionInfo.style.left = `${$event.x + 20}px`;
        this.$refs.clickPotionInfo.style.top = `${$event.y + 20}px`;
      }
    },
  },
};
</script>
