<template lang="pug">
  #extra.section.container.customize-section
    sub-menu.text-center(:items="extraSubMenuItems", :activeSubPage="activeSubPage", @changeSubPage="changeSubPage($event)")

    #hair-color(v-if='activeSubPage === "glasses"')
      customize-options(
        :items="eyewear"
      )

    #animal-ears(v-if='activeSubPage === "ears"')
      customize-options(
        :items="animalItems('headAccessory')",
        :fullSet='!animalItemsOwned("headAccessory")',
        @unlock='unlock(animalItemsUnlockString("headAccessory"))'
      )

    #animal-tails(v-if='activeSubPage === "tails"')
      customize-options(
        :items="animalItems('back')",
        :fullSet='!animalItemsOwned("back")',
        @unlock='unlock(animalItemsUnlockString("back"))'
      )
    #headband(v-if='activeSubPage === "headband"')
      customize-options(
        :items="headbands",
      )

    #wheelchairs(v-if='activeSubPage === "wheelchair"')
      customize-options(
        :items="chairs",
      )
    #flowers(v-if='activeSubPage === "flower"')
      customize-options(
        :items="flowers",
      )
</template>

<script>
  import appearance from '@/../../common/script/content/appearance';
  import {subPageMixin} from '../../mixins/subPage';
  import {userStateMixin} from '../../mixins/userState';
  import {avatarEditorUtilies} from '../../mixins/avatarEditUtilities';
  import subMenu from './sub-menu';
  import customizeOptions from './customize-options';
  import gem from '@/assets/svg/gem.svg';

  const freeShirtKeys = Object.keys(appearance.shirt).filter(k => appearance.shirt[k].price === 0);
  const specialShirtKeys = Object.keys(appearance.shirt).filter(k => appearance.shirt[k].price !== 0);


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
        animalItemKeys: {
          back: ['bearTail', 'cactusTail', 'foxTail', 'lionTail', 'pandaTail', 'pigTail', 'tigerTail', 'wolfTail'],
          headAccessory: ['bearEars', 'cactusEars', 'foxEars', 'lionEars', 'pandaEars', 'pigEars', 'tigerEars', 'wolfEars'],
        },
        chairKeys: ['none', 'black', 'blue', 'green', 'pink', 'red', 'yellow', 'handleless_black', 'handleless_blue', 'handleless_green', 'handleless_pink', 'handleless_red', 'handleless_yellow'],
        specialShirtKeys,
        icons: Object.freeze({
          gem,
        }),
        items: [
          {
            id: 'size',
            label: this.$t('size'),
          },
          {
            id: 'shirt',
            label: this.$t('shirt'),
          },
        ],
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
        let keys = [
          'blackTopFrame', 'blueTopFrame', 'greenTopFrame', 'pinkTopFrame', 'redTopFrame', 'whiteTopFrame', 'yellowTopFrame',
          'blackHalfMoon', 'blueHalfMoon', 'greenHalfMoon', 'pinkHalfMoon', 'redHalfMoon', 'whiteHalfMoon', 'yellowHalfMoon',
        ];
        let options = keys.map(key => {
          let newKey = `eyewear_special_${key}`;
          let option = {};
          option.key = key;
          option.active = this.user.preferences.costume ? this.user.items.gear.costume.eyewear === newKey : this.user.items.gear.equipped.eyewear === newKey;
          option.class = `eyewear_special_${key}`;
          option.click = () => {
            let type = this.user.preferences.costume ? 'costume' : 'equipped';

            return this.equip(newKey, type);
          };
          return option;
        });
        return options;
      },
      freeShirts () {
        return freeShirtKeys.map(s => this.mapKeysToFreeOption(s, 'shirt'));
      },
      specialShirts () {
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
        let keys = this.specialShirtKeys;
        let options = keys.map(key => this.mapKeysToOption(key, 'shirt'));
        return options;
      },
      headbands () {
        let keys = ['blackHeadband', 'blueHeadband', 'greenHeadband', 'pinkHeadband', 'redHeadband', 'whiteHeadband', 'yellowHeadband'];
        let options = keys.map(key => {
          let newKey = `headAccessory_special_${key}`;
          let option = {};
          option.key = key;
          option.active = this.user.preferences.costume ? this.user.items.gear.costume.headAccessory === newKey : this.user.items.gear.equipped.headAccessory === newKey;
          option.class = `headAccessory_special_${option.key} headband`;
          option.click = () => {
            let type = this.user.preferences.costume ? 'costume' : 'equipped';
            return this.equip(newKey, type);
          };
          return option;
        });
        return options;
      },
      chairs () {
        let options = this.chairKeys.map(key => {
          let option = {};
          option.key = key;
          if (key === 'none') {
            option.none = true;
          }
          option.active = this.user.preferences.chair === key;
          option.class = `button_chair_${key} chair ${key.includes('handleless_') ? 'handleless' : ''}`;
          option.click = () => {
            return this.set({'preferences.chair': key});
          };
          return option;
        });
        return options;
      },
      flowers () {
        let keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        let options = keys.map(key => {
          let option = {};
          option.key = key;
          if (key === 0) {
            option.none = true;
          }
          option.active = this.user.preferences.hair.flower === key;
          option.class = `hair_flower_${key} flower`;
          option.click = () => {
            return this.set({'preferences.hair.flower': key});
          };
          return option;
        });
        return options;
      },
    },
    mounted () {
      this.changeSubPage(this.extraSubMenuItems[0].id);
    },
    methods: {
      animalItems (category) {
        // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line
        let keys = this.animalItemKeys[category];
        let options = keys.map(key => {
          let newKey = `${category}_special_${key}`;
          let userPurchased = this.user.items.gear.owned[newKey];

          let option = {};
          option.key = key;
          option.active = this.user.preferences.costume ? this.user.items.gear.costume[category] === newKey : this.user.items.gear.equipped[category] === newKey;
          option.class = `headAccessory_special_${option.key} ${category}`;
          if (category === 'back') {
            option.class = `icon_back_special_${option.key} back`;
          }
          option.gemLocked = userPurchased === undefined;
          option.goldLocked = userPurchased === false;
          if (option.goldLocked) {
            option.gold = 20;
          }
          if (option.gemLocked) {
            option.gem = 2;
          }
          option.locked = option.gemLocked || option.goldLocked;
          option.click = () => {
            if (option.gemLocked) {
              return this.unlock(`items.gear.owned.${newKey}`);
            } else if (option.goldLocked) {
              return this.buy(newKey);
            } else {
              let type = this.user.preferences.costume ? 'costume' : 'equipped';
              return this.equip(newKey, type);
            }
          };
          return option;
        });
        return options;
      },
      animalItemsUnlockString (category) {
        const keys = this.animalItemKeys[category].map(key => {
          return `items.gear.owned.${category}_special_${key}`;
        });

        return keys.join(',');
      },
      animalItemsOwned (category) {
        // @TODO: For some resonse when I use $set on the user purchases object, this is not recomputed. Hack for now
        let backgroundUpdate = this.backgroundUpdate; // eslint-disable-line

        let own = true;
        this.animalItemKeys[category].forEach(key => {
          if (this.user.items.gear.owned[`${category}_special_${key}`] === undefined) own = false;
        });
        return own;
      },
    },
  };
</script>

<style scoped>

</style>
