<template>
  <div
    id="extra"
    class="customize-section d-flex flex-column"
    :class="{ 'justify-content-between': !showEmptySection}"
  >
    <sub-menu
      class="text-center"
      :items="extraSubMenuItems"
      :active-sub-page="activeSubPage"
      @changeSubPage="changeSubPage($event)"
    />
    <div
      v-if="activeSubPage === 'glasses'"
      id="hair-color"
    >
      <customize-options :items="eyewear" />
    </div>
    <div
      v-if="activeSubPage === 'ears'"
      id="animal-ears"
    >
      <customize-options
        v-if="animalItems('back').length > 0"
        :items="animalItems('headAccessory')"
      />
    </div>
    <div
      v-if="activeSubPage === 'tails'"
      id="animal-tails"
    >
      <customize-options
        v-if="animalItems('back').length > 0"
        :items="animalItems('back')"
      />
    </div>
    <div
      v-if="activeSubPage === 'headband'"
      id="headband"
    >
      <customize-options :items="headbands" />
    </div>
    <div
      v-if="activeSubPage === 'wheelchair'"
      id="wheelchairs"
    >
      <customize-options :items="chairs" />
    </div>
    <div
      v-if="activeSubPage === 'flower'"
      id="flowers"
    >
      <customize-options :items="flowers" />
    </div>
    <div
      v-if="showEmptySection"
      class="my-5"
    >
      <h3
        v-once
      >
        {{ $t('noItemsOwned') }}
      </h3>
      <p
        v-once
        class="w-50 mx-auto"
        v-html="$t('visitCustomizationsShop')"
      ></p>
    </div>
    <customize-banner
      v-else-if="editing"
    />
  </div>
</template>

<script>
import appearance from '@/../../common/script/content/appearance';
import upperFirst from 'lodash/upperFirst';
import { subPageMixin } from '../../mixins/subPage';
import { userStateMixin } from '../../mixins/userState';
import { avatarEditorUtilities } from '../../mixins/avatarEditUtilities';
import customizeBanner from './customize-banner';
import customizeOptions from './customize-options';
import subMenu from './sub-menu';

