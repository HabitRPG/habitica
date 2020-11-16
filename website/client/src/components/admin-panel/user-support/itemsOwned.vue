<template>
  <div class="accordion-group">
    <h3
      class="expand-toggle"
      :class="{'open': expand}"
      @click="expand = !expand"
    >
      Items
    </h3>
    <div v-if="expand">
      <div>
        The sections below display each item's key (bolded if the player has ever owned it),
        followed by the item's English name.
        <ul>
          <li>
            Click on an item's key or value to change it
            (hovering shows an underline to show where you can click).
          </li>
          <li>For Mounts and Gear, clicking toggles between the allowed values.</li>
          <li>For other item types, clicking gives you a form field to enter a new value.</li>
          <li>Click Save when the correct value is displayed.</li>
          <li>
            You must Save for each item individually but you do not need to reload the user
            between each Save.
          </li>
          <li>If you adjust an item and do not click Save for it, the change will be lost.</li>
        </ul>
      </div>

      <div
        v-for="itemType in itemTypes"
        :key="itemType"
      >
        <div class="accordion-group">
          <h4
            class="expand-toggle"
            :class="{'open': expandItemType[itemType]}"
            @click="expandItemType[itemType] = !expandItemType[itemType]"
          >
            {{ itemType }}
          </h4>

          <div v-if="expandItemType[itemType]">
            <p v-if="itemType === 'pets'">
              A value of -1 means they owned the Pet but Released it
              and have not yet rehatched it.
            </p>
            <p v-if="itemType === 'mounts'">
              A value of "null" means they owned the Mount but Released it
              and have not yet retamed it.
            </p>
            <p v-if="itemType === 'special'">
              When there are 0 of these items, we can't tell if
              they had been owned and were all used, or have never been owned.
            </p>
            <p v-if="itemType === 'gear'">
              A value of true means they own the item now and can wear it.
              A value of false means they used to own it but lost it from Death
              (or an old Rebirth).
            </p>
            <ul>
              <li
                v-for="item in collatedItemData[itemType]"
                :key="item.path"
              >
                <form @submit.prevent="saveItem(item)">
                  <span
                    class="enableValueChange"
                    @click="enableValueChange(item)"
                  >
                    {{ item | displayValue }}
                    :
                    <span :class="{ ownedItem: !item.neverOwned }">{{ item.key }} : </span>
                  </span>
                  <span v-html="item.name"></span>

                  <div
                    v-if="item.modified"
                    class="form-inline"
                  >
                    <input
                      v-if="item.valueIsInteger"
                      v-model="item.value"
                      class="form-control valueField"
                      type="number"
                    >
                    <input
                      v-if="item.modified"
                      type="submit"
                      value="Save"
                      class="btn btn-primary"
                    >
                  </div>
                </form>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .ownedItem {
    font-weight: bold;
  }
  .enableValueChange:hover {
    text-decoration: underline;
  }
  .valueField {
    min-width: 10ch;
  }
</style>

<script>
import content from '@/../../common/script/content';
import getItemDescription from '../mixins/getItemDescription';
import saveHero from '../mixins/saveHero';

