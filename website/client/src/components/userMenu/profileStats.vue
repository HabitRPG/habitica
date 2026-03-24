<template>
  <div
    id="stats"
    class="standard-page"
  >
    <div
      id="attributes"
      class="row"
    >
      <h2 class="col-12">
        {{ $t('attributes') }}
      </h2>
      <div
        v-for="(statInfo, stat) in stats"
        :key="stat"
        class="col-12 col-md-3"
      >
        <div class="stats-card">
          <div class="card-header" :class="stat">
            <span
              class="hint"
              :popover-title="$t(statInfo.title)"
              popover-placement="right"
              :popover="$t(statInfo.popover)"
              popover-trigger="mouseenter"
            ></span>
            <div class="stat-title">
              {{ $t(statInfo.title) }}
            </div>
          </div>
          <div class="card-body">
            <strong
              class="number"
              :class="stat"
            >{{ totalStatPoints(stat) | floorWholeNumber }}</strong>
            <div class="stats-divider"></div>
            <ul class="bonus-stats">
              <li>
                <strong>{{ $t('level') }}:</strong>
                <span>{{ statsComputed.levelBonus[stat] }}</span>
              </li>
              <li>
                <strong>{{ $t('equipment') }}:</strong>
                <span :class="{ 'positive-stat': statsComputed.gearBonus[stat] !== 0 }">
                  {{ statsComputed.gearBonus[stat] !== 0 ? '+' : '' }}{{
                    statsComputed.gearBonus[stat] + statsComputed.classBonus[stat]
                  }}
                </span>
              </li>
              <li>
                <strong>{{ $t('allocated') }}:</strong>
                <span>{{ totalAllocatedStats(stat) }}</span>
              </li>
              <li>
                <strong>{{ $t('buffs') }}:</strong>
                <span :class="{ 'positive-stat': user.stats.buffs[stat] !== 0 }">
                  {{ user.stats.buffs[stat] !== 0 ? '+' : '' }}{{
                    user.stats.buffs[stat]
                  }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="showAllocation"
      id="allocation"
    >
      <div class="row title-row">
        <div class="col-12">
          <div class="points-allocation-header">
            <h2>
              {{ $t('statPoints') }}
              <div
                v-if="user.stats.points > 0"
                class="counter badge badge-pill"
              >
                {{ pointsRemaining }} {{ $t('pointsAvailable') }}
              </div>
            </h2>
          </div>
        </div>
      </div>
      <div class="stat-allocation-info">
        <p>{{ $t('statAllocationInfo') }}</p>
        <div
          v-if="userLevel100Plus"
          v-once
          class="level-100-message"
          v-html="$t('noMoreAllocate')"
        ></div>
      </div>
      <div class="row allocation-boxes-row">
        <div
          v-for="(statInfo, stat) in allocateStatsList"
          :key="stat"
          class="col-12 col-md-3 allocation-box-col"
        >
          <div class="allocation-card">
            <div class="allocation-card-content">
              <div class="allocation-card-title" :class="stat">
                {{ $t(stats[stat].title) }}
              </div>
              <div class="allocation-card-value">
                {{ totalAllocatedStats(stat) }}
              </div>
            </div>
            <div class="allocation-card-divider"></div>
            <div class="allocation-card-arrows">
              <div
                class="allocation-arrow allocation-arrow-up"
                :class="{ disabled: user.stats.points === 0 }"
                @click="user.stats.points > 0 ? allocate(stat) : null"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 14 9"
                  width="16"
                  height="10"
                >
                  <path
                    fill="none"
                    fill-rule="evenodd"
                    stroke-width="2.5"
                    d="M13 1L7 7 1 1"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="allocation-controls-row">
        <div class="auto-allocate-toggle">
          <toggle-switch
            v-model="user.preferences.automaticAllocation"
            :label="$t('autoAllocate')"
            @change="setAutoAllocate()"
          />
        </div>
        <span class="allocation-method-label">{{ $t('allocationMethod') }}</span>
        <div
          class="allocation-dropdown-container"
          :class="{'disabled': !user.preferences.automaticAllocation}"
        >
          <select-list
            :items="allocationModes"
            :value="user.preferences.allocationMode || 'flat'"
            :disabled="!user.preferences.automaticAllocation"
            key-prop="key"
            active-key-prop="key"
            @select="setAllocationMode($event.key)"
          >
            <template #item="{ item, button }">
              <div class="allocation-option-content">
                <span class="option-text">
                  {{ $t(item.label) }}
                </span>
                <span v-if="!button && item.description" class="option-description">
                  {{ $t(item.description) }}
                </span>
              </div>
            </template>
          </select-list>
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
              <Sprite
                v-if="user.preferences.background && user.preferences.background !== ''"
                :image-name="'icon_background_' + user.preferences.background" />
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
import selectList from '@/components/ui/selectList';

const DROP_ANIMALS = keys(Content.pets);
const TOTAL_NUMBER_OF_DROP_ANIMALS = DROP_ANIMALS.length;
export default {
  components: {
    toggleSwitch,
    attributesGrid,
    Sprite,
    selectList,
  },
  props: ['user', 'showAllocation'],
  data () {
    return {
      allocationModes: [
        { key: 'flat', label: 'evenAllocation', description: 'evenAllocationPop' },
        { key: 'classbased', label: 'classAllocation', description: 'classAllocationPop' },
        { key: 'taskbased', label: 'taskAllocation', description: 'taskAllocationPop' },
      ],
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
    setAllocationMode (mode) {
      const settings = {
        'preferences.allocationMode': mode,
      };
      this.$store.dispatch('user:set', settings);
    },
    getAllocationModeLabel (key) {
      const mode = this.allocationModes.find(m => m.key === key);
      return mode ? mode.label : 'evenAllocation';
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

  #attributes {
    &.row {
      margin-left: -0.5em;
      margin-right: -0.5em;
    }

    .col-md-3 {
      padding-left: 0.5em;
      padding-right: 0.5em;
    }

    h2 {
      font-family: 'Roboto Condensed', Roboto, sans-serif;
      font-weight: 700;
      font-size: 20px;
      line-height: 28px;
      letter-spacing: 0px;
      color: $gray-10;
    }
  }

  .stats-card {
    border-radius: 8px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
    margin-bottom: 0.5em;
    overflow: hidden;
  }

  .card-header {
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .hint {
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
    }

    &.str {
      background-color: #f74e52;
    }

    &.int {
      background-color: #2995cd;
    }

    &.con {
      background-color: #ffa623;
    }

    &.per {
      background-color: #4f2a93;
    }

    .stat-title {
      text-transform: capitalize;
      font-family: Roboto;
      font-weight: 700;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0px;
      color: #ffffff;
    }
  }

  .card-body {
    padding: 0.375em 1em 0.375em 1em;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stats-divider {
    width: calc(100% + 2em);
    height: 1px;
    background-color: #d3d2d5;
    margin: 0.375em -1em;
  }

  #allocation {
    .title-row {
      margin-top: 1em;
      margin-bottom: 0.5em;
      align-items: baseline;

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
      h2 {
        font-family: 'Roboto Condensed', Roboto, sans-serif;
        font-weight: 700;
        font-size: 20px;
        line-height: 28px;
        letter-spacing: 0px;
        color: $gray-10;
        margin: 0;
        display: inline-block;
      }
    }

    .allocation-controls-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5em;
      margin-top: 1em;
      margin-bottom: 1em;
      align-items: center;
    }

    .auto-allocate-toggle {
      display: inline-flex;
      align-items: baseline;
      transition: all 0.3s ease-in-out;
      transform: translateY(2px);

      ::v-deep .toggle-switch-outer {
        align-items: baseline;
      }

      ::v-deep .toggle-switch-description {
        font-family: Roboto;
        font-weight: 700;
        font-size: 14px;
        line-height: 24px;
        letter-spacing: 0px;
        color: $gray-10;
        margin: 0;
        display: inline-block;
      }

      ::v-deep .toggle-switch {
        align-self: center;
        transform: translateY(-0.5px);
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
        background-color: #1CA372;
      }
    }

    .allocation-method-label {
      font-family: Roboto;
      font-weight: 700;
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0px;
      color: $gray-10;
      white-space: nowrap;
      transform: translateY(2px);
    }

    .allocation-dropdown-container {
      position: relative;
      flex: 1;
      min-width: 0;

      &.disabled {
        opacity: 0.5;
        pointer-events: none;
        cursor: not-allowed;
      }

      .select-list {
        width: 100%;

        ::v-deep > div {
          position: relative;
          width: 100%;
        }

        ::v-deep .dropdown {
          width: 100%;
        }

        ::v-deep .dropdown-toggle {
          width: 100%;
          background-color: #FFFFFF;
          border-radius: 4px;
          padding: 10px 16px;
          box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
          border: none;
          text-align: left;

          &::after {
            color: #A5A1AC;
          }
        }

        ::v-deep .dropdown-menu {
          min-width: 100%;
          width: 100%;
          border-radius: 4px;
          box-shadow: 0 2px 8px 0 rgba(26, 24, 29, 0.2);
          padding: 24px 0;
          margin-top: 8px;
          top: 100% !important;
        }

        ::v-deep .selectListItem {
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }
        }

        ::v-deep .selectListItem .dropdown-item {
          padding: 0 16px !important;
          height: auto !important;
          white-space: normal;
          word-wrap: break-word;
        }
      }

      .allocation-option-content {
        display: block;
        width: 100%;

        .option-text {
          display: block;
          font-family: Roboto;
          font-weight: 400;
          font-size: 14px;
          line-height: 24px;
          letter-spacing: 0px;
          color: $gray-50;
          margin-bottom: 4px;
        }

        .option-description {
          display: block;
          font-family: Roboto;
          font-weight: 400;
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0px;
          color: $gray-200;
        }
      }
    }

    .counter.badge {
      position: relative;
      top: -0.25em;
      left: 0.5em;
      color: #fff;
      background-color: #1CA372;
      padding-left: 1em;
      padding-right: 1em;
      box-shadow: none;
      font-family: Roboto, sans-serif;
    }

    .allocation-divider {
      height: 1px;
      background-color: $gray-500;
      margin: 2em 0;
    }

    .allocation-boxes-row {
      margin-left: -0.375em;
      margin-right: -0.375em;
    }

    .allocation-box-col {
      padding-left: 0.375em;
      padding-right: 0.375em;
    }

    .allocation-card {
      background: #FFFFFF;
      border: 1px solid #C3C0C7;
      border-radius: 8px;
      height: 76px;
      width: 100%;
      padding: 8px 12px;
      display: flex;
      flex-direction: row;
      align-items: center;
      box-shadow: 0 1px 1px 0 rgba(26, 24, 29, 0.04);
      user-select: none;
      position: relative;
    }

    .allocation-card-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      flex: 1;
      gap: 2px;
    }

    .allocation-card-title {
      font-family: Roboto;
      font-weight: 700;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0px;
      text-transform: capitalize;

      &.str {
        color: #f74e52;
      }

      &.int {
        color: #2995cd;
      }

      &.con {
        color: #ffa623;
      }

      &.per {
        color: #4f2a93;
      }
    }

    .allocation-card-value {
      font-family: Roboto;
      font-weight: 400;
      font-size: 24px;
      line-height: 32px;
      letter-spacing: 0px;
      color: $gray-100;
    }

    .allocation-card-divider {
      width: 1px;
      background-color: #C3C0C7;
      position: absolute;
      right: 52px;
      top: 0;
      bottom: 0;
    }

    .allocation-card-arrows {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      right: 18px;
      top: 50%;
      transform: translateY(-50%);
    }

    .allocation-arrow {
      width: 16px;
      height: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 16px;
        height: 10px;
        display: block;

        path {
          stroke: #686274;
        }
      }

      &:not(.disabled):hover {
        svg path {
          stroke: #74708C;
        }
      }

      &.disabled {
        cursor: not-allowed;

        svg path {
          stroke: #C3C0C7;
        }
      }
    }

    .allocation-arrow-up {
      transform: rotate(180deg);
    }
  }

  #attributes {
    .number {
      font-size: 48px;
      font-weight: bold;
      display: block;
      text-align: center;
      margin-bottom: 0;

      &.str {
        color: #f74e52;
      }

      &.int {
        color: #2995cd;
      }

      &.con {
        color: #ffa623;
      }

      &.per {
        color: #4f2a93;
      }
    }

    .bonus-stats {
      list-style-type: none;
      padding: 0.5em 0 0.25em 0;
      margin: 0;
      width: 100%;

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
        padding: 0 0;

        strong {
          font-family: Roboto;
          font-weight: 700;
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0px;
          color: #686274;
          padding-left: 0.5em;
        }

        span {
          padding-right: 0.5em;
        }

        .positive-stat {
          color: #1CA372;
          font-weight: 600;
        }
      }
    }
  }

  .stat-allocation-info {
    margin-top: 1em;
    margin-bottom: 1em;
    text-align: left;

    p {
      font-family: Roboto;
      font-weight: 400;
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0px;
      color: $gray-50;
      margin: 0;
    }

    .level-100-message {
      font-family: Roboto;
      font-weight: 700;
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0px;
      color: #C92B2B;
      margin: 1em 0 1em 0;

      a {
        color: #6133B4;
        text-decoration: none;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
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
    #stats .col-md-3 {
      flex: none;
      max-width: 100%;
    }

    #allocation {
      .allocation-box-col {
        margin-bottom: 0.75em;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .allocation-controls-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75em;

        .auto-allocate-toggle,
        .allocation-method-label,
        .allocation-dropdown-container {
          width: 100%;
        }
      }
    }
  }
  @media(max-width: 990px) {
    .modal-body #stats .col-md-3 {
      flex: none;
      max-width: 100%;
    }

    [class^="stats-section-"] {
      margin-bottom: 30px;
    }
    #allocation {
      .allocation-box-col {
        margin-bottom: 0.75em;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .allocation-controls-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75em;

        .auto-allocate-toggle,
        .allocation-method-label,
        .allocation-dropdown-container {
          width: 100%;
        }
      }
    }
  }
</style>

<style lang="scss">
@import '@/assets/scss/colors.scss';

.selectListItem .dropdown-item:hover .option-text {
  color: $purple-300 !important;
}

.allocation-dropdown-container {
  position: relative;
  z-index: 1050;

  .select-list {
    transform: translateY(2px);

    .dropdown-toggle {
      display: flex;
      align-items: center;

      .allocation-option-content {
        transform: translateY(1px);
      }
    }

    .dropdown-menu {
      min-width: 100%;
      width: 100%;
      border-radius: 4px;
      box-shadow: 0 2px 8px 0 rgba(26, 24, 29, 0.2);
      padding: 12px 0;
      margin-top: 4px;
    }

    .selectListItem {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .selectListItem .dropdown-item {
      padding: 8px 16px !important;
      height: auto !important;
      white-space: normal;
      word-wrap: break-word;
    }
  }

  .allocation-option-content {
    display: block;
    width: 100%;

    .option-text {
      display: block;
      font-family: Roboto;
      font-weight: 400;
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0px;
      color: $gray-50;
      margin-bottom: 4px;
    }

    .option-description {
      display: block;
      font-family: Roboto;
      font-weight: 400;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 0px;
      color: $gray-200;
    }
  }
}
</style>
