<template lang="pug">
  div
    .attribute-entry(v-for="attr in ATTRIBUTES", :key="attr")
      span.key(:class="getClass(stats.diff[attr])") {{ `${$t(attr)}: ` }}
      span.val(:class="getClass(stats.diff[attr])")
        span.value {{ `${stats.diff[attr]}` }}
        br
        span.desc(v-if="stats.diff[attr] != 0")
          | Gear: {{ stats.gear[attr] }}
          br
          | Bonus: {{ `+ ${stats.classBonus[attr]}` }}
        span(v-else)
          br
          | &nbsp;
</template>

<style lang="scss" scoped>

  @import '~client/assets/scss/colors.scss';

  .attribute-entry {
    width: 50%;
    display: inline-block;
    font-weight: bold;
    margin-bottom: 16px;
    vertical-align: top
  }

  span.key, span.val {
    width: 38px;
    height: 16px;
    font-size: 16px;
    font-weight: bold;
    line-height: 1.0;
  }

  .no-value {
    color: $gray-400 !important;
  }

  .key.minus, .minus .value {
    color: $red-500 !important;
  }

  .key.plus, .val.plus .value {
    color: $green-10;
  }

  .val.plus .value:before {
    content: '+';
  }

  .desc {
    display: inline-block;
    width: auto;
    font-size: 12px;
    line-height: 16px;
    text-align: left;
    font-weight: normal;
    padding-left: 2px;
  }
</style>

<script>
  import { mapState } from 'client/libs/store';

  let emptyStats = {
    str: 0,
    int: 0,
    per: 0,
    con: 0
  };

  export default {
    props: {
      item: {
        type: Object,
      },
    },
    computed: {
      ...mapState({
        ATTRIBUTES: 'constants.ATTRIBUTES',
        user: 'user.data',
        flatGear: 'content.gear.flat',
      }),
      stats () {
        let classBonus = this.getClassBonus(this.item);
        let currentGear = this.currentGearStats();

        let sumNewGearStats = this.calculateStats(this.item, classBonus, (a1, a2) => {
          return a1 + a2;
        });
        console.info('new', this.item, classBonus, sumNewGearStats);

        let sumOldGearStats = this.calculateStats(currentGear, this.getClassBonus(currentGear), (a1, a2) => {
          return a1 + a2;
        });

        console.info('old', currentGear, sumOldGearStats);

        let differenceToCurrent = this.calculateStats(sumNewGearStats, sumOldGearStats, (a1, a2) => {
          return a1 - a2;
        });

        console.info('diff', differenceToCurrent);

        return {
          gear: this.item,
          classBonus,
          oldGear: sumOldGearStats,
          diff: differenceToCurrent
        }
      },
    },
    methods: {
      getClass (statValue) {
        if (statValue === 0) {
          return 'no-value';
        }

        if (statValue < 0) {
          return 'minus';
        }

        return 'plus';
      },
      currentGearStats () {
        return this.flatGear[this.user.items.gear.equipped[this.item.type]] || emptyStats;
      },
      getClassBonus (item) {
        let result = emptyStats;
        let userClass = this.user.stats.class;

        if (userClass === item.klass || userClass === item.specialClass) {
          for (let attr of this.ATTRIBUTES) {
            result[attr] = Number(this.item[attr]) * 0.5;
          }
        }

        return result;
      },
      calculateStats (srcStats, otherStats, func) {
        let result = {};

        for (let attr of this.ATTRIBUTES) {
          result[attr] = func(Number(srcStats[attr]), Number(otherStats[attr]));
        }

        return result;
      },
    },
  };
</script>
