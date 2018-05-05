<template lang="pug">
  .standard-page
    h1 Stats
    .row
      .col-6
        h2.text-center Equipment
        .well.row
          .col-4
      .col-6
        h2.text-center Costume
    .row
      .col-6
        h2.text-center Pet
      .col-6
        h2.text-center Mount
    .row
      hr.col-12
      h2.col-12 Attributes
      .col-6
      .col-6
    .row
      .col-6
      .col-6

    .row
      .col-4
        div
          h3 Basics
          ul
            li Health: {{user.stats.hp}}/{{user.stats.maxHealth}}
            li Mana: {{user.stats.mp}}/{{user.stats.maxMP}}
            li Gold: {{user.stats.gp}}
            li Level: {{user.stats.lvl}}
            li Experience: {{user.stats.exp}}

        div(v-if='user.flags.itemsEnabled')
          h3 Battle Gear
          ul
            li(v-for='(key, itemType) in user.items.gear.equipped', v-if='flatGear[key]')
              strong {{ flatGear[key].text() }}
              strong(v-if='flatGear[key].str || flatGear[key].con || flatGear[key].per || flatGear[key].int') :&nbsp;
                span(v-for='stat in ["str","con","per","int"]', v-if='flatGear[key][stat]') {{flatGear[key][stat]}} {{ $t(stat) }}&nbsp;

        div(v-if='user.preferences.costume')
          h4(v-once) {{ $t('costume') }}
          div
            div(ng-repeat='(key, itemType) in user.items.gear.costume')
              strong {{flatGear[key].text()}}

        div
          h3 Background
          ul
            li(v-if='!user.preferences.background') None
            li(v-if='user.preferences.background') {{ user.preferences.background }}

        div(ng-if='user.flags.dropsEnabled')
          h3(v-once) {{ $t('pets') }}
          ul
            li(ng-if='user.items.currentPet')
              | {{ $t('activePet') }}:
              | {{ formatAnimal(user.items.currentPet, 'pet') }}
            li
              | {{ $t('petsFound') }}:
              | {{ totalCount(user.items.pets) }}
            li
              | {{ $t('beastMasterProgress') }}:
              | {{ beastMasterProgress(user.items.pets) }}

          h3(v-once) {{ $t('mounts') }}
          ul
            li(v-if='user.items.currentMount')
              | {{ $t('activeMount') }}:
              | {{ formatAnimal(user.items.currentMount, 'mount') }}
            li
              | {{ $t('mountsTamed') }}:
              | {{ totalCount(user.items.mounts) }}
            li
              | {{ $t('mountMasterProgress') }}:
              | {{ mountMasterProgress(user.items.mounts) }}

      .col-4
        h3(v-once) {{ $t('attributes') }}
        .row(v-for="(statInfo, stat) in stats")
          .col-4
            span.hint(:popover-title='$t(statInfo.title)', popover-placement='right',
              :popover='$t(statInfo.popover)', popover-trigger='mouseenter')
              strong {{ $t(statInfo.title) }}
            strong : {{ statsComputed[stat] }}
          .col-6
            ul.bonus-stats
              li
                | {{ $t('levelBonus') }}
                | {{statsComputed.levelBonus[stat]}}
              li
                | {{ $t('gearBonus') }}
                |  {{statsComputed.gearBonus[stat]}}
              li
                | {{ $t('classBonus') }}
                |  {{statsComputed.classBonus[stat]}}
              li
                | {{ $t('allocatedPoints') }}
                |  {{user.stats[stat]}}
              li
                | {{ $t('buffs') }}
                | {{user.stats.buffs[stat]}}

        div(v-if='user.stats.buffs.stealth')
          strong.hint(:popover-title="$t('stealth')", popover-trigger='mouseenter',
            popover-placement='right', :popover="$t('stealthNewDay')", v-once)
            | {{ $t('stealth') }}
          strong : {{user.stats.buffs.stealth}}&nbsp;

        div(v-if='user.stats.buffs.streaks')
          div
            strong.hint(popover-title="$t('streaksFrozen')", popover-trigger='mouseenter',
              popover-placement='right', :popover="$t('streaksFrozenText')")
            | {{ $t('streaksFrozen') }}

      .col-4(v-if='user.flags.classSelected && !user.preferences.disableClasses')
          h3(v-once) {{ $t('characterBuild') }}
          h4(v-once) {{ $t('class') + ': ' }}
            span {{ classText }}&nbsp;
            button.btn.btn-danger.btn-xs(@click='changeClass(null)', v-once) {{ $t('changeClass') }}
            small.cost 3
              span.Pet_Currency_Gem1x.inline-gems

          div
            div
              p(v-if='userLevel100Plus', v-once) {{ $t('noMoreAllocate') }}
              p(v-if='user.stats.points || userLevel100Plus')
                strong.inline
                  | {{user.stats.points}}&nbsp;
                strong.hint(popover-trigger='mouseenter',
                  popover-placement='right', :popover="$t('levelPopover')") {{ $t('unallocated') }}
            div
              fieldset.auto-allocate
                  .checkbox
                    label
                      input(type='checkbox', v-model='user.preferences.automaticAllocation',
                        @change='set({"preferences.automaticAllocation": user.preferences.automaticAllocation, "preferences.allocationMode": "taskbased"})')
                      span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('autoAllocationPop')") {{ $t('autoAllocation') }}
                  form(v-if='user.preferences.automaticAllocation', style='margin-left:1em')
                    .radio
                      label
                        input(type='radio', name='allocationMode', value='flat', v-model='user.preferences.allocationMode',
                          @change='set({"preferences.allocationMode": "flat"})')
                        span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('evenAllocationPop')") {{ $t('evenAllocation') }}
                    .radio
                      label
                        input(type='radio', name='allocationMode', value='classbased',
                          v-model='user.preferences.allocationMode', @change='set({"preferences.allocationMode": "classbased"})')
                        span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('classAllocationPop')") {{ $t('classAllocation') }}
                    .radio
                      label
                        input(type='radio', name='allocationMode', value='taskbased', v-model='user.preferences.allocationMode', @change='set({"preferences.allocationMode": "taskbased"})')
                        span.hint(popover-trigger='mouseenter', popover-placement='right', :popover="$t('taskAllocationPop')") {{ $t('taskAllocation') }}
                  div(v-if='user.preferences.automaticAllocation && !(user.preferences.allocationMode === "taskbased") && (user.stats.points > 0)')
                    button.btn.btn-primary.btn-xs(@click='allocateNow({})', popover-trigger='mouseenter', popover-placement='right', :popover="$t('distributePointsPop')")
                      span.glyphicon.glyphicon-download
                      |&nbsp;
                      | {{ $t('distributePoints') }}
            .row(v-for='(statInfo, stat) in allocateStatsList')
              .col-8
                span.hint(popover-trigger='mouseenter', popover-placement='right', :popover='$t(statInfo.popover)')
                | {{ $t(statInfo.title) + user.stats[stat] }}
              .col-4(v-if='user.stats.points', @click='allocate(stat)')
                 button.btn.btn-primary(popover-trigger='mouseenter', popover-placement='right',
                  :popover='$t(statInfo.allocatepop)') +
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
import { mapState } from 'client/libs/store';
import Content from '../../../common/script/content';
import { beastMasterProgress, mountMasterProgress } from '../../../common/script/count';
import statsComputed from  '../../../common/script/libs/statsComputed';
import autoAllocate from '../../../common/script/fns/autoAllocate';
import changeClass from  '../../../common/script/ops/changeClass';
import allocate from  '../../../common/script/ops/stats/allocate';

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
      let classTexts = {
        warrior: this.$t('warrior'),
        wizard: this.$t('mage'),
        rogue: this.$t('rogue'),
        healer: this.$t('healer'),
      };

      return classTexts[this.user.stats.class];
    },
  },
  methods: {
    formatAnimal (animalName, type) {
      if (type === 'pet') {
        if (Content.petInfo.hasOwnProperty(animalName)) {
          return Content.petInfo[animalName].text();
        } else {
          return this.$t('noActivePet');
        }
      } else if (type === 'mount') {
        if (Content.mountInfo.hasOwnProperty(animalName)) {
          return Content.mountInfo[animalName].text();
        } else {
          return this.$t('noActiveMount');
        }
      }
    },
    formatBackground (background) {
      let bg = Content.appearances.background;

      if (bg.hasOwnProperty(background)) {
        return `${bg[background].text()} (${this.$t(bg[background].set.text)})`;
      }
      return window.env.t('noBackground');
    },
    totalCount (objectToCount) {
      let total = size(objectToCount);
      return total;
    },
    beastMasterProgress (pets) {
      let dropPetsFound = beastMasterProgress(pets);
      let display = this.formatOutOfTotalDisplay(dropPetsFound, TOTAL_NUMBER_OF_DROP_ANIMALS);

      return display;
    },
    mountMasterProgress (mounts) {
      let dropMountsFound = mountMasterProgress(mounts);
      let display = this.formatOutOfTotalDisplay(dropMountsFound, TOTAL_NUMBER_OF_DROP_ANIMALS);

      return display;
    },
    formatOutOfTotalDisplay (stat, totalStat) {
      let display = `${stat}/${totalStat}`;
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
