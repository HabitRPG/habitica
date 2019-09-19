<template lang="pug">
  #stats.standard-page
    .row
      .col-12.col-md-6
        h2.text-center {{$t('equipment')}}
        .well
          .col-12.col-md-4.item-wrapper(v-for="(label, key) in equipTypes")
            .box(
              :id="key",
              v-if="label !== 'skip'",
              :class='{white: equippedItems[key] && equippedItems[key].indexOf("base_0") === -1}'
            )
              div(:class="`shop_${equippedItems[key]}`")
            b-popover(
              v-if="label !== 'skip' && equippedItems[key] && equippedItems[key].indexOf('base_0') === -1",
              :target="key",
              triggers="hover",
              :placement="'bottom'",
              :preventOverflow="false",
            )
              h4.popover-title-only {{ getGearTitle(equippedItems[key]) }}
              attributesGrid.attributesGrid(
                :item="content.gear.flat[equippedItems[key]]",
                :user="user"
              )

            h3(v-if="label !== 'skip'") {{ label }}
      .col-12.col-md-6
        h2.text-center {{$t('costume')}}
        .well
          // Use similar for loop for costume items, except show background if label is 'skip'.
          .col-12.col-md-4.item-wrapper(v-for="(label, key) in equipTypes")
            // Append a "C" to the key name since HTML IDs have to be unique.
            .box(
              :id="key + 'C'",
              v-if="label !== 'skip'",
              :class='{white: costumeItems[key] && costumeItems[key].indexOf("base_0") === -1}'
            )
              div(:class="`shop_${costumeItems[key]}`")
            // Show background on 8th tile rather than a piece of equipment.
            .box(v-if="label === 'skip'",
              :class='{white: user.preferences.background}', style="overflow:hidden"
            )
              div(:class="'icon_background_' + user.preferences.background")
            b-popover(
              v-if="label !== 'skip' && costumeItems[key] && costumeItems[key].indexOf('base_0') === -1",
              :target="key + 'C'",
              triggers="hover",
              :placement="'bottom'",
              :preventOverflow="false",
            )
              h4.popover-title-only {{ getGearTitle(costumeItems[key]) }}
              attributesGrid.attributesGrid(
               :item="content.gear.flat[costumeItems[key]]",
               :user="user"
              )

            h3(v-if="label !== 'skip'") {{ label }}
            h3(v-else) {{ $t('background') }}
    .row.pet-mount-row
      .col-12.col-md-6
        h2.text-center(v-once) {{ $t('pets') }}
        .well.pet-mount-well
          .row.col-12
            .col-12.col-md-4
              .box(:class='{white: user.items.currentPet}')
                .Pet(:class="`Pet-${user.items.currentPet}`")
            .col-12.col-md-8
              div
                | {{ formatAnimal(user.items.currentPet, 'pet') }}
              div
                strong {{ $t('petsFound') }}:
                | {{ totalCount(user.items.pets) }}
              div
                strong {{ $t('beastMasterProgress') }}:
                | {{ beastMasterProgress(user.items.pets) }}
      .col-12.col-md-6
        h2.text-center(v-once) {{ $t('mounts') }}
        .well.pet-mount-well
          .row.col-12
            .col-12.col-md-4
              .box(:class='{white: user.items.currentMount}')
                .mount(:class="`Mount_Icon_${user.items.currentMount}`")
            .col-12.col-md-8
              div
                | {{ formatAnimal(user.items.currentMount, 'mount') }}
              div
                strong {{ $t('mountsTamed') }}:
                span {{ totalCount(user.items.mounts) }}
              div
                strong {{ $t('mountMasterProgress') }}:
                span {{ mountMasterProgress(user.items.mounts) }}
    #attributes.row
      hr.col-12
      h2.col-12 {{$t('attributes')}}
      .col-12.col-md-6(v-for="(statInfo, stat) in stats")
        .row.col-12.stats-column
          .col-12.col-md-4.attribute-label
            span.hint(:popover-title='$t(statInfo.title)', popover-placement='right',
              :popover='$t(statInfo.popover)', popover-trigger='mouseenter')
            .stat-title(:class='stat') {{ $t(statInfo.title) }}
            strong.number {{totalStatPoints(stat) | floorWholeNumber}}
          .col-12.col-md-6
            ul.bonus-stats
              li
                strong {{$t('level')}}:
                | {{statsComputed.levelBonus[stat]}}
              li
                strong {{$t('equipment')}}:
                | {{statsComputed.gearBonus[stat]}}
              li
                strong {{$t('class')}}:
                | {{statsComputed.classBonus[stat]}}
              li
                strong {{$t('allocated')}}:
                | {{totalAllocatedStats(stat)}}
              li
                strong {{$t('buffs')}}:
                | {{user.stats.buffs[stat]}}
    #allocation(v-if='showAllocation')
      .row.title-row
        .col-12.col-md-6
          h3(v-if='userLevel100Plus', v-once, v-html="$t('noMoreAllocate')")
          h3
            | {{$t('statPoints')}}
            .counter.badge.badge-pill(v-if='user.stats.points || userLevel100Plus')
              | {{pointsRemaining}}
        .col-12.col-md-6
          .float-right
            toggle-switch(
              :label="$t('autoAllocation')",
              v-model='user.preferences.automaticAllocation',
              @change='setAutoAllocate()'
            )
      .row
        .col-12.col-md-3(v-for='(statInfo, stat) in allocateStatsList')
          .box.white.row.col-12
            .col-9
              div(:class='stat') {{ $t(stats[stat].title) }}
              .number {{totalAllocatedStats(stat)}}
              .points {{$t('pts')}}
            .col-3
              div
                .up(v-if='showStatsSave', @click='allocate(stat)')
              div
                .down(v-if='showStatsSave', @click='deallocate(stat)')
      .row.save-row(v-if='showStatsSave')
        .col-12.col-md-6.offset-md-3.text-center
          button.btn.btn-primary(@click='saveAttributes()', :disabled='loading') {{ this.loading ?  $t('loading') : $t('save') }}