function collateItemData (self) {
  const collatedItemData = {};
  self.itemTypes.forEach(itemType => {
    // itemTypes are pets, food, gear, etc

    // Set up some basic data for this itemType:
    let basePath = `items.${itemType}`;
    let ownedItems = self.hero.items[itemType] || {};
    let allItems = content[itemType];
    if (itemType === 'gear') {
      basePath = 'items.gear.owned';
      ownedItems = self.hero.items.gear.owned || {};
      allItems = content.gear.flat;
    } else if (itemType === 'pets' || itemType === 'mounts') {
      // add the non-Standard pets and mounts
      const ucItemType = (itemType === 'pets') ? 'Pets' : 'Mounts';
      self.petMountSubTypes.forEach(subType => {
        allItems = { ...allItems, ...content[subType + ucItemType] };
      });
    }

    const itemData = []; // all items for this itemType

    // Collate data for items that the user owns or used to own:
    for (const key of Object.keys(ownedItems)) {
      // Do not sort keys. The order in the items object gives hints about order received.
      if (itemType !== 'special' || self.specialItems.includes(key)) {
        const valueIsInteger = !self.nonIntegerTypes.includes(itemType);
        itemData.push({
          neverOwned: false,
          itemType,
          key,
          modified: false,
          name: self.getItemDescription(itemType, key),
          path: `${basePath}.${key}`,
          value: ownedItems[key],
          valueIsInteger,
        });
      }
    }

    // Collate data for items that the user never owned:
    for (const key of Object.keys(allItems).sort()) {
      if (
        // ignore items the user owns because we captured them above:
        !(key in ownedItems)

        // ignore gear items that indicate empty equipped slots (e.g., head_base_0):
        && !(itemType === 'gear' && content.gear.flat[key].set
          && content.gear.flat[key].set === 'base-0')

        // ignore "special" items that aren't Snowballs, Seafoam, etc:
        && (itemType !== 'special' || self.specialItems.includes(key))
      ) {
        const valueIsInteger = !self.nonIntegerTypes.includes(itemType);
        const value = (valueIsInteger) ? 0 : '';
        itemData.push({
          neverOwned: true,
          itemType,
          key,
          modified: false,
          name: self.getItemDescription(itemType, key),
          path: `${basePath}.${key}`,
          value,
          valueIsInteger,
        });
      }
    }
    collatedItemData[itemType] = itemData;
  });
  return collatedItemData;
}

function resetData (self) {
  self.collatedItemData = collateItemData(self);
  self.itemTypes.forEach(itemType => { self.expandItemType[itemType] = false; });
}

export default {
  filters: {
    displayValue (item) {
      if (item.value === '') return 'never owned';
      if (item.value === 0 && item.neverOwned) return '0 (never owned)';
      if (item.value === null) return 'null'; // we need visible text
      return item.value; // true or false or an integer
    },
  },
  mixins: [
    getItemDescription,
    saveHero,
  ],
  props: {
    resetCounter: {
      type: Number,
      required: true,
    },
    hero: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      expand: false,
      expandItemType: {
        eggs: false,
        hatchingPotions: false,
        food: false,
        pets: false,
        mounts: false,
        quests: false,
        gear: false,
        special: false,
      },
      itemTypes: ['eggs', 'hatchingPotions', 'food', 'pets', 'mounts', 'quests', 'gear', 'special'],
      nonIntegerTypes: ['mounts', 'gear'],
      petMountSubTypes: ['premium', 'quest', 'special', 'wacky'], // e.g., 'premiumPets'
      // items.special includes many things but we are interested in these only:
      specialItems: ['snowball', 'spookySparkles', 'shinySeed', 'seafoam'],
      collatedItemData: {},
    };
  },
  watch: {
    resetCounter () {
      resetData(this);
    },
  },
  mounted () {
    resetData(this);
  },
  methods: {
    async saveItem (item) {
      // prepare the item's new value and path for being saved
      this.hero.itemPath = item.path;
      if (item.value === null) {
        this.hero.itemVal = 'null';
      } else if (item.value === false) {
        this.hero.itemVal = 'false';
      } else {
        this.hero.itemVal = item.value;
      }

      await this.saveHero({ hero: this.hero, msg: item.key });
      item.neverOwned = false;
      item.modified = false;
    },
    enableValueChange (item) {
      // allow form field(s) to be shown:
      item.modified = true;

      // for non-integer items, toggle through the allowed values:
      if (item.itemType === 'gear') {
        // Allowed starting values are true, false, and '' (never owned)
        // Allowed values to switch to are true and false
        item.value = !item.value;
      } else if (item.itemType === 'mounts') {
        // Allowed starting values are true, null, and "never owned"
        // Allowed values to switch to are true and null
        if (item.value === true) {
          item.value = null;
        } else {
          item.value = true;
        }
      }
      // @TODO add a delete option
    },
  },
};
</script>
