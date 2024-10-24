<template>
  <div class="card mt-2">
    <div class="card-header">
      <h3
        class="mb-0 mt-0"
        :class="{'open': expand}"
        @click="expand = !expand"
      >
        Customizations
      </h3>
    </div>
    <div
      v-if="expand"
      class="card-body"
    >
      <div
        v-for="itemType in itemTypes"
        :key="itemType"
      >
        <div
          v-if="collatedItemData[itemType]"
          class="accordion-group"
        >
          <h4
            class="expand-toggle"
            :class="{'open': expandItemType[itemType]}"
            @click="expandItemType[itemType] = !expandItemType[itemType]"
          >
            {{ itemType }}
          </h4>

          <div v-if="expandItemType[itemType]">
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
                    <span :class="item.value ? 'owned' : 'not-owned'">
                      {{ item.value }}
                    </span>
                    :
                    <span :class="{ ownedItem: !item.neverOwned }">{{ item.text }}</span>
                  </span>
                  {{ item.set }}

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
  ul li {
    margin-bottom: 0.2em;
  }
  .ownedItem {
    font-weight: bold;
  }
  .enableValueChange:hover {
    text-decoration: underline;
    cursor: pointer;
  }
  .valueField {
    min-width: 10ch;
  }
  .owned {
    color: green;
  }

  .not-owned {
    color: red;
  }
</style>

<script>
import content from '@/../../common/script/content';
import getItemDescription from '../mixins/getItemDescription';
import saveHero from '../mixins/saveHero';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

function makeSetText (set) {
  if (set === undefined) {
    return '';
  }
  if (set.key.indexOf('backgrounds') === 0) {
    const { text } = set;
    return `${months[parseInt(text.slice(11, 13), 10) - 1]} ${text.slice(13)}`;
  }
  return set.key;
}

function collateItemData (self) {
  const collatedItemData = {};
  self.itemTypes.forEach(itemType => {
    // itemTypes are pets, food, gear, etc

    // Set up some basic data for this itemType:
    const basePath = `purchased.${itemType}`;
    let ownedItems;
    let allItems;
    if (itemType.indexOf('hair') === 0) {
      const hairType = itemType.split('.')[1];
      allItems = content.appearances.hair[hairType];
      if (self.hero.purchased && self.hero.purchased.hair) {
        ownedItems = self.hero.purchased.hair[hairType] || {};
      } else {
        ownedItems = {};
      }
    } else {
      allItems = content.appearances[itemType];
      ownedItems = self.hero.purchased[itemType] || {};
    }

    const itemData = []; // all items for this itemType

    // Collate data for items that the user owns or used to own:
    for (const key of Object.keys(ownedItems)) {
      // Do not sort keys. The order in the items object gives hints about order received.
      const item = allItems[key];
      itemData.push({
        itemType,
        key,
        text: item.text ? item.text() : key,
        modified: false,
        path: `${basePath}.${key}`,
        value: ownedItems[key],
        set: makeSetText(item.set),
      });
    }

    // Collate data for items that the user never owned:
    for (const key of Object.keys(allItems).sort()) {
      if (
        // ignore items the user owns because we captured them above:
        !(key in ownedItems)
      ) {
        const item = allItems[key];
        itemData.push({
          itemType,
          key,
          text: item.text ? item.text() : key,
          modified: false,
          path: `${basePath}.${key}`,
          value: false,
          set: makeSetText(item.set),
        });
      }
    }
    if (itemData.length > 0) {
      collatedItemData[itemType] = itemData;
    }
  });
  return collatedItemData;
}

function resetData (self) {
  self.collatedItemData = collateItemData(self);
  self.itemTypes.forEach(itemType => { self.expandItemType[itemType] = false; });
}

export default {
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
        skin: false,
        shirt: false,
        background: false,
        'hair.bangs': false,
        'hair.base': false,
        'hair.color': false,
        'hair.mustache': false,
        'hair.beard': false,
        'hair.flower': false,
      },
      itemTypes: ['skin', 'shirt', 'background', 'hair.bangs', 'hair.base', 'hair.color', 'hair.mustache', 'hair.beard', 'hair.flower'],
      nonIntegerTypes: ['skin', 'shirt', 'background'],
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
      this.hero.purchasedPath = item.path;
      this.hero.purchasedVal = item.value;

      await this.saveHero({ hero: this.hero, msg: item.path });
      item.modified = false;
    },
    enableValueChange (item) {
      // allow form field(s) to be shown:
      item.modified = true;
      item.value = !item.value;
    },
  },
};
</script>
