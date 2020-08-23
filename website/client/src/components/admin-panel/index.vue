<template>
  <div
    v-if="user.contributor.admin"
    class="row standard-page"
  >
    <div class="well">
      <h1>Admin Panel</h1>

      <div class="row">
        <form @submit.prevent="loadHero(heroID)" class="form-inline">
          <input
            v-model="heroID"
            class="form-control"
            type="text"
            :placeholder="'User ID or Username; blank for your account'"
            :style="{ 'min-width': '45ch' }"
          >
          <input
            type="submit"
            value="Load User (click or hit enter)"
            class="btn btn-secondary"
          >
        </form>
      </div>

      <div
        v-if="hero && hero.profile"
        class="row"
      >
        <div class="form col-12">
          <basic-details
            :userId="hero._id"
            :auth="hero.auth"
            :preferences="hero.preferences"
            :profile="hero.profile"
          />

          <privileges-and-gems
            :hero="hero"
            :resetCounter="this.resetCounter"
          />

          <cron-and-auth
            :auth="hero.auth"
            :preferences="hero.preferences"
            :lastCron="hero.lastCron"
            :resetCounter="this.resetCounter"
          />

          <party-and-quest
            :userId="hero._id"
            :username="hero.auth.local.username"
            :userHasParty="hasParty"
            :partyNotExistError="partyNotExistError"
            :userPartyData="hero.party"
            :groupPartyData="party"
            :resetCounter="this.resetCounter"
          />

          <avatar-and-drops
            :items="hero.items"
            :preferences="hero.preferences"
          />

          <div class="accordion-group">
            <h3
              class="expand-toggle"
              :class="{'open': expandItems}"
              @click="expandItems = !expandItems"
            >
              Items
            </h3>
            <div v-if="expandItems">
              <p>
                The sections below display each item's key (bolded if the player has ever owned it),
                followed by the item's English name.
                Use the key (not name!) to change the amount owned or the true/false value.
                Click "Change" to auto-fill "Update Items" with key and current amount/value.
              </p>
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
                      A value of NULL means they owned the Mount but Released it
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
                        :key="item.key"
                        class="form-group form-inline"
                      >
                        <form
                          @submit.prevent="changeData(item.path, item.value)"
                          value="Change"
                        >
                          <span>{{ item.valueForDisplay }} : </span>
                          <span :class="{ ownedItem: !item.neverOwned }">{{ item.key }} :</span>
                          <span>{{ item.name }}</span>
                          <input
                            type="submit"
                            value="Change"
                            class="btn btn-primary"
                          >
                        </form>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="accordion">
            <div
              class="accordion-group"
              heading="Update Items"
            >
              <h3
                class="expand-toggle"
                :class="{'open': expandUpdateItems}"
                @click="expandUpdateItems = !expandUpdateItems"
              >
                Update Items
              </h3>
              <div
                v-if="expandUpdateItems"
                class="form-group"
              >
                <p>
                  TIP: First find the item in the "Items" section above and
                  click its "Change" button.
                  The item path and current value (if any) will be inserted below.
                </p>
                <form @submit.prevent="saveHeroOld()">
                  <div>
                    <input
                      v-model="hero.itemPath"
                      class="form-control"
                      type="text"
                    >
                    <small class="muted">
                      Enter the <strong>item path</strong>. E.g.,
                      <code>items.pets.BearCub-Zombie</code> or
                      <code>items.gear.owned.head_special_0</code> or
                      <code>items.gear.equipped.head</code>.
                      You can find all the items in the "Item" section above.
                      The "Change" buttons will insert the path and the current value automatically.
                    </small>
                  </div>
                  <div>
                    <input
                      v-model="hero.itemVal"
                      class="form-control"
                      type="text"
                      placeholder="Value (eg, 5)"
                    >
                    <small class="muted">
                      Enter the <strong>item value</strong>. E.g.,
                      <code>5</code> or
                      <code>false</code> or
                      <code>head_warrior_3</code>.
                    </small>
                  </div>
                  <input
                    type="submit"
                    value="Save"
                    class="btn btn-primary"
                  >
                </form>
              </div>
            </div>
          </div>

          <contributor-details
            :hero="hero"
            :resetCounter="this.resetCounter"
            @clear-data="clearData"
          />

        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .ownedItem {
    font-weight: bold;
  }
