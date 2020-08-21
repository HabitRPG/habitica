<template>
  <b-modal
    id="level-up"
    :title="$t('reachedLevel', {level: user.stats.lvl})"
    size="sm"
  >
    <div class="modal-body text-center">
      <div class="sparkly-avatar">
        <span v-html="starGroup" class="star-group mirror"></span>
        <avatar class="avatar" :member="user"/>
        <span v-html="starGroup" class="star-group"></span>
      </div>
      <hr>
      <p class="text">{{ $t('levelup') }}</p>
    </div>
    <template v-slot:modal-footer v-bind:class="{ greyed: greyFooter }">
      <button class="btn btn-primary" @click="close()">{{ $t('onwards') }}</button>
      <br>
      <!-- @TODO: Keep this? .checkboxinput(type='checkbox', v-model=
'user.preferences.suppressModals.levelUp', @change='changeLevelupSuppress()')
label(style='display:inline-block') {{ $t('dontShowAgain') }}
      -->
    </template>
  </b-modal>
</template>

<style lang="scss">
  #level-up {
    @media (min-width: 576px) {
      .modal-sm {
        max-width: 330px;
      }
    }

    .modal-header {
      padding: 0;
      text-align: center;
      border: none;
    }

    .modal-header h5 {
      margin: 31px auto 16px auto;
      color: #4f2a93;
    }

    .modal-header button {
      position: absolute;
      right: 18px;
      top: 12px;
    }

    .modal-body {
      padding: 0;
    }

    .sparkly-avatar {
      display: flex;
    }

    .star-group {
      margin: auto;
    }

    .star-group svg {
      height: 64px;
      width: 40px;
    }

    .mirror svg {
      transform: scaleX(-1);
    }

    .character-sprites {
      margin-left: -2rem !important;
    }

    .class-badge {
      display: none !important;
    }

    hr {
      margin: 0;
      border: 0;
      border-top: 25px solid #ff3ff9;
      opacity: 0.2;
    }

    .text {
      font-size: 14px;
      text-align: center;
      color: #686274;
      margin: 0 24px 24px 24px;
      min-height: 0px;
    }

    .modal-footer {
      margin: 0;
      padding: 0;
      border: none;
    }

    .modal-footer button {
      margin: 0 auto 32px auto;
    }

    .greyed {
      background-color: #f9f9f9;
    }
  }
</style>

<script>
import Avatar from '../avatar';
import { mapState } from '@/libs/store';
import { MAX_HEALTH as maxHealth } from '@/../../common/script/constants';
import styleHelper from '@/mixins/styleHelper';
import starGroup from '@/assets/svg/star-group.svg';
import sparkles from '@/assets/svg/sparkles-left.svg';

export default {
  components: {
    Avatar,
  },
  mixins: [styleHelper],
  data () {
    return {
      statsAllocationBoxIsOpen: true,
      maxHealth,
      starGroup,
      sparkles,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    showAllocation () {
      return this.$store.getters['members:hasClass'](this.user) && !this.user.preferences.automaticAllocation;
    },
    greyFooter () {
      return false;
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'level-up');
    },
    changeLevelupSuppress () {
      // @TODO: dispatch set({"preferences.suppressModals.levelUp":
      // user.preferences.suppressModals.levelUp?true: false})
    },
  },
};
</script>
