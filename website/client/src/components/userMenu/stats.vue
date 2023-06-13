<template>
  <div class="standard-page">
    <h1>Stats</h1>
    <div class="row">
      <div class="col-6">
        <h2 class="text-center">
          Equipment
        </h2>
        <div class="well row">
          <div class="col-4"></div>
        </div>
      </div>
      <div class="col-6">
        <h2 class="text-center">
          Costume
        </h2>
      </div>
    </div>
    <div class="row">
      <div class="col-6">
        <h2 class="text-center">
          Pet
        </h2>
      </div>
      <div class="col-6">
        <h2 class="text-center">
          Mount
        </h2>
      </div>
    </div>
    <div class="row">
      <hr class="col-12">
      <h2 class="col-12">
        Attributes
      </h2>
      <div class="col-6"></div>
      <div class="col-6"></div>
    </div>
    <div class="row">
      <div class="col-6"></div>
      <div class="col-6"></div>
    </div>
    <div class="row">
      <div class="col-4">
        <div>
          <h3>Basics</h3>
          <ul>
            <li>Health: {{ user.stats.hp }}/{{ user.stats.maxHealth }}</li>
            <li>Mana: {{ user.stats.mp }}/{{ user.stats.maxMP }}</li>
            <li>Gold: {{ user.stats.gp }}</li>
            <li>Level: {{ user.stats.lvl }}</li>
            <li>Experience: {{ user.stats.exp }}</li>
          </ul>
        </div>
        <div v-if="user.flags.itemsEnabled">
          <h3>Battle Gear</h3>
          <ul>
            <!-- eslint-disable vue/no-use-v-if-with-v-for -->
            <li
              v-for="(key) in user.items.gear.equipped"
              v-if="flatGear[key]"
              :key="key"
            >
              <!-- eslint-enable vue/no-use-v-if-with-v-for -->
              <strong>{{ flatGear[key].text() }}</strong>
              <strong
                v-if="flatGear[key].str
                  || flatGear[key].con || flatGear[key].per || flatGear[key].int"
              >
                :&nbsp;
                <!-- eslint-disable vue/no-use-v-if-with-v-for -->
                <span
                  v-for="stat in ['str','con','per','int']"
                  v-if="flatGear[key][stat]"
                  :key="stat"
                >{{ flatGear[key][stat] }} {{ $t(stat) }}&nbsp;</span>
                <!-- eslint-enable vue/no-use-v-if-with-v-for -->
              </strong>
            </li>
          </ul>
        </div>
        <div v-if="user.preferences.costume">
          <h4 v-once>
            {{ $t('costume') }}
          </h4>
          <div>
            <div ng-repeat="(key, itemType) in user.items.gear.costume">
              <strong>{{ flatGear[key].text() }}</strong>
            </div>
          </div>
        </div>
        <div>
          <h3>Background</h3>
          <ul>
            <li v-if="!user.preferences.background">
              None
            </li>
            <li v-if="user.preferences.background">
              {{ user.preferences.background }}
            </li>
          </ul>
        </div>
        <div>
          <h3 v-once>
            {{ $t('pets') }}
          </h3>
          <ul>
            <li ng-if="user.items.currentPet">
              {{ $t('activePet') }}:
              {{ formatAnimal(user.items.currentPet, 'pet') }}
            </li>
            <li>
              {{ $t('petsFound') }}:
              {{ totalCount(user.items.pets) }}
            </li>
            <li>
              {{ $t('beastMasterProgress') }}:
              {{ beastMasterProgress(user.items.pets) }}
            </li>
          </ul>
          <h3 v-once>
            {{ $t('mounts') }}
          </h3>
          <ul>
            <li v-if="user.items.currentMount">
              {{ $t('activeMount') }}:
              {{ formatAnimal(user.items.currentMount, 'mount') }}
            </li>
            <li>
              {{ $t('mountsTamed') }}:
              {{ totalCount(user.items.mounts) }}
            </li>
            <li>
              {{ $t('mountMasterProgress') }}:
              {{ mountMasterProgress(user.items.mounts) }}
            </li>
          </ul>
        </div>
      </div>
      <div class="col-4">
        <h3 v-once>
          {{ $t('attributes') }}
        </h3>
        <div
          v-for="(statInfo, stat) in stats"
          :key="stat"
          class="row"
        >
          <div
            class="col-4"
            :id="statInfo.title"
          >
            <strong> {{ $t(statInfo.title)}} </strong>
            <strong>: {{ statsComputed[stat] }}</strong>
            <b-popover
              :target="statInfo.title"
              triggers="hover focus"
              placement="right"
              :prevent-overflow="false"
              :content="$t(statInfo.popover)"
            />
          </div>
          <div class="col-6">
            <ul class="bonus-stats">
              <li>
                {{ $t('levelBonus') }}
                {{ statsComputed.levelBonus[stat] }}
              </li>
              <li>
                {{ $t('gearBonus') }}
                {{ statsComputed.gearBonus[stat] }}
              </li>
              <li>
                {{ $t('classBonus') }}
                {{ statsComputed.classBonus[stat] }}
              </li>
              <li>
                {{ $t('allocatedPoints') }}
                {{ user.stats[stat] }}
              </li>
              <li>
                {{ $t('buffs') }}
                {{ user.stats.buffs[stat] }}
              </li>
            </ul>
          </div>
        </div>
        <div
          v-if="user.stats.buffs.stealth"
          id="stealthBuff"
        >
          <strong
            v-once
            class="hint"
          >{{ $t('stealth') }}</strong>
          <strong>: {{ user.stats.buffs.stealth }}&nbsp;</strong>
          <b-popover
            target="stealthBuff"
            triggers="hover focus"
            placement="right"
            :prevent-overflow="false"
            :content="$t('stealthNewDay')"
          />
        </div>
        <div
          v-if="user.stats.buffs.streaks"
          id="streaksFrozenBuff"
        >
          <div>
            <strong>
              {{ $t('streaksFrozen') }}
            </strong>
            <b-popover
              target="streaksFrozenBuff"
              triggers="hover focus"
              placement="right"
              :prevent-overflow="false"
              :content="$t('streaksFrozenText')"
            />
          </div>
        </div>
      </div>
      <div
        v-if="hasClass"
        class="col-4"
      >
        <h3 v-once>
          {{ $t('characterBuild') }}
        </h3>
        <h4 v-once>
          {{ $t('class') + ': ' }}
          <span>{{ classText }}&nbsp;</span>
          <button
            v-once
            class="btn btn-danger btn-xs"
            @click="changeClass(null)"
          >
            {{ $t('changeClass') }}
          </button>
          <small class="cost">
            3
            <span class="Pet_Currency_Gem1x inline-gems"></span>
          </small>
        </h4>
        <div>
          <div>
            <p
              v-if="userLevel100Plus"
              v-once
            >
              {{ $t('noMoreAllocate') }}
            </p>
            <p
              v-if="user.stats.points || userLevel100Plus"
              id="pointAllocation"
            >
              <strong class="inline">{{ user.stats.points }}&nbsp;</strong>
              <strong> {{ $t('unallocated') }} </strong>
              <b-popover
                target="pointAllocation"
                triggers="hover focus"
                placement="right"
                :prevent-overflow="false"
                :content="$t('levelPopover')"
              />
            </p>
          </div>
          <div>
            <fieldset class="auto-allocate">
              <div
                id="preferenceAutomaticAllocation"
                class="checkbox"
              >
                <label>
                  <input
                    v-model="user.preferences.automaticAllocation"
                    type="checkbox"
                    @change="set({
                      'preferences.automaticAllocation': user.preferences.automaticAllocation,
                      'preferences.allocationMode': 'taskbased'
                    })"
                  >
                  <b-popover
                    target="preferenceAutomaticAllocation"
                    triggers="hover focus"
                    placement="right"
                    :prevent-overflow="false"
                    :content="$t('autoAllocationPop')"
                  />
                  {{ $t('autoAllocation') }}
                </label>
              </div>
              <form
                v-if="user.preferences.automaticAllocation"
                style="margin-left:1em"
              >
                <div
                  id="optionFlatAllocation"
                  class="radio"
                >
                  <label>
                    <input
                      v-model="user.preferences.allocationMode"
                      type="radio"
                      name="allocationMode"
                      value="flat"
                      @change="set({'preferences.allocationMode': 'flat'})"
                    >
                    <span class="hint">
                      {{ $t('evenAllocation') }}
                    </span>
                    <b-popover
                      target="optionFlatAllocation"
                      triggers="hover focus"
                      placement="right"
                      :prevent-overflow="false"
                      :content="$t('evenAllocationPop')"
                    />
                  </label>
                </div>
                <div
                  id="optionClassAllocation"
                  class="radio"
                >
                  <label>
                    <input
                      v-model="user.preferences.allocationMode"
                      type="radio"
                      name="allocationMode"
                      value="classbased"
                      @change="set({'preferences.allocationMode': 'classbased'})"
                    >
                    <span class="hint">
                      {{ $t('classAllocation') }}
                    </span>
                    <b-popover
                      target="optionClassAllocation"
                      triggers="hover focus"
                      placement="right"
                      :prevent-overflow="false"
                      :content="$t('classAllocationPop')"
                    />
                  </label>
                </div>
                <div
                  id="optionTaskAllocation"
                  class="radio"
                >
                  <label>
                    <input
                      v-model="user.preferences.allocationMode"
                      type="radio"
                      name="allocationMode"
                      value="classbased"
                      @change="set({'preferences.allocationMode': 'taskbased'})"
                    >
                    <span class="hint">
                      {{ $t('taskAllocation') }}
                    </span>
                    <b-popover
                      target="optionTaskAllocation"
                      triggers="hover focus"
                      placement="right"
                      :prevent-overflow="false"
                      :content="$t('taskAllocationPop')"
                    />
                  </label>
                </div>
              </form>
              <div
                v-if="user.preferences.automaticAllocation
                  && !(user.preferences.allocationMode === 'taskbased') && (user.stats.points > 0)"
                id="buttonDistributePoints"
              >
                <button
                  class="btn btn-primary btn-xs"
                  @click="allocateNow({})"
                >
                  <span class="glyphicon glyphicon-download"></span>
                  &nbsp;
                  {{ $t('distributePoints') }}
                </button>
                <b-popover
                  target="buttonDistributePoints"
                  triggers="hover focus"
                  placement="right"
                  :prevent-overflow="false"
                  :content="$t('distributePointsPop')"
                />
              </div>
            </fieldset>
          </div>
          <div
            v-for="(statInfo, stat) in allocateStatsList"
            :key="stat"
            class="row"
          >
            <div
              :id="`${stat}-info`"
              class="col-8"
            >
              {{ $t(statInfo.title) + user.stats[stat] }}
              <b-popover
                :target="`${stat}-info`"
                triggers="hover focus"
                placement="right"
                :prevent-overflow="false"
                :content="$t(statInfo.popover)"
              />
            </div>
            <div
              v-if="user.stats.points"
              :id="`${stat}-allocate`"
              class="col-4"
              @click="allocate(stat)"
            >
              <button class="btn btn-primary">
                +
              </button>
              <b-popover
                :target="`${stat}-allocate`"
                triggers="hover focus"
                placement="right"
                :prevent-overflow="false"
                :content="$t(statInfo.allocatePop)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .btn-xs {
    font-size: 12px;
    padding: .2em;
  }
