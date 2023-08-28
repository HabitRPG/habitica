<template>
  <div
    id="stats"
    class="standard-page"
  >
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
              :class="{white: equippedItems[key] && equippedItems[key].indexOf('base_0') === -1}"
            >
              <div :class="`shop_${equippedItems[key]}`"></div>
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
              :class="{white: costumeItems[key] && costumeItems[key].indexOf('base_0') === -1}"
            >
              <div :class="`shop_${costumeItems[key]}`"></div>
            </div>
            <!-- Show background on 8th tile rather than a piece of equipment.-->
            <div
              v-if="label === 'skip'"
              class="gear box"
              :class="{white: user.preferences.background}"
              style="overflow:hidden"
            >
              <div :class="'icon_background_' + user.preferences.background"></div>
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
                <div
                  class="Pet"
                  :class="`Pet-${user.items.currentPet}`"
                ></div>
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
              <div
                class="mount"
                :class="`Mount_Icon_${user.items.currentMount}`"
              ></div>
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
          <div class="col-12 col-md-4 attribute-label">
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
                {{ statsComputed.levelBonus[stat] }}
              </li>
              <li>
                <strong>{{ $t('equipment') }}:</strong>
                {{ statsComputed.gearBonus[stat] }}
              </li>
              <li>
                <strong>{{ $t('class') }}:</strong>
                {{ statsComputed.classBonus[stat] }}
              </li>
              <li>
                <strong>{{ $t('allocated') }}:</strong>
                {{ totalAllocatedStats(stat) }}
              </li>
              <li>
                <strong>{{ $t('buffs') }}:</strong>
                {{ user.stats.buffs[stat] }}
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
        <div class="col-12 col-md-6">
          <h3
            v-if="userLevel100Plus"
            v-once
            v-html="$t('noMoreAllocate')"
          ></h3>
          <h3>
            {{ $t('statPoints') }}
            <div
              v-if="user.stats.points || userLevel100Plus"
              class="counter badge badge-pill"
            >
              {{ pointsRemaining }}
            </div>
          </h3>
        </div>
        <div class="col-12 col-md-6">
          <div class="float-right">
            <toggle-switch
              v-model="user.preferences.automaticAllocation"
              :label="$t('autoAllocation')"
              @change="setAutoAllocate()"
            />
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
            <div class="col-3">
              <div>
                <div
                  v-if="showStatsSave"
                  class="up"
                  @click="allocate(stat)"
                ></div>
              </div>
              <div>
                <div
                  v-if="showStatsSave"
                  class="down"
                  @click="deallocate(stat)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="showStatsSave"
        class="row save-row"
      >
        <button
          class="btn btn-primary"
          :disabled="loading"
          @click="saveAttributes()"
        >
          {{ loading ? $t('loading') : $t('save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import size from 'lodash/size';
import keys from 'lodash/keys';
import toggleSwitch from '@/components/ui/toggleSwitch';
import attributesGrid from '@/components/inventory/equipment/attributesGrid';

import { mapState } from '@/libs/store';
import Content from '@/../../common/script/content';
import { beastMasterProgress, mountMasterProgress } from '@/../../common/script/count';
import autoAllocate from '@/../../common/script/fns/autoAllocate';
import allocateBulk from '@/../../common/script/ops/stats/allocateBulk';
import statsComputed from '@/../../common/script/libs/statsComputed';

const DROP_ANIMALS = keys(Content.pets);
const TOTAL_NUMBER_OF_DROP_ANIMALS = DROP_ANIMALS.length;
export default {
  components: {
    toggleSwitch,
    attributesGrid,
  },
  props: ['user', 'showAllocation'],
  data () {
    return {
      loading: false,
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
      statUpdates: {
        str: 0,
        int: 0,
        con: 0,
        per: 0,
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
    showStatsSave () {
      return Boolean(this.user.stats.points);
    },
    pointsRemaining () {
      let { points } = this.user.stats;
      Object.values(this.statUpdates).forEach(value => {
        points -= value;
      });
      return points;
    },

  },
  methods: {
    getGearTitle (key) {
      return this.flatGear[key].text();
    },
    totalAllocatedStats (stat) {
      return this.user.stats[stat] + this.statUpdates[stat];
    },
    totalStatPoints (stat) {
      return this.statsComputed[stat] + this.statUpdates[stat];
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
    allocate (stat) {
      if (this.pointsRemaining === 0) return;
      this.statUpdates[stat] += 1;
    },
    deallocate (stat) {
      if (this.statUpdates[stat] === 0) return;
      this.statUpdates[stat] -= 1;
    },
    async saveAttributes () {
      this.loading = true;

      const statUpdates = {};
      ['str', 'int', 'per', 'con'].forEach(stat => {
        if (this.statUpdates[stat] > 0) statUpdates[stat] = this.statUpdates[stat];
      });

      // reset statUpdates to zero before request to avoid display errors while waiting for server
      this.statUpdates = {
        str: 0,
        int: 0,
        con: 0,
        per: 0,
      };

      allocateBulk(this.user, { body: { stats: statUpdates } });

      await axios.post('/api/v4/user/allocate-bulk', {
        stats: statUpdates,
      });

      this.loading = false;
    },
    allocateNow () {
      autoAllocate(this.user);
    },
    setAutoAllocate () {
      const settings = {
        'preferences.automaticAllocation': Boolean(this.user.preferences.automaticAllocation),
        'preferences.allocationMode': 'taskbased',
      };

      this.$store.dispatch('user:set', settings);
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

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
    }

    .counter.badge {
      position: relative;
      top: -0.25em;
      left: 0.5em;
      color: #fff;
      background-color: #ff944c;
      box-shadow: 0 1px 1px 0 rgba(26, 24, 29, 0.12);
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
        font-size: 40px;
        text-align: left;
        color: #686274;
        display: inline-block;
      }

      .points {
        display: inline-block;
        font-weight: bold;
        line-height: 1.67;
        text-align: left;
        color: #878190;
        margin-left: .5em;
      }

      .up, .down {
        border: solid #a5a1ac;
        border-width: 0 3px 3px 0;
        display: inline-block;
        padding: 3px;
      }

      .up:hover, .down:hover {
        cursor: pointer;
      }

      .up {
        transform: rotate(-135deg);
        -webkit-transform: rotate(-135deg);
        margin-top: 1em;
      }

      .down {
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
      }
    }
  }

  #attributes {
    .number {
      font-size: 64px;
      font-weight: bold;
      color: #686274;
    }

    .attribute-label {
      text-align: center;
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
          font-size: 13px;
        }
      }
    }
  }
</style>
