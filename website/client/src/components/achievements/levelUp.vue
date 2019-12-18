<template>
  <b-modal
    id="level-up"
    :title="$t('levelUpShare')"
    size="sm"
    :hide-footer="true"
    :hide-header="true"
  >
    <div class="modal-body text-center">
      <h2>{{ $t('reachedLevel', {level: user.stats.lvl}) }}</h2>
      <avatar
        class="avatar"
        :member="user"
      />
      <p class="text">
        {{ $t('levelup') }}
      </p>
      <button
        class="btn btn-primary"
        @click="close()"
      >
        {{ $t('onwards') }}
      </button>
      <br>
      <!-- @TODO: Keep this? .checkboxinput(type='checkbox', v-model=
'user.preferences.suppressModals.levelUp', @change='changeLevelupSuppress()')
label(style='display:inline-block') {{ $t('dontShowAgain') }}
      -->
    </div>
  </b-modal>
</template>

<style lang="scss">
  #level-up {
    h2 {
      color: #4f2a93;
    }

    .modal-content {
      min-width: 28em;
    }

    .modal-body {
      padding-top: 1em;
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

    .text {
      font-size: 14px;
      text-align: center;
      color: #686274;
      margin-top: 1em;
      min-height: 0px;
    }
  }
</style>

<style scoped>
  .avatar {
    margin-left: 6.8em;
  }
</style>

<script>
import Avatar from '../avatar';
import { mapState } from '@/libs/store';
import { MAX_HEALTH as maxHealth } from '@/../../common/script/constants';
import styleHelper from '@/mixins/styleHelper';

export default {
  components: {
    Avatar,
  },
  mixins: [styleHelper],
  data () {
    return {
      statsAllocationBoxIsOpen: true,
      maxHealth,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    showAllocation () {
      return this.$store.getters['members:hasClass'](this.user) && !this.user.preferences.automaticAllocation;
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
