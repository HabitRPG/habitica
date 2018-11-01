<template lang="pug">
  #statAllocation(v-if='hasClass')
    .row.title-row
      .col-12.col-md-6
        h3(v-if='userLevel100Plus', v-once, v-html="$t('noMoreAllocate')")
        h3
          | {{$t('statPoints')}}
          .counter.badge(v-if='user.stats.points || userLevel100Plus')
            | {{pointsRemaining}}&nbsp;
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
              .up(@click='allocate(stat)')
            div
              .down(@click='deallocate(stat)')
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
