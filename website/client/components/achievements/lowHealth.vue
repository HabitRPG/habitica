<template lang="pug">
  b-modal#low-health(:title="$t('losingHealthWarning')", size='lg', :hide-footer="true")
    .modal-body
      .hero-stats
        .meter-label(:tooltip="$t('health')")
          span.glyphicon.glyphicon-heart
        .meter.health(:tooltip='Math.round(user.stats.hp * 100) / 100')
          .bar(:style='barStyle')
          span.meter-text.value
            | {{healthLeft}}
      .herobox.inline-block
        .character-sprites
          avatar(:member='user')
      p {{ $t('losingHealthWarning2') }}
      h4 {{ $t('toRegainHealth') }}
      ul
        li.spaced {{ $t('lowHealthTips1') }}
        li.spaced {{ $t('lowHealthTips2') }}
      h4 {{ $t('losingHealthQuickly') }}
      ul
        li.spaced {{ $t('lowHealthTips3') }}
        li.spaced {{ $t('lowHealthTips4') }}
      h4 {{ $t('goodLuck') }}
    .modal-footer
      a.btn.btn-primary(@click='acknowledgeHealthWarning(); close()') {{ $t('ok') }}
</template>

<style scope>
  .hero-stats {
    position: absolute;
    margin-left: 9em;
    width: 50%;
  }

  .character-sprites {
    display: inline-flex;
    margin: 3em auto;
  }

  .herobox {
    padding-top: 0em;
    margin-left: 16em;
  }

  .modal-footer {
    margin-top: 0em;
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

import Avatar from '../avatar';
import { mapState } from 'client/libs/store';
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
    healthLeft () {
      return `${Math.ceil(this.user.stats.hp)} / ${this.maxHealth}`;
    },
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'low-health');
    },
    acknowledgeHealthWarning () {
      // @TODO: {'flags.warnedLowHealth':true}
    },
  },
};
</script>
