<template>
  <b-modal
    id="quest-detail-modal"
    title="Empty"
    size="md"
    :hide-footer="true"
    :hide-header="true"
    :modal-class="dialogClass"
  >
    <div class="dialog-close">
      <close-icon @click="close()" />
    </div>
    <h2 class="text-center textCondensed">
      {{ $t('questDetailsTitle') }}
    </h2>
    <div v-if="questData">
      <questDialogContent
        :item="questData"
        :group="group"
      />
      <quest-rewards :quest="questData" />
    </div>
    <div
      v-if="!groupHasQuest"
      class="text-center"
    >
      <button
        class="btn btn-primary"
        :disabled="!Boolean(selectedQuest) || loading"
        @click="questInit()"
      >
        {{ $t('inviteToPartyOrQuest') }}
      </button>
    </div>
    <div v-if="fromSelectionDialog"
         class="text-center back-to-selection"
         @click="goBackToQuestSelection()">
      <span v-once
           class="svg-icon color"
           v-html="icons.navigationBack">
      </span>

      <span>
        Back to quest selection
      </span>
    </div>
    <div
      v-if="groupHasQuest && canEditQuest"
      class="text-center actions"
    >
      <div>
        <button
          v-if="!onActiveQuest"
          v-once
          class="btn btn-secondary mb-2"
          @click="questConfirm()"
        >
          {{ $t('begin') }}
        </button>
        <!-- @TODO don't allow the party leader to
         start the quest until the leader has accepted
        or rejected the invitation (users get confused and think "begin" means "join quest")-->
      </div>
      <div>
        <div
          v-once
          class="cancel"
          @click="questCancel()"
        >
          {{ $t('cancel') }}
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  h2 {
    color: $purple-300;
  }

  .btn-primary {
    margin: 1em 0;
  }

  .back-to-selection {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    cursor: pointer;

    color: $blue-10;
    font-size: 14px;
    line-height: 1.71;
    text-align: right;

    .svg-icon {
      color: $blue-50;
      height: 14px;
      width: 9px;

      margin-right: 0.5rem;
    }
  }

  #quest-detail-modal {
    ::v-deep & {
      .modal-dialog {
        width: 448px !important;
      }
    }

    ::v-deep &:not(.need-bottom-padding) {
      .modal-content {
        // so that the rounded corners still apply
        overflow: hidden;
      }

      .modal-body {
        padding-bottom: 0;
      }
    }

    @media only screen and (max-width: 1000px) {
      .modal-dialog {
        max-width: 80%;
        width: 80% !important;

        .modal-body {
          flex-direction: column;
          display: flex;
        }
      }
    }

    .actions {
      padding-top: 1.5em;
      padding-bottom: .5em;

      .cancel {
        color: #f74e52;
      }

      .cancel:hover {
        cursor: pointer;
      }
    }
  }

</style>

<script>
import { mapState } from '@/libs/store';
import * as Analytics from '@/libs/analytics';

import * as quests from '@/../../common/script/content/quests';

import navigationBack from '@/assets/svg/navigation_back.svg';
import questDialogContent from '../shops/quests/questDialogContent';
import closeIcon from '../shared/closeIcon';
import QuestRewards from '../shops/quests/questRewards';
import questActionsMixin from './questActions.mixin';

export default {
  components: {
    QuestRewards,
    questDialogContent,
    closeIcon,
  },
  mixins: [questActionsMixin],
  props: ['group'],
  data () {
    return {
      loading: false,
      selectedQuest: {},
      fromSelectionDialog: false,
      icons: Object.freeze({
        navigationBack,
      }),
      shareUserIdShown: false,
      quests,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    questData () {
      return quests.quests[this.selectedQuest];
    },
    dialogClass () {
      console.info({
        group: this.groupHasQuest,
        sel: this.fromSelectionDialog,
        edit: this.canEditQuest,
      });
      if (!this.groupHasQuest || this.fromSelectionDialog || this.canEditQuest) {
        return 'need-bottom-padding';
      }

      return '';
    },
  },
  mounted () {
    const userQuests = this.user.items.quests;
    for (const key in userQuests) {
      if (userQuests[key] > 0) {
        this.selectedQuest = key;
        break;
      }
    }

    this.$root.$on('selectQuest', this.selectQuest);
  },
  beforeDestroy () {
    this.$root.$off('selectQuest', this.selectQuest);
  },
  methods: {
    selectQuest (selectQuestPayload) {
      this.selectedQuest = selectQuestPayload.key;
      this.fromSelectionDialog = selectQuestPayload.from === 'quest-selection';
    },
    async questInit () {
      this.loading = true;

      Analytics.updateUser({
        partyID: this.group._id,
        partySize: this.group.memberCount,
      });

      const groupId = this.group._id || this.user.party._id;

      const key = this.selectedQuest;
      try {
        const response = await this.$store.dispatch('guilds:inviteToQuest', { groupId, key });
        const quest = response.data.data;

        // TODO move the state updates to the action itself
        const partyState = this.$store.state.party;

        if (!partyState.data) {
          partyState.data = {};
        }

        partyState.data.quest = quest;
      } finally {
        this.loading = false;
      }

      this.close();
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'quest-detail-modal');
    },
    async questConfirm () {
      const accepted = await this.questActionsConfirmQuest();

      if (accepted) {
        this.close();
      }
    },
    async questCancel () {
      const accepted = await this.questActionsCancelOrAbortQuest();

      if (accepted) {
        this.close();
      }
    },
    goBackToQuestSelection () {
      this.close();
      this.$root.$emit('bv::show::modal', 'select-quest-modal');
    },
  },
};
</script>
