<template lang="pug">
  div(v-if='showAllocation')
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
              .up(v-if='showStatsSave', @click='allocate(stat)')
            div
              .down(v-if='showStatsSave', @click='deallocate(stat)')
    .row.save-row(v-if='showStatsSave')
      .col-12.col-md-6.offset-md-3.text-center
        button.btn.btn-primary(@click='saveAttributes()', :disabled='loading') {{ this.loading ?  $t('loading') : $t('save') }}
</template>

<script>
  import toggleSwitch from 'client/components/ui/toggleSwitch';
  import allocateBulk from  '../../../common/script/ops/stats/allocateBulk';
  import axios from 'axios';

  export default {
    props: ['user', 'showAllocation'],
    components: {
      toggleSwitch,
    },
    data () {
      return {
        loading: false,
        allocateStatsList: {
          str: { title: 'allocateStr', popover: 'strengthText', allocatepop: 'allocateStrPop' },
          int: { title: 'allocateInt', popover: 'intText', allocatepop: 'allocateIntPop' },
          con: { title: 'allocateCon', popover: 'conText', allocatepop: 'allocateConPop' },
          per: { title: 'allocatePer', popover: 'perText', allocatepop: 'allocatePerPop' },
        },
        statUpdates: {
          str: 0,
          int: 0,
          con: 0,
          per: 0,
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
    },
  };
</script>

<style lang="scss" scoped>
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
    width: 24px;
    height: 24px;
    border-radius: 50%;
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

  .white {
    border-radius: 2px;
    background: #FFFFFF;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
    border: 1px solid transparent;
  }

  .save-row {
    margin-top: 1em;
  }
</style>