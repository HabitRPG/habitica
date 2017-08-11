<template lang="pug">
  b-modal#level-up(:title="$t('levelUpShare')", size='sm', :hide-footer="true")
    .modal-content
      .modal-body.text-center
        h3 {{ $t('gainedLevel') }}
        .container-fluid
          .row
            .herobox
              .character-sprites
                // @TODO: ({sleep: false})
                avatar(:member='user')
          .row
            .herobox
              .avatar-level(:class='userLevelStyle(user)') {{ $t('level') + user.stats.lvl }}
        h4 {{ $t('leveledUp', {level: user.stats.lvl}) }}
        p {{ $t('fullyHealed') }}
        br
        div(v-if='user.flags.classSelected && !user.preferences.disableClasses && !user.preferences.automaticAllocation')
          a.btn.btn-default(@click='statsAllocationBoxIsOpen = !statsAllocationBoxIsOpen',
            data-toggle='collapse', data-target='#stat-allocation', aria-expanded='false', aria-controls='stat-allocation')
            | {{statsAllocationBoxIsOpen  ? $t('hideQuickAllocation') : $t('showQuickAllocation')}}
          p &nbsp;
          .collapse#stat-allocation
            table.table.text-left
              tr
                td
                  p(v-if='user.stats.lvl >= 100') {{ $t('noMoreAllocate') }}
                  p(v-if='user.stats.points || user.stats.lvl < 100')
                    strong.inline
                      | {{user.stats.points}}&nbsp;
                    strong.hint(popover-trigger='mouseenter',
                      popover-placement='right', :popover="$t('quickAllocationLevelPopover')") {{ $t('unallocated') }}
                td
              // @TODO: +statAllocation
        button.btn.btn-primary(@click='close()') {{ $t('huzzah') }}
        .checkbox
          label(style='display:inline-block') {{ $t('dontShowAgain') }}
            input(type='checkbox', v-model='user.preferences.suppressModals.levelUp', @change='changeLevelupSuppress()')
      .modal-footer
        .container-fluid
          .row
            .col-4
              a.twitter-share-button(:href='twitterLink') {{ $t('tweet') }}
            .col-4
              .fb-share-button(:data-href='socialLevelLink', data-layout='button')
            .col-4
              a.tumblr-share-button(:data-href='socialLevelLink', data-notes='none')
</template>

<style lang="scss">
  #level-up {

    .modal-content {
      min-width: 28em;
    }

    .modal-body {
      padding-bottom: 0;
    }

    .modal-footer {
      margin-top: 0;
    }

    .herobox {
      margin: auto 8.3em;
      width: 6em;
      height: 9em;
      padding-top: 0;
      cursor: default;
    }

    .character-sprites {
      margin: 0;
      width: 0;
    }
  }
</style>

<script>
import bModal from 'bootstrap-vue/lib/components/modal';

import Avatar from '../avatar';
import { mapState } from 'client/libs/store';
import {maxHealth} from '../../../common/script/index';
import styleHelper from 'client/mixins/styleHelper';

let BASE_URL = '@TODO';

export default {
  mixins: [styleHelper],
  components: {
    bModal,
    Avatar,
  },
  data () {
    let tweet = this.$t('levelUpShare');
    return {
      statsAllocationBoxIsOpen: true,
      maxHealth,
      tweet,
      socialLevelLink: `${BASE_URL}/social/level-up`,
      twitterLink: `https://twitter.com/intent/tweet?text=${tweet}&via=habitica&url=${BASE_URL}/social/level-up&count=none`,
    };
  },
  mounted () {
    this.loadWidgets();
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'level-up');
    },
    loadWidgets () {
      // @TODO:
    },
    changeLevelupSuppress () {
      // @TODO: dispatch set({"preferences.suppressModals.levelUp": user.preferences.suppressModals.levelUp?true: false})
    },
  },
};
</script>
