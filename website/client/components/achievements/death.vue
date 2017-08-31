<template lang="pug">
  b-modal#death(:title="$t('lostAllHealth')", size='lg', :hide-footer="true")
    .info
      .row
        .col-6
          .hero-stats
            .meter-label(:tooltip="$t('health')")
              span.glyphicon.glyphicon-heart
            .meter.health(:tooltip='Math.round(user.stats.hp * 100) / 100')
              .bar(:style='barStyle')
            // span.meter-text.value
              | {{Math.ceil(user.stats.hp)}} / {{maxHealth}}
            avatar(:member='user', :sleep='true')
            // @TOOD: Sleep +generatedAvatar({sleep:true})
            span(class='knockout')
        .col-6
          h4.dont-despair {{ $t('dontDespair') }}
          p.death-penalty {{ $t('deathPenaltyDetails') }}
    .modal-footer
      .col-12.text-center
        button.btn.btn-danger(@click='revive()') {{ $t('refillHealthTryAgain') }}
        h4.text-center(v-html="$t('dyingOftenTips')")
</template>

<style scoped>
  .info {
    height: 220px;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

import axios from 'axios';
import Avatar from '../avatar';
import { mapState } from 'client/libs/store';
import revive from '../../../common/script/ops/revive';
import percent from '../../../common/script/libs/percent';
import {maxHealth} from '../../../common/script/index';

export default {
  components: {
    bModal,
    Avatar,
  },
  data () {
    return {
      maxHealth,
    };
  },
  computed: {
    ...mapState({user: 'user.data'}),
    barStyle () {
      return {
        width: `${percent(this.user.stats.hp, maxHealth)}%`,
      };
    },
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'death');
    },
    async revive () {
      await axios.post('/api/v3/user/revive');
      revive(this.user);
      this.close();
    },
  },
};
</script>