</template>

<script>
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  import attributesGrid from 'client/components/inventory/equipment/attributesGrid';

  import { mapState } from 'client/libs/store';
  import Content from '../../../common/script/content';
  import { beastMasterProgress, mountMasterProgress } from '../../../common/script/count';
  import autoAllocate from '../../../common/script/fns/autoAllocate';
  import allocateBulk from  '../../../common/script/ops/stats/allocateBulk';
  import statsComputed from  '../../../common/script/libs/statsComputed';

  import axios from 'axios';

  import size from 'lodash/size';
  import keys from 'lodash/keys';

  const DROP_ANIMALS = keys(Content.pets);
  const TOTAL_NUMBER_OF_DROP_ANIMALS = DROP_ANIMALS.length;
  export default {
    props: ['user', 'showAllocation'],
    components: {
      toggleSwitch,
      attributesGrid,
    },
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
          shield: this.$t('offHand'),
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
        let points = this.user.stats.points;
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
        let total = size(objectToCount);
        return total;
      },
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

        return this.$t('noBackground');
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
      allocate (stat) {
        if (this.pointsRemaining === 0) return;
        this.statUpdates[stat]++;
      },
      deallocate (stat) {
        if (this.statUpdates[stat] === 0) return;
        this.statUpdates[stat]--;
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
        let settings = {
          'preferences.automaticAllocation': Boolean(this.user.preferences.automaticAllocation),
          'preferences.allocationMode': 'taskbased',
        };

        this.$store.dispatch('user:set', settings);
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';

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
  }

  .well.pet-mount-well {
    padding-bottom: 1em;

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
    h3 {
      text-align: center;
    }
  }

  .pet-mount-row {
    margin-top: 2em;
    margin-bottom: 2em;
  }

  .mount {
    margin-top: -0.2em !important;
  }

  .save-row {
    margin-top: 1em;
  }
</style>
