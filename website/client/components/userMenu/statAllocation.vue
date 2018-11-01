<template lang="pug">
  div(v-if='hasClass')
    .row.title-row
      .col-12.col-md-6
        h3(v-if='userLevel100Plus', v-once, v-html="$t('noMoreAllocate')")
        h3
          | {{$t('statPoints')}}
          .counter.badge(v-if='user.stats.points || userLevel100Plus')
            | {{pointsRemaining}}&nbsp;
      .col-12.col-md-6.minimize
        toggle-switch.float-right(
          :label="$t('autoAllocation')",
          v-model='user.preferences.automaticAllocation',
          @change='setAutoAllocate()'
        )
    .row      
      .box.white.row.col-12.col-md-3(v-for='(statInfo, stat) in allocateStatsList')
        div(:class='`stat-title ${stat}`') {{ $t(stats[stat].title) }}
        .col-9
          .number {{totalAllocatedStats(stat)}}
          .points {{$t('pts')}}
        .col-3(v-if='user.stats.points')
          span.up(@click='allocate(stat)')
          span.down(@click='deallocate(stat)')
</template>

<script>
  import toggleSwitch from 'client/components/ui/toggleSwitch';

  export default {
    props: ['user', 'statUpdates'],
    components: {
      toggleSwitch,
    },
    data () {
      return {
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
      };
    },
    computed: {
      userLevel100Plus () {
        return this.user.stats.lvl >= 100;
      },
      pointsRemaining () {
        let points = this.user.stats.points;
        Object.values(this.statUpdates).forEach(value => {
          points -= value;
        });
        return points;
      },
      hasClass () {
        return this.$store.getters['members:hasClass'](this.user);
      },
    },
    methods: {
      totalAllocatedStats (stat) {
        return this.user.stats[stat] + this.statUpdates[stat];
      },
      setAutoAllocate () {
        let settings = {
          'preferences.automaticAllocation': Boolean(this.user.preferences.automaticAllocation),
          'preferences.allocationMode': 'taskbased',
        };

        this.$store.dispatch('user:set', settings);
      },
      allocate (stat) {
        if (this.pointsRemaining === 0) return;
        this.$emit('statUpdate', stat, 1);
      },
      deallocate (stat) {
        if (this.statUpdates[stat] === 0) return;
        this.$emit('statUpdate', stat, -1);
      },
    },
  };
</script>

<style lang='scss' scoped>
  @import '~client/assets/scss/colors.scss';

  .str {
    color: $red-50;
  }

  .int {
    color: $blue-10;
  }

  .con {
    color: $yellow-10;
  }

  .per {
    color: $purple-200;
  }

  .up, .down {
    border: solid $gray-300;
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
</style>
