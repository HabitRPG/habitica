<template>
  <div
    id="stats"
    class="standard-page"
  >
    <div
      id="attributes"
      class="row"
    >
      <hr class="col-12">
      <h2 class="col-12">
        {{ $t('attributes') }}
      </h2>
      <div
        v-for="(statInfo, stat) in stats"
        :key="stat"
        class="col-12 col-md-6"
      >
        <div class="row col-12 stats-column">
          <div class="col-12 col-md-6 attribute-label">
            <span
              class="hint"
              :popover-title="$t(statInfo.title)"
              popover-placement="right"
              :popover="$t(statInfo.popover)"
              popover-trigger="mouseenter"
            ></span>
            <div
              class="stat-title"
              :class="stat"
            >
              {{ $t(statInfo.title) }}
            </div>
            <strong class="number">{{ totalStatPoints(stat) | floorWholeNumber }}</strong>
          </div>
          <div class="col-12 col-md-6">
            <ul class="bonus-stats">
              <li>
                <strong>{{ $t('level') }}:</strong>
                <span>{{ statsComputed.levelBonus[stat] }}</span>
              </li>
              <li>
                <strong>{{ $t('equipment') }}:</strong>
                <span>{{ statsComputed.gearBonus[stat] }}</span>
              </li>
              <li>
                <strong>{{ $t('class') }}:</strong>
                <span>{{ statsComputed.classBonus[stat] }}</span>
              </li>
              <li>
                <strong>{{ $t('allocated') }}:</strong>
                <span>{{ totalAllocatedStats(stat) }}</span>
              </li>
              <li>
                <strong>{{ $t('buffs') }}:</strong>
                <span>{{ user.stats.buffs[stat] }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="showAllocation"
      class="stat-allocation-info"
    >
      <p>{{ $t('statAllocationInfo') }}</p>
    </div>
    <div
      v-if="showAllocation"
      id="allocation"
    >
      <div class="row title-row">
        <div :class="user.preferences.automaticAllocation ? 'col-12 col-md-6' : 'col-12'">
          <h3
            v-if="userLevel100Plus"
            v-once
            v-html="$t('noMoreAllocate')"
          ></h3>
          <div class="points-allocation-header" :class="{'auto-off': !user.preferences.automaticAllocation}">
            <h3>
              {{ $t('pointsAvailable') }}
              <div
                v-if="user.stats.points || userLevel100Plus"
                class="counter badge badge-pill"
              >
                {{ pointsRemaining }}
              </div>
            </h3>
            <div class="auto-allocate-toggle">
              <toggle-switch
                v-model="user.preferences.automaticAllocation"
                :label="$t('autoAllocate')"
                @change="setAutoAllocate()"
              />
            </div>
          </div>
        </div>
        <div v-if="user.preferences.automaticAllocation" class="col-12 col-md-6 allocation-dropdown-container">
          <div class="task-allocation-box" @click="toggleAllocationDropdown">
            <span class="task-allocation-text">{{ allocationModeLabel }}</span>
            <information-icon
              tooltip-id="task-allocation-info"
              :tooltip="allocationModeTooltip"
            />
            <div class="dropdown-chevron" :class="{rotated: showAllocationDropdown}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 9" width="14" height="9">
                <path fill="none" fill-rule="evenodd" stroke="#A5A1AC" stroke-width="2.5" d="M13 1L7 7 1 1"/>
              </svg>
            </div>
          </div>
          <div v-if="showAllocationDropdown" class="allocation-dropdown">
            <div class="allocation-option">
              <label>
                <input
                  v-model="user.preferences.allocationMode"
                  type="radio"
                  name="allocationMode"
                  value="flat"
                  @change="setAllocationMode('flat')"
                >
                <span class="option-text">{{ $t('evenAllocation') }}</span>
              </label>
              <information-icon
                tooltip-id="even-allocation-info"
                :tooltip="$t('evenAllocationPop')"
              />
            </div>
            <div class="allocation-option">
              <label>
                <input
                  v-model="user.preferences.allocationMode"
                  type="radio"
                  name="allocationMode"
                  value="classbased"
                  @change="setAllocationMode('classbased')"
                >
                <span class="option-text">{{ $t('classAllocation') }}</span>
              </label>
              <information-icon
                tooltip-id="class-allocation-info"
                :tooltip="$t('classAllocationPop')"
              />
            </div>
            <div class="allocation-option">
              <label>
                <input
                  v-model="user.preferences.allocationMode"
                  type="radio"
                  name="allocationMode"
                  value="taskbased"
                  @change="setAllocationMode('taskbased')"
                >
                <span class="option-text">{{ $t('taskAllocation') }}</span>
              </label>
              <information-icon
                tooltip-id="task-allocation-dropdown-info"
                :tooltip="$t('taskAllocationPop')"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div
          v-for="(statInfo, stat) in allocateStatsList"
          :key="stat"
          class="col-12 col-md-3"
        >
          <div class="box white row col-12">
            <div class="col-9 text-nowrap">
              <div :class="stat">
                {{ $t(stats[stat].title) }}
              </div>
              <div class="number">
                {{ totalAllocatedStats(stat) }}
              </div>
              <div class="points">
                {{ $t('pts') }}
              </div>
            </div>
            <div class="col-3 arrow-container">
              <div
                v-if="user.stats.points > 0"
                class="triangle-up"
                @click="allocate(stat)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12">
                  <path fill="#A5A1AC" d="M10 0l10 12H0z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="allocation-divider"></div>
    </div>
    <div class="row">
      <div class="stats-section-equipment col-12 col-md-6">
        <h2 class="text-center">
          {{ $t('equipment') }}
        </h2>
        <div class="well">
          <div
            v-for="(label, key) in equipTypes"
            :key="key"
            class="item-wrapper"
          >
            <div
              v-if="label !== 'skip'"
              :id="key"
              class="gear box"
              :class="{white: isUsed(equippedItems, key)}"
            >
              <Sprite
                v-if="isUsed(equippedItems, key)"
                :image-name="`shop_${equippedItems[key]}`"
              />
            </div>
            <b-popover
              v-if="label !== 'skip'
                && equippedItems[key] && equippedItems[key].indexOf('base_0') === -1"
              :target="key"
              triggers="hover"
              :placement="'bottom'"
              :prevent-overflow="false"
            >
              <h4 class="popover-title-only">
                {{ getGearTitle(equippedItems[key]) }}
              </h4>
              <attributesGrid
                class="attributesGrid"
                :item="content.gear.flat[equippedItems[key]]"
                :user="user"
              />
            </b-popover>
            <span
              v-if="label !== 'skip'"
              class="gear-label"
            >
              {{ label }}
            </span>
          </div>
        </div>
      </div>
      <div class="stats-section-costume col-12 col-md-6">
        <h2 class="text-center">
          {{ $t('costume') }}
        </h2>
        <div class="well">
          <!-- Use similar for loop for costume items, except show background if label is 'skip'.-->
          <div
            v-for="(label, key) in equipTypes"
            :key="key"
            class="item-wrapper"
          >
            <!-- Append a "C" to the key name since HTML IDs have to be unique.-->
            <div
              v-if="label !== 'skip'"
              :id="key + 'C'"
              class="gear box"
              :class="{white: isUsed(costumeItems, key)}"
            >
              <Sprite
                v-if="isUsed(costumeItems, key)"
                :image-name="`shop_${costumeItems[key]}`"
              />
            </div>
            <!-- Show background on 8th tile rather than a piece of equipment.-->
            <div
              v-if="label === 'skip'"
              class="gear box"
              :class="{white: user.preferences.background}"
              style="overflow:hidden"
            >
              <Sprite :image-name="'icon_background_' + user.preferences.background" />
            </div>
            <b-popover
              v-if="label !== 'skip'
                && costumeItems[key] && costumeItems[key].indexOf('base_0') === -1"
              :target="key + 'C'"
              triggers="hover"
              :placement="'bottom'"
              :prevent-overflow="false"
            >
              <h4 class="popover-title-only">
                {{ getGearTitle(costumeItems[key]) }}
              </h4>
              <attributesGrid
                class="attributesGrid"
                :item="content.gear.flat[costumeItems[key]]"
                :user="user"
              />
            </b-popover>
            <span
              v-if="label !== 'skip'"
              class="gear-label"
            >
              {{ label }}
            </span>
            <span
              v-else
              class="gear-label"
            >
              {{ $t('background') }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="row pet-mount-row">
      <div class="stats-section-pets col-12 col-md-6">
        <h2
          v-once
          class="text-center"
        >
          {{ $t('pets') }}
        </h2>
        <div class="well pet-mount-well">
          <div class="pet-mount-well-image">
            <div
              class="box"
              :class="{white: user.items.currentPet}"
            >
              <Sprite
                :image-name="user.items.currentPet ?
                  `stable_Pet-${user.items.currentPet}` : ''"
              />
            </div>
          </div>
          <div class="pet-mount-well-text">
            <div>{{ formatAnimal(user.items.currentPet, 'pet') }}</div>
            <div>
              <strong>{{ $t('petsFound') }}:</strong>
              {{ totalCount(user.items.pets) }}
            </div>
            <div>
              <strong>{{ $t('beastMasterProgress') }}:</strong>
              {{ beastMasterProgress(user.items.pets) }}
            </div>
          </div>
        </div>
      </div>
      <div class="stats-section-mounts col-12 col-md-6">
        <h2
          v-once
          class="text-center"
        >
          {{ $t('mounts') }}
        </h2>
        <div class="well pet-mount-well">
          <div class="pet-mount-well-image">
            <div
              class="box"
              :class="{white: user.items.currentMount}"
            >
              <Sprite
                :image-name="user.items.currentMount ?
                  `stable_Mount_Icon_${user.items.currentMount}` : ''"
              />
            </div>
          </div>
          <div class="pet-mount-well-text">
            <div>{{ formatAnimal(user.items.currentMount, 'mount') }}</div>
            <div>
              <strong>{{ $t('mountsTamed') }}:</strong>
              <span>{{ totalCount(user.items.mounts) }}</span>
            </div>
            <div>
              <strong>{{ $t('mountMasterProgress') }}:</strong>
              <span>{{ mountMasterProgress(user.items.mounts) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import size from 'lodash/size';
import keys from 'lodash/keys';

import Content from '@/../../common/script/content';
import { beastMasterProgress, mountMasterProgress } from '@/../../common/script/count';
import autoAllocate from '@/../../common/script/fns/autoAllocate';
import statsComputed from '@/../../common/script/libs/statsComputed';
import { mapState } from '@/libs/store';
import attributesGrid from '@/components/inventory/equipment/attributesGrid';
import toggleSwitch from '@/components/ui/toggleSwitch';
import Sprite from '@/components/ui/sprite';
import InformationIcon from '@/components/ui/informationIcon';

const DROP_ANIMALS = keys(Content.pets);
const TOTAL_NUMBER_OF_DROP_ANIMALS = DROP_ANIMALS.length;
export default {
  components: {
    toggleSwitch,
    attributesGrid,
    Sprite,
    InformationIcon,
  },
  props: ['user', 'showAllocation'],
  data () {
    return {
      showAllocationDropdown: false,
      equipTypes: {
        eyewear: this.$t('eyewear'),
        head: this.$t('headgearCapitalized'),
        headAccessory: this.$t('headAccess'),
        back: this.$t('backAccess'),
        armor: this.$t('armorCapitalized'),
        body: this.$t('bodyAccess'),
        weapon: this.$t('mainHand'),
        _skip: 'skip',
        shield: this.$t('offHandCapitalized'),
      },

      allocateStatsList: {
        str: { title: 'allocateStr', popover: 'strengthText', allocatepop: 'allocateStrPop' },
        int: { title: 'allocateInt', popover: 'intText', allocatepop: 'allocateIntPop' },
        con: { title: 'allocateCon', popover: 'conText', allocatepop: 'allocateConPop' },
        per: { title: 'allocatePer', popover: 'perText', allocatepop: 'allocatePerPop' },
      },

      stats: {
        str: {
          title: 'strength',
          popover: 'strengthText',
        },
        int: {
          title: 'intelligence',
          popover: 'intText',
        },
        con: {
          title: 'constitution',
          popover: 'conText',
        },
        per: {
          title: 'perception',
          popover: 'perText',
        },
      },
      content: Content,
    };
  },
  computed: {
    ...mapState({
      flatGear: 'content.gear.flat',
    }),
    equippedItems () {
      return this.user.items.gear.equipped;
    },
    costumeItems () {
      return this.user.items.gear.costume;
    },
    statsComputed () {
      return statsComputed(this.user);
    },
    userLevel100Plus () {
      return this.user.stats.lvl >= 100;
    },
    pointsRemaining () {
      return this.user.stats.points;
    },
    allocationModeLabel () {
      const mode = this.user.preferences.allocationMode || 'flat';
      if (mode === 'flat') return this.$t('evenAllocation');
      if (mode === 'classbased') return this.$t('classAllocation');
      if (mode === 'taskbased') return this.$t('taskAllocation');
      return this.$t('evenAllocation');
    },
    allocationModeTooltip () {
      const mode = this.user.preferences.allocationMode || 'flat';
      if (mode === 'flat') return this.$t('evenAllocationPop');
      if (mode === 'classbased') return this.$t('classAllocationPop');
      if (mode === 'taskbased') return this.$t('taskAllocationPop');
      return this.$t('evenAllocationPop');
    },

  },
  methods: {
    isUsed (items, key) {
      return items[key] && items[key].indexOf('base_0') === -1;
    },
    getGearTitle (key) {
      return this.flatGear[key].text();
    },
    totalAllocatedStats (stat) {
      return this.user.stats[stat];
    },
    totalStatPoints (stat) {
      return this.statsComputed[stat];
    },
    totalCount (objectToCount) {
      const total = size(objectToCount);
      return total;
    },
    formatAnimal (animalName, type) {
      if (type === 'pet') {
        if (Content.petInfo[animalName]) {
          return Content.petInfo[animalName].text();
        }
        return this.$t('noActivePet');
      } if (type === 'mount') {
        if (Content.mountInfo[animalName]) {
          return Content.mountInfo[animalName].text();
        }
        return this.$t('noActiveMount');
      }

      return null;
    },
    formatBackground (background) {
      const bg = Content.appearances.background;

      if (bg[background]) {
        return `${bg[background].text()} (${this.$t(bg[background].set.text)})`;
      }

      return this.$t('noBackground');
    },
    beastMasterProgress (pets) {
      const dropPetsFound = beastMasterProgress(pets);
      const display = this.formatOutOfTotalDisplay(dropPetsFound, TOTAL_NUMBER_OF_DROP_ANIMALS);

      return display;
    },
    mountMasterProgress (mounts) {
      const dropMountsFound = mountMasterProgress(mounts);
      const display = this.formatOutOfTotalDisplay(dropMountsFound, TOTAL_NUMBER_OF_DROP_ANIMALS);

      return display;
    },
    formatOutOfTotalDisplay (stat, totalStat) {
      const display = `${stat}/${totalStat}`;
      return display;
    },
    async allocate (stat) {
      if (this.user.stats.points === 0) return;

      try {
        const response = await axios.post(`/api/v4/user/allocate?stat=${stat}`);
        if (response.data && response.data.data) {
          this.$store.state.user.data.stats = response.data.data;
        }
      } catch (error) {
        console.error('Error allocating stat point:', error);
      }
    },
    allocateNow () {
      autoAllocate(this.user);
    },
    setAutoAllocate () {
      const settings = {
        'preferences.automaticAllocation': Boolean(this.user.preferences.automaticAllocation),
        'preferences.allocationMode': this.user.preferences.allocationMode || 'flat',
      };

      this.$store.dispatch('user:set', settings);
    },
    toggleAllocationDropdown () {
      this.showAllocationDropdown = !this.showAllocationDropdown;
    },
    setAllocationMode (mode) {
      const settings = {
        'preferences.allocationMode': mode,
      };
      this.$store.dispatch('user:set', settings);
      this.showAllocationDropdown = false;
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '@/assets/scss/colors.scss';

  #stats {
    .box div {
      margin: 0 auto;
      margin-top: 1em;
    }
  }

  .stats-column {
    border-radius: 2px;
    background-color: #ffffff;
    padding: .5em;
    margin-bottom: 1em;

    ul {
      list-style-type: none;

      li strong {
        margin-right: .3em;
      }
    }
  }

  .stat-title {
    text-transform: uppercase;
    font-family: Roboto;
    font-weight: 700;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0px;
    margin-top: 26px;
    padding-bottom: 4px;
    border-bottom: 1px dashed;
    display: inline-block;
  }

  .str {
    color: #f74e52;
  }

  .int {
    color: #2995cd;
  }

  .con {
    color: #ffa623;
  }

  .per {
    color: #4f2a93;
  }

  #allocation {
    .title-row {
      margin-top: 1em;
      margin-bottom: 1em;

      h3 {
        font-family: Roboto;
        font-weight: 700;
        font-size: 16px;
        line-height: 20px;
        letter-spacing: 0px;
        color: $gray-10;
        margin: 0;
        display: inline-block;
      }
    }

    .points-allocation-header {
      display: flex;
      align-items: center;
      gap: 1em;
      height: 40px;
      transition: all 0.3s ease-in-out;

      &.auto-off {
        justify-content: space-between;
      }
    }

    .auto-allocate-toggle {
      display: inline-flex;
      align-items: center;
      transition: all 0.3s ease-in-out;

      ::v-deep .toggle-switch-outer {
        align-items: center;
      }

      ::v-deep .toggle-switch-description {
        font-family: Roboto;
        font-weight: 700;
        font-size: 16px;
        line-height: 20px;
        letter-spacing: 0px;
        color: $gray-10;
        margin: 0;
        display: inline-block;
      }

      ::v-deep .toggle-switch-label {
        margin-top: 0;
        margin-bottom: 0;
      }

      ::v-deep .toggle-switch-switch {
        margin: auto;
        margin-left: -2px;
        margin-right: -2px;
      }

      ::v-deep .toggle-switch-inner:before {
        background-color: #9A62FF;
      }
    }

    .allocation-dropdown-container {
      animation: slideInFromRight 0.3s ease-in-out;
    }

    @keyframes slideInFromRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .counter.badge {
      position: relative;
      top: -0.25em;
      left: 0.5em;
      color: #fff;
      background-color: $orange-50;
      box-shadow: 0 1px 1px 0 rgba(26, 24, 29, 0.12);
    }

    .task-allocation-box {
      height: 40px;
      background-color: #FFFFFF;
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding-left: 16px;
      padding-right: 16px;
      box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
      cursor: pointer;
    }

    .task-allocation-text {
      font-family: Roboto;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0px;
      color: $gray-50;
      flex: 1;
    }

    .dropdown-chevron {
      margin-left: 8px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: transform 0.2s;

      &.rotated {
        transform: rotate(180deg);
      }
    }

    .allocation-dropdown {
      position: absolute;
      background-color: #FFFFFF;
      border-radius: 4px;
      box-shadow: 0 2px 8px 0 rgba(26, 24, 29, 0.2);
      margin-top: 4px;
      padding: 8px 0;
      z-index: 10;
      min-width: 100%;
    }

    .allocation-option {
      padding: 8px 16px;
      display: flex;
      align-items: center;
      cursor: pointer;

      &:hover {
        background-color: #F9F9F9;
      }

      label {
        display: flex;
        align-items: center;
        margin: 0;
        cursor: pointer;
        flex: 1;

        input[type="radio"] {
          margin-right: 8px;
        }
      }

      .option-text {
        font-family: Roboto;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        letter-spacing: 0px;
        color: $gray-50;
      }
    }

    .allocation-divider {
      height: 1px;
      background-color: $gray-500;
      margin: 2em 0;
    }

    .str, .int, .con, .per {
      font-family: Roboto;
      font-weight: 700;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0px;
      text-transform: uppercase;
      margin-top: 26px;
      padding-bottom: 4px;
      border-bottom: 1px dashed;
      display: block;
      width: fit-content;
      width: -moz-fit-content;
    }

    .box {
      width: 148px;
      height: 84px;
      padding: .5em;
      margin: 0 auto;

      div {
        margin-top: 0;
      }

      .number {
        font-family: Roboto;
        font-weight: 400;
        font-size: 40px;
        line-height: 48px;
        letter-spacing: 0px;
        text-align: left;
        color: $gray-100;
        display: inline-block;
        vertical-align: baseline;
      }

      .points {
        display: inline-block;
        font-family: Roboto;
        font-weight: 700;
        font-size: 12px;
        line-height: 20px;
        letter-spacing: 0px;
        text-align: left;
        color: $gray-200;
        margin-left: 0.5em;
        vertical-align: baseline;
        text-transform: uppercase;
      }

      .arrow-container {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .triangle-up {
        width: 21px !important;
        height: 13px !important;
        min-width: 21px !important;
        min-height: 13px !important;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 21px !important;
          height: 13px !important;
          min-width: 21px !important;
          min-height: 13px !important;
        }
      }

      .triangle-up:hover {
        opacity: 0.8;
      }
    }
  }

  #attributes {
    .number {
      font-size: 64px;
      font-weight: bold;
      color: #686274;
      display: block;
    }

    .attribute-label {
      text-align: center;
    }

    .stat-title {
      display: inline-block;
    }

    .bonus-stats {
      border-left: 1px solid $gray-500;
      margin-top: 8px;
      margin-bottom: 8px;
      padding-left: 1em;
      padding-top: 10px;

      li {
        font-family: Roboto;
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
        letter-spacing: 0px;
        color: $gray-300;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-right: 1em;

        strong {
          font-weight: 700;
          color: $gray-200;
        }
      }
    }
  }

  .stat-allocation-info {
    margin-top: 3em;
    margin-bottom: 0.5em;
    padding-top: 2em;
    padding-bottom: 0.25em;
    text-align: center;

    p {
      font-family: Roboto;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0px;
      color: $gray-100;
      margin: 0;
    }
  }

  .well {
    background-color: #edecee;
    border-radius: 2px;
    padding: 0.4em;
    padding-top: 1em;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 15px;
  }

  .well.pet-mount-well {
    padding-left: 15px;
    padding-bottom: 1em;
    flex-wrap: nowrap;
    justify-content: flex-start;

    strong {
      margin-right: .2em;
    }
  }

  .box {
    width: 94px;
    height: 92px;
    border-radius: 2px;
    border: dotted 1px #c3c0c7;
  }

  .white {
    border-radius: 2px;
    background: #FFFFFF;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
    border: 1px solid transparent;
  }

  .item-wrapper {
    text-align: center;
    vertical-align: top;
    margin-bottom: 0.5rem;
  }

  .pet-mount-row {
    margin-top: 2em;
    margin-bottom: 2em;
  }

  .mount {
    margin-top: -0.2em !important;
  }

  .save-row {
    margin: 2em 0 1em 0;
    justify-content: center;
  }

    .gear.box {
      vertical-align: top;
      // margin: 0 auto;
    }

    .gear-label {
      margin: 0 auto;
      margin-top: 0.5rem;
      min-height: 1rem;
      font-family: Roboto;
      font-size: 12px;
      font-weight: bold;
      line-height: 1.33;
      text-align: center;
      color: $gray-200;

      text-overflow: ellipsis;

      // the following 4 lines are needed for the 2 line clamp
      // the non-prefixes not supported "anywhere" but these "-webkit"-ones are
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      // breaks the long words without a space
      word-break: break-word;
    }

  @media (max-width: 850px) {
    #stats .col-md-6 {
      flex: none;
      max-width: 100%;
    }
  }
  @media(max-width: 990px) {
    .modal-body #stats .col-md-6 {
      flex: none;
      max-width: 100%;
    }

    [class^="stats-section-"] {
      margin-bottom: 30px;
    }
    #allocation {
      .box {
        width: 100%;
        height: 100%;
        .col-9 {
          padding: 0;
          margin: 0;
        }
        .col-9 div:first-child {
          font-size: 12px;
        }
      }
    }
  }
</style>
