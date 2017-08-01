<template lang="pug">
  b-modal#choose-class(:title="$t('chooseClassHeading')", size='lg', :hide-footer="true")
    .modal-body.select-class
      .container-fluid
        .row
          .col-md-3(@click='selectedClass = "warrior"')
            h5 {{ $t('warriorWiki') }}
            figure.herobox(:class='{"selected-class": selectedClass === "warrior"}')
              .character-sprites
                span(:class='`skin_${user.preferences.skin}`')
                span(class='head_0')
                span(:class='`${user.preferences.size}_armor_warrior_5`')
                span(:class='`hair_base_${user.preferences.hair.base}_${user.preferences.hair.color}`')
                span(:class='`hair_bangs_${user.preferences.hair.bangs}_${user.preferences.hair.color}`')
                span(:class='`hair_beard_${user.preferences.hair.beard}_${user.preferences.hair.color}`')
                span(:class='`hair_mustache_${user.preferences.hair.mustache}_${user.preferences.hair.color}`')
                span(class='head_warrior_5')
                span(class='shield_warrior_5')
                span(class='weapon_warrior_6')
          .col-md-3(@click='selectedClass = "wizard"')
            h5 {{ $t('mageWiki') }}
            figure.herobox(:class='{"selected-class": selectedClass === "wizard"}')
              .character-sprites
                span(class='`skin_${user.preferences.skin}`')
                span(class='head_0')
                span(:class='`${user.preferences.size}_armor_wizard_5`')
                span(:class='`hair_base_${user.preferences.hair.base}_${user.preferences.hair.color}`')
                span(:class='`hair_bangs_${user.preferences.hair.bangs}_${user.preferences.hair.color}`')
                span(:class='`hair_beard_${user.preferences.hair.beard}_${user.preferences.hair.color}`')
                span(:class='`hair_mustache_${user.preferences.hair.mustache}_${user.preferences.hair.color}`')
                span(class='head_wizard_5')
                span(class='shield_wizard_5')
                span(class='weapon_wizard_6')
          .col-md-3(@click='selectedClass = "rogue"')
            h5 {{ $t('rogueWiki') }}
            figure.herobox(:class='{"selected-class": selectedClass === "rogue"}')
              .character-sprites
                span(:class='`skin_${user.preferences.skin}`')
                span(class='head_0')
                span(:class='`${user.preferences.size}_armor_rogue_5`')
                span(:class='`hair_base_${user.preferences.hair.base}_${user.preferences.hair.color}`')
                span(:class='`hair_bangs_${user.preferences.hair.bangs}_${user.preferences.hair.color}`')
                span(:class='`hair_beard_${user.preferences.hair.beard}_${user.preferences.hair.color}`')
                span(:class='`hair_mustache_${user.preferences.hair.mustache}_${user.preferences.hair.color}`')
                span(class='head_rogue_5')
                span(class='shield_rogue_6')
                span(class='weapon_rogue_6')
          .col-md-3(@click='selectedClass = "healer"')
            h5 {{ $t('healerWiki') }}
            figure.herobox(ng-class='{"selected-class": selectedClass === "healer"}')
              .character-sprites
                span(:class='`skin_${user.preferences.skin}`')
                span(class='head_0')
                span(:class='`${user.preferences.size}_armor_healer_5`')
                span(:class='`hair_base_${user.preferences.hair.base}_${user.preferences.hair.color}`')
                span(:class='`hair_bangs_${user.preferences.hair.bangs}_${user.preferences.hair.color}`')
                span(:class='`hair_beard_${user.preferences.hair.beard}_${user.preferences.hair.color}`')
                span(:class='`hair_mustache_${user.preferences.hair.mustache}_${user.preferences.hair.color}`')
                span(class='head_healer_5')
                span(class='shield_healer_5')
                span(class='weapon_healer_6')
        br
        .well(v-if='selectedClass === "warrior"') {{ $t('warriorText') }}
        .well(v-if='selectedClass === "wizard"') {{ $t('mageText') }}
        .well(v-if='selectedClass === "rogue"') {{ $t('rogueText') }}
        .well(v-if='selectedClass === "healer"') {{ $t('healerText') }}

    .modal-footer
      span(popover-placement='left', popover-trigger='mouseenter', :popover="$t('optOutOfClassesText')")
        button.btn.btn-danger(@click='disableClasses({}); close()') {{ $t('optOutOfClasses') }}
      button.btn.btn-primary(:disabled='!selectedClass' @click='changeClass(selectedClass); selectedClass = undefined; close()') {{ $t('select') }}
      .pull-left {{ $t('chooseClassLearn') }}
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
      selectedClass: '',
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
      this.$root.$emit('hide::modal', 'choose-class');
    },
    disableClasses () {
      // @TODO:
    },
    changeClass (classSelected) {
      // @TODO:
    },
  },
};
</script>
