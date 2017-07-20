<template lang="pug">
  b-modal#restore(:title="$t('fixValues')", :hide-footer='true' size='lg')
    p {{ $t('fixValuesText1') }}
    p {{ $t('fixValuesText2') }}
    .form-horizontal
      h3 {{ $t('stats') }}
      .form-group.row
        .col-sm-3
          label.control-label {{ $t('health') }}
        .col-sm-9
          input.form-control(type='number', step="any", data-for='stats.hp', v-model='restoreValues.stats.hp')
      .form-group.row
        .col-sm-3
          label.control-label {{ $t('experience') }}
        .col-sm-9
          input.form-control(type='number', step="any", data-for='stats.exp', v-model='restoreValues.stats.exp')
      .form-group.row
        .col-sm-3
          label.control-label {{ $t('gold') }}
        .col-sm-9
          input.form-control(type='number', step="any", data-for='stats.gp', v-model='restoreValues.stats.gp')
        //input.form-control(type='number', step="any", data-for='stats.gp', v-model='restoreValues.stats.gp',disabled)
        //-p.alert
          small {{ $t('disabledWinterEvent') }}
      .form-group.row
        .col-sm-3
          label.control-label {{ $t('mana') }}
        .col-sm-9
          input.form-control(type='number', step="any", data-for='stats.mp', v-model='restoreValues.stats.mp')
      .form-group.row
        .col-sm-3
          label.control-label {{ $t('level') }}
        .col-sm-9
          input.form-control(type='number', data-for='stats.lvl', v-model='restoreValues.stats.lvl')
      h3 {{ $t('achievements') }}
      .form-group.row
        .col-sm-3
          label.control-label {{ $t('fix21Streaks') }}
        .col-sm-9
          input.form-control(type='number', data-for='achievements.streak', v-model='restoreValues.achievements.streak')
    //- This is causing too many problems for users
      h3 {{ $t('other') }}
      a.btn.btn-sm.btn-warning(ng-controller='FooterCtrl', ng-click='addMissedDay(1)') {{ $t('triggerDay') }}
    .modal-footer
      button.btn.btn-danger(@click='close()') {{ $t('discardChanges') }}
      button.btn.btn-primary(@click='restore()') {{ $t('saveAndClose') }}
</template>

<script>
import { mapState } from 'client/libs/store';

import bModal from 'bootstrap-vue/lib/components/modal';

export default {
  components: {
    bModal,
  },
  data () {
    return {
      restoreValues: {
        stats: {
          hp: 0,
          mp: 0,
          gp: 0,
          exp: 0,
          lvl: 0,
        },
        achievements: {
          streak: 0,
        },
      },
    };
  },
  mounted () {
    this.restoreValues.stats = this.user.stats;
    this.restoreValues.achievements.streak = this.user.achievements.streak;
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'restore');
    },
    restore () {
      if (this.restoreValues.stats.lvl < 1) {
        // @TODO:
        // Notification.error(env.t('invalidLevel'), true);
        return;
      }

      this.user.stats = this.restoreValues.stats;
      this.user.achievements.streak = this.restoreValues.achievements.streak;

      let settings = {
        'stats.hp': this.restoreValues.stats.hp,
        'stats.exp': this.restoreValues.stats.exp,
        'stats.gp': this.restoreValues.stats.gp,
        'stats.lvl': this.restoreValues.stats.lvl,
        'stats.mp': this.restoreValues.stats.mp,
        'achievements.streak': this.restoreValues.achievements.streak,
      };

      this.$store.dispatch('user:set', settings);
      this.$root.$emit('hide::modal', 'restore');
    },
  },
};
</script>