</style>
<style lang="scss">
  .accordion-group .accordion-group {
    margin-left: 1em;
  }
  h3 {
    margin-top: 2em;
  }
  h4 {
    margin-top: 1em;
  }
  .expand-toggle::after {
    margin-left: 5px;
  }
  .subsection-start {
    margin-top: 1em;
  }
  .form-inline {
    margin-bottom: 1em;
    input, span {
      margin-left: 5px;
    }
  }
  .errorMessage {
    font-weight: bold;
  }
</style>

<script>
import markdownDirective from '@/directives/markdown';
import styleHelper from '@/mixins/styleHelper';
import { mapState } from '@/libs/store';
import content from '@/../../common/script/content';
import notifications from '@/mixins/notifications';

import BasicDetails from './user-support/basicDetails';
import CronAndAuth from './user-support/cronAndAuth';
import PartyAndQuest from './user-support/partyAndQuest';
import AvatarAndDrops from './user-support/avatarAndDrops';
import PrivilegesAndGems from './user-support/privilegesAndGems';
import ContributorDetails from './user-support/contributorDetails';

export default {
  components: {
    BasicDetails,
    CronAndAuth,
    PartyAndQuest,
    AvatarAndDrops,
    PrivilegesAndGems,
    ContributorDetails,
  },
  directives: {
    markdown: markdownDirective,
  },
  mixins: [notifications, styleHelper],
  data () {
    return {
      resetCounter: 0,
      hero: {},
      heroID: '',
      party: {},
      hasParty: false,
      partyNotExistError: false,
      content,
      collatedItemData: {},
      expandItems: false,
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
      expandUpdateItems: false,
      itemTypes: ['eggs', 'hatchingPotions', 'food', 'pets', 'mounts', 'quests', 'gear', 'special'],
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    clearData: function clearData () {
      this.hero = {};
    },

    collateItemData () {
      // items.special includes many items but we are interested in these only:
      const specialItems = ['snowball', 'spookySparkles', 'shinySeed', 'seafoam'];

      const collatedItemData = {};
      this.itemTypes.forEach(itemType => {
        let basePath = `items.${itemType}`;
        let ownedItems = this.hero.items[itemType] || {};
        let allItems = content[itemType];
        if (itemType === 'gear') {
          basePath = 'items.gear.owned';
          ownedItems = this.hero.items.gear.owned || {};
          allItems = content.gear.flat;
        }
        const itemData = [];

        for (const key of Object.keys(ownedItems)) {
          // Do not sort keys. Order in the items object gives hints about order received.

          if (itemType !== 'special' || specialItems.includes(key)) {
            // we want null values shown as visible text (e.g., Mounts that were Released)
            const value = ownedItems[key];
            const valueForDisplay = (value === null) ? 'NULL' : value;
            itemData.push({
              neverOwned: false,
              key,
              name: this.getItemDescription(itemType, key),
              path: `${basePath}.${key}`,
              value,
              valueForDisplay,
            });
          }
        }

        for (const key of Object.keys(allItems).sort()) {
          // These are never-owned items so we sort by key for convenient viewing.

          if (
            // ignore items the user owns because they were listed above:
            !(key in ownedItems)

            // ignore gear items that indicate empty equipped slots (e.g., head_base_0):
            && !(itemType === 'gear' && content.gear.flat[key].set
              && content.gear.flat[key].set === 'base-0')

            // ignore "special" items that aren't Snowballs, Seafoam, etc:
            && (itemType !== 'special' || specialItems.includes(key))
          ) {
            // these types of items have true/false/null values (all other have integers):
            const booleanTypes = ['mounts', 'gear'];

            let value;
            let valueForDisplay;
            if (booleanTypes.includes(itemType)) {
              value = ''; // we want no default value in the "Update Items" input box
              valueForDisplay = 'never owned';
            } else {
              value = 0;
              valueForDisplay = '0 (never owned)';
            }
            itemData.push({
              neverOwned: true,
              key,
              name: this.getItemDescription(itemType, key),
              path: `${basePath}.${key}`,
              value,
              valueForDisplay,
            });
          }
        }
        collatedItemData[itemType] = itemData;
      });
      return collatedItemData;
    },
    getItemDescription (itemType, key) {
      // Returns item name. Also returns other info for equipment.
      const simpleItemTypes = ['eggs', 'hatchingPotions', 'food', 'quests', 'special'];
      if (simpleItemTypes.includes(itemType) && content[itemType][key]) {
        return content[itemType][key].text();
      }
      if (itemType === 'mounts' && content.mountInfo[key]) {
        return content.mountInfo[key].text();
      }
      if (itemType === 'pets' && content.petInfo[key]) {
        return content.petInfo[key].text();
      }
      if (itemType === 'gear' && content.gear.flat[key]) {
        const name = content.gear.flat[key].text();
        const description = this.getGearSetDescription(key);
        if (description) return `${name} -- ${description}`;
        return name;
      }
      return 'NO NAME - invalid item?';
    },
    getGearSetDescription (key) {
      let setName = this.getGearSetName(key);
      if (setName === 'special-takeThis') {
        // no point displaying set details for gear where it's obvious
        return '';
      }
      const klassNames = {
        healer: 'Healer',
        rogue: 'Rogue',
        warrior: 'Warrior',
        wizard: 'Mage',
      };
      const lunarBattleQuestGear = ['armor_special_lunarWarriorArmor', 'head_special_lunarWarriorHelm', 'weapon_special_lunarScythe'];

      const loginIncentivesGear = ['armor_special_bardRobes', 'armor_special_dandySuit', 'armor_special_lunarWarriorArmor', 'armor_special_nomadsCuirass', 'armor_special_pageArmor', 'armor_special_samuraiArmor', 'armor_special_sneakthiefRobes', 'armor_special_snowSovereignRobes', 'back_special_snowdriftVeil', 'head_special_bardHat', 'head_special_clandestineCowl', 'head_special_dandyHat', 'head_special_kabuto', 'head_special_lunarWarriorHelm', 'head_special_pageHelm', 'head_special_snowSovereignCrown', 'head_special_spikedHelm', 'shield_special_diamondStave', 'shield_special_lootBag', 'shield_special_wakizashi', 'shield_special_wintryMirror', 'weapon_special_bardInstrument', 'weapon_special_fencingFoil', 'weapon_special_lunarScythe', 'weapon_special_nomadsScimitar', 'weapon_special_pageBanner', 'weapon_special_skeletonKey', 'weapon_special_tachi'];

      const goldQuestsGear = ['armor_special_finnedOceanicArmor', 'head_special_fireCoralCirclet', 'weapon_special_tridentOfCrashingTides', 'shield_special_moonpearlShield', 'head_special_pyromancersTurban', 'armor_special_pyromancersRobes', 'weapon_special_taskwoodsLantern', 'armor_special_mammothRiderArmor', 'head_special_mammothRiderHelm', 'weapon_special_mammothRiderSpear', 'shield_special_mammothRiderHorn', 'armor_special_roguishRainbowMessengerRobes', 'head_special_roguishRainbowMessengerHood', 'weapon_special_roguishRainbowMessage', 'shield_special_roguishRainbowMessage', 'eyewear_special_aetherMask', 'body_special_aetherAmulet', 'back_special_aetherCloak', 'weapon_special_aetherCrystals'];

      const animalGear = ['back_special_bearTail', 'back_special_cactusTail', 'back_special_foxTail', 'back_special_lionTail', 'back_special_pandaTail', 'back_special_pigTail', 'back_special_tigerTail', 'back_special_wolfTail', 'headAccessory_special_bearEars', 'headAccessory_special_cactusEars', 'headAccessory_special_foxEars', 'headAccessory_special_lionEars', 'headAccessory_special_pandaEars', 'headAccessory_special_pigEars', 'headAccessory_special_tigerEars', 'headAccessory_special_wolfEars'];

      let wantSetName = true; // some set names are useful, others aren't
      let setType = '[cannot determine set type]';
      if (setName === 'base-0') {
        setType = 'empty slot';
        wantSetName = false;
      } else if (setName.includes('special-turkey')) {
        setType = '<a href="https://habitica.fandom.com/wiki/Turkey_Day">Turkey Day</a>';
        wantSetName = false;
      } else if (setName.includes('special-nye')) {
        setType = '<a href="https://habitica.fandom.com/wiki/Event_Item_Sequences">New Year\'s Eve</a>';
        wantSetName = false;
      } else if (setName.includes('special-birthday')) {
        setType = '<a href="https://habitica.fandom.com/wiki/Habitica_Birthday_Bash">Habitica Birthday Bash</a>';
        wantSetName = false;
      } else if (setName.includes('special-0') || key === 'weapon_special_3') {
        setType = '<a href="https://habitica.fandom.com/wiki/Kickstarter">Kickstarter 2013</a>';
        wantSetName = false;
      } else if (setName.includes('special-1')) {
        setType = 'Contributor gear';
        wantSetName = false;
      } else if (setName.includes('special-2') || key === 'shield_special_goldenknight') {
        setType = '<a href="https://habitica.fandom.com/wiki/Legendary_Equipment">Legendary Equipment</a>';
        wantSetName = false;
      } else if (setName.includes('special-wondercon')) {
        setType = '<a href="https://habitica.fandom.com/wiki/Unconventional_Armor">Unconventional Armor</a>';
        wantSetName = false;
      } else if (lunarBattleQuestGear.includes(key)) {
        setType = '<a href="https://habitica.fandom.com/wiki/Quest_Lines#Lunar_Battle_Quest_Line">Lunar Battle Quest Line</a>';
        wantSetName = false;
      } else if (loginIncentivesGear.includes(key)) {
        setType = '<a href="https://habitica.fandom.com/wiki/Daily_Check-In_Incentives">Check-In Incentive</a>';
        wantSetName = false;
      } else if (goldQuestsGear.includes(key)) {
        setType = 'from <a href="https://habitica.fandom.com/wiki/Quest_Lines#Gold_Purchasable_Quest_Lines">Gold-Purchasable Quest Lines</a>';
        wantSetName = false;
      } else if (animalGear.includes(key)) {
        setType = '<a href="https://habitica.fandom.com/wiki/Avatar_Customizations">Animal Avatar Accessory Customisations</a>';
        wantSetName = false;
      } else if (!content.gear.flat[key].klass) {
        setType = 'NO "klass" [omission in API data]';
      } else if (content.gear.flat[key].klass === 'armoire') {
        setType = 'Armoire set';
      } else if (content.gear.flat[key].klass === 'mystery') {
        setType = 'Mystery Items';
        setName = setName.replace(/mystery-(....)(..)/, '$1-$2');
      } else if (content.gear.flat[key].klass === 'special') {
        const specialClass = content.gear.flat[key].specialClass || '';
        if (specialClass && Object.keys(klassNames).includes(specialClass)) {
          setType = `Grand Gala ${klassNames[specialClass]} set`;
        } else if (key.includes('special_gaymerx')) {
          setType = 'GaymerX';
          wantSetName = false;
        } else if (key.includes('special_ks2019')) {
          setType = '<a href="https://habitica.fandom.com/wiki/Kickstarter">Kickstarter 2019</a>';
          wantSetName = false;
        } else {
          setType = '[unknown set]';
          wantSetName = false;
        }
      } else if (Object.keys(klassNames).includes(content.gear.flat[key].klass)) {
        // e.g., base class gear such as weapon_warrior_6 (Golden Sword)
        setType = `base ${klassNames[content.gear.flat[key].klass]} gear`;
        wantSetName = false;
      }
      return (wantSetName) ? `${setType}: ${setName}` : setType;
    },
    getGearSetName (key) {
      let set = 'NO SET [probably an omission in the API data]';
      if (content.gear.flat[key].set) {
        set = `${content.gear.flat[key].set}`;
      }
      return set;
    },
    changeData (path, currentValue) {
      this.expandUpdateItems = true;
      this.expandItems = false;
      this.hero.itemPath = path;
      this.hero.itemVal = currentValue;
    },

    async loadHero (id) {
      let uuid = id || this.user._id;
      uuid = uuid.replace(/@/, ''); // allow "@name" to be entered
      const hero = await this.$store.dispatch('hall:getHero', { uuid });
      this.hero = { ...hero };

      if (!this.hero.flags) {
        this.hero.flags = {
          chatRevoked: false,
          chatShadowMuted: false,
        };
      }

      this.hasParty = false;
      this.partyNotExistError = false;
      if (this.hero.party && this.hero.party._id) {
        let party;
        try {
          party = await this.$store.dispatch('hall:getHeroParty', { groupId: this.hero.party._id });
          this.hasParty = true;
          this.party = { ...party };
        } catch (e) {
          // the API's error message isn't worth reporting ("Request failed with status code 404")
          this.partyNotExistError = true;
        }
      }

      this.collatedItemData = this.collateItemData();

      // collapse all sections except those with errors
      this.expandItems = false;
      this.expandUpdateItems = false;
      this.itemTypes.forEach(itemType => { this.expandItemType[itemType] = false; });
      this.resetCounter += 1; // tell child components to reinstantiate from scratch
    },
    async saveHeroOld () {
      this.hero.contributor.admin = this.hero.contributor.level > 7;
      await this.$store.dispatch('hall:updateHero', { heroDetails: this.hero });
      this.text('User updated');
      this.hero = {};
      // this.heroID = ''; // uncomment if we want to clear the search box after saving
    },
  },
};
</script>