</style>

<script>
import size from 'lodash/size';
import keys from 'lodash/keys';
import { mapState } from '@/libs/store';
import Content from '@/../../common/script/content';
import { beastMasterProgress, mountMasterProgress } from '@/../../common/script/count';
import statsComputed from '@/../../common/script/libs/statsComputed';
import autoAllocate from '@/../../common/script/fns/autoAllocate';
import changeClass from '@/../../common/script/ops/changeClass';
import allocate from '@/../../common/script/ops/stats/allocate';

const DROP_ANIMALS = keys(Content.pets);
const TOTAL_NUMBER_OF_DROP_ANIMALS = DROP_ANIMALS.length;

export default {
  data () {
    return {
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
      allocateStatsList: {
        str: { title: 'allocateStr', popover: 'strengthText', allocatepop: 'allocateStrPop' },
        int: { title: 'allocateInt', popover: 'intText', allocatepop: 'allocateIntPop' },
        con: { title: 'allocateCon', popover: 'conText', allocatepop: 'allocateConPop' },
        per: { title: 'allocatePer', popover: 'perText', allocatepop: 'allocatePerPop' },
      },
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
      flatGear: 'content.gear.flat',
    }),
    statsComputed () {
      return statsComputed(this.user);
    },
    userLevel100Plus () {
      return this.user.stats.lvl >= 100;
    },
    classText () {
      const classTexts = {
        warrior: this.$t('warrior'),
        wizard: this.$t('mage'),
        rogue: this.$t('rogue'),
        healer: this.$t('healer'),
      };

      return classTexts[this.user.stats.class];
    },
    hasClass () {
      return this.$store.getters['members:hasClass'](this.user);
    },
  },
  methods: {
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
      return window.env.t('noBackground');
    },
    totalCount (objectToCount) {
      const total = size(objectToCount);
      return total;
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
    changeClass () {
      changeClass(this.user);
    },
    allocate (stat) {
      allocate(this.user, stat);
    },
    allocateNow () {
      autoAllocate(this.user);
    },
  },
};
</script>
