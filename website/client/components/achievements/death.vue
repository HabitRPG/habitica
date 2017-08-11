<template lang="pug">
  b-modal#death(:title="$t('lostAllHealth')", size='lg', :hide-footer="true")
    .modal-body
      .container-fluid
        .row
          .col-6.col-xs-12
            .hero-stats
              .meter-label(:tooltip="$t('health')")
                span.glyphicon.glyphicon-heart
              .meter.health(:tooltip='Math.round(user.stats.hp * 100) / 100')
                .bar(:style='barStyle')
                span.meter-text.value
                  | {{Math.ceil(user.stats.hp)}} / {{maxHealth}}
            figure.herobox.text-center
              .character-sprites
                avatar(:member='user')
                // @TOOD: Sleep +generatedAvatar({sleep:true})
                span(class='knockout')
          .col-6.col-xs-12
            h4.dont-despair {{ $t('dontDespair') }}
            p.death-penalty {{ $t('deathPenaltyDetails') }}
      .modal-footer
        a.btn.btn-danger.btn-lg.flex-column.btn-wrap(@click='revive(); close()') {{ $t('refillHealthTryAgain') }}
        h4.text-center {{ $t('dyingOftenTips') }}
</template>

<style scope>
  .dont-despair, .death-penalty {
    margin-top: 1.5em;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

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
    revive () {
      // @TODO: Post
      revive(this.user);
    },
  },
};
</script>