export default {
  components: {
    customizeBanner,
    customizeOptions,
    subMenu,
  },
  mixins: [
    subPageMixin,
    userStateMixin,
    avatarEditorUtilities,
  ],
  props: [
    'editing',
  ],
  data () {
    return {
      animalItemKeys: {
        back: ['bearTail', 'cactusTail', 'foxTail', 'lionTail', 'pandaTail', 'pigTail', 'tigerTail', 'wolfTail'],
        headAccessory: ['bearEars', 'cactusEars', 'foxEars', 'lionEars', 'pandaEars', 'pigEars', 'tigerEars', 'wolfEars'],
      },
      chairKeys: ['none', 'black', 'blue', 'green', 'pink', 'red', 'yellow', 'handleless_black', 'handleless_blue', 'handleless_green', 'handleless_pink', 'handleless_red', 'handleless_yellow'],
    };
  },
  computed: {
    extraSubMenuItems () {
      const items = [];

      if (this.editing) {
        items.push({
          id: 'glasses',
          label: this.$t('glasses'),
        });
      }

      items.push(
        {
          id: 'wheelchair',
          label: this.$t('wheelchair'),
        },
        {
          id: 'flower',
          label: this.$t('accent'),
        },
      );

      if (this.editing) {
        items.push({
          id: 'ears',
          label: this.$t('animalEars'),
        });

        items.push({
          id: 'tails',
          label: this.$t('animalTails'),
        });

        items.push({
          id: 'headband',
          label: this.$t('headband'),
        });
      }

      return items;
    },
    eyewear () {
      const keys = [
        'blackTopFrame', 'blueTopFrame', 'greenTopFrame', 'pinkTopFrame', 'redTopFrame', 'whiteTopFrame', 'yellowTopFrame',
        'blackHalfMoon', 'blueHalfMoon', 'greenHalfMoon', 'pinkHalfMoon', 'redHalfMoon', 'whiteHalfMoon', 'yellowHalfMoon',
      ];
      const noneOption = this.createGearItem(0, 'eyewear', 'base');
      noneOption.none = true;
      noneOption.text = this.$t('none');
      const options = [
        noneOption,
      ];

      for (const key of keys) {
        const newKey = `eyewear_special_${key}`;
        const option = {};
        option.key = key;
        option.active = this.user.preferences.costume
          ? this.user.items.gear.costume.eyewear === newKey
          : this.user.items.gear.equipped.eyewear === newKey;
        option.imageName = `eyewear_special_${key}`;
        option.isGear = true;
        option.click = () => {
          const type = this.user.preferences.costume ? 'costume' : 'equipped';

          return this.equip(newKey, type);
        };
        option.text = this.$t(`eyewearSpecial${upperFirst(key)}Text`);
        options.push(option);
      }

      return options;
    },
    headbands () {
      const keys = ['blackHeadband', 'blueHeadband', 'greenHeadband', 'pinkHeadband', 'redHeadband', 'whiteHeadband', 'yellowHeadband'];
      const noneOption = this.createGearItem(0, 'headAccessory', 'base');
      noneOption.none = true;
      noneOption.text = this.$t('none');
      const options = [
        noneOption,
      ];

      for (const key of keys) {
        const option = this.createGearItem(key, 'headAccessory', 'special');
        const newKey = `headAccessory_special_${key}`;
        option.click = () => {
          const type = this.user.preferences.costume ? 'costume' : 'equipped';
          return this.equip(newKey, type);
        };
        option.text = this.$t(`headAccessory${upperFirst(key)}Text`);
        options.push(option);
      }

      return options;
    },
    chairs () {
      const options = this.chairKeys.map(key => {
        const option = {};
        option.key = key;
        if (key === 'none') {
          option.none = true;
        }
        option.active = this.user.preferences.chair === key;
        option.imageName = `chair_${key}`;
        option.click = () => this.set({ 'preferences.chair': key });
        option.text = appearance.chair[key].text();
        return option;
      });
      return options;
    },
    flowers () {
      const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      const options = keys.map(key => {
        const option = {};
        option.key = key;
        if (key === 0) {
          option.none = true;
        }
        option.active = this.user.preferences.hair.flower === key;
        if (key !== 0) {
          option.imageName = `hair_flower_${key}`;
        }
        option.click = () => this.set({ 'preferences.hair.flower': key });
        option.text = appearance.hair.flower[key].text();
        return option;
      });
      return options;
    },
    showEmptySection () {
      switch (this.activeSubPage) {
        case 'ears':
          return this.editing && this.animalItems('headAccessory').length === 1;
        case 'tails':
          return this.editing && this.animalItems('back').length === 1;
        default:
          return false;
      }
    },
  },
  mounted () {
    this.changeSubPage(this.extraSubMenuItems[0].id);
  },
  methods: {
    animalItems (category) {
      // @TODO: For some resonse when I use $set on the
      // user purchases object, this is not recomputed. Hack for now
      let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
      const keys = this.animalItemKeys[category];

      const noneOption = this.createGearItem(0, category, 'base', category);
      noneOption.none = true;
      noneOption.text = this.$t('none');
      const options = [
        noneOption,
      ];

      for (const key of keys) {
        const newKey = `${category}_special_${key}`;
        const userPurchased = this.user.items.gear.owned[newKey];
        if (userPurchased) {
          const option = {};
          option.key = key;
          option.active = this.user.preferences.costume
            ? this.user.items.gear.costume[category] === newKey
            : this.user.items.gear.equipped[category] === newKey;

          if (category === 'back') {
            option.text = this.$t(`back${upperFirst(key)}Text`);
            option.imageName = `back_special_${option.key}`;
          } else {
            option.text = this.$t(`headAccessory${upperFirst(key)}Text`);
            option.imageName = `headAccessory_special_${option.key}`;
          }
          option.isGear = true;
          option.click = () => {
            const type = this.user.preferences.costume ? 'costume' : 'equipped';
            return this.equip(newKey, type);
          };
          options.push(option);
        }
      }

      return options;
    },
    animalItemsUnlockString (category) {
      const keys = this.animalItemKeys[category].map(key => `items.gear.owned.${category}_special_${key}`);

      return keys.join(',');
    },
    createGearItem (key, gearType, subGearType) {
      const newKey = `${gearType}_${subGearType ? `${subGearType}_` : ''}${key}`;
      const option = {};
      option.key = key;
      const visibleGearType = this.user.preferences.costume ? 'costume' : 'equipped';
      const currentlyEquippedValue = this.user.items.gear[visibleGearType][gearType];

      option.active = currentlyEquippedValue === newKey;
      option.isGear = true;

      if (key === 0) {
        // if key is the "none" option check if a property
        // doesn't have a value and mark it as active
        option.active = option.active || !currentlyEquippedValue;
      }

      option.imageName = `${newKey}`;
      option.click = () => {
        const type = this.user.preferences.costume ? 'costume' : 'equipped';
        const currentlyEquipped = this.user.items.gear[type][gearType];

        // no need to call api/equip-op if its already selected
        if (currentlyEquipped === newKey || (key === 0 && !currentlyEquipped)) {
          return;
        }

        let keyToEquip = newKey;

        if (option.none) {
          // you need to "equip" the current selected AGAIN in order to un-equip it
          // the "none-key" isn't allowed to be sent
          keyToEquip = currentlyEquipped;
        }

        this.equip(keyToEquip, type);
      };

      return option;
    },
  },
};
</script>
