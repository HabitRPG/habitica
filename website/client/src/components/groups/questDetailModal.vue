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
         @click="goBackToQuestSelection()">
      Back to quest selection
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


    @media only screen and (max-width: 1200px) {
      .modal-dialog {
        max-width: 33%;
      }
    }

    @media only screen and (max-width: 1000px) {
      .modal-dialog {
        max-width: 80%;
        width: 80% !important;

        .modal-body {
          flex-direction: column;
          display: flex;

          div:nth-child(1) { order: 3; }
          div:nth-child(2) { order: 1; }
          div:nth-child(3) { order: 4; }
          div:nth-child(4) { order: 5; }
          div:nth-child(5) { order: 2; }

          .left-panel {
            border-radius: 8px;
            position: static;
            right: initial;
            margin: 20px 0;
            height: auto;
            width: 100%;
            z-index: 0;
            order: 3;

            .col-4 {
              max-width: 100px;
            }
          }
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

import copyIcon from '@/assets/svg/copy.svg';
import greyBadgeIcon from '@/assets/svg/grey-badge.svg';
import qrCodeIcon from '@/assets/svg/qrCode.svg';
import facebookIcon from '@/assets/svg/facebook.svg';
import twitterIcon from '@/assets/svg/twitter.svg';
import starIcon from '@/assets/svg/star.svg';
import goldIcon from '@/assets/svg/gold.svg';
import difficultyStarIcon from '@/assets/svg/difficulty-star.svg';
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
        copy: copyIcon,
        greyBadge: greyBadgeIcon,
        qrCode: qrCodeIcon,
        facebook: facebookIcon,
        twitter: twitterIcon,
        starIcon,
        goldIcon,
        difficultyStarIcon,
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

        if (this.$store.state.party.data) this.$store.state.party.data.quest = quest;
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
