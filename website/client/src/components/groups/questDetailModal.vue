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
      {{ selectMode ? $t('selectQuest') : $t('questDetails') }}
    </h2>
    <div
      v-if="selectMode"
      class="quest-panel"
    >
      <div class="quest-panel-header">
        <h3>
          {{ $t('yourQuests') }}
        </h3>
        <div class="sort-by">
          <span class="dropdown-label">{{ $t('sort') }}</span>
          <select-translated-array
            :right="true"
            :items="['quantity', 'AZ']"
            :value="sortBy"
            class="inline"
            :inline-dropdown="false"
            @select="sortBy = $event"
          />
        </div>
      </div>

      <div class="quest-items">
        <div
          v-for="item in questsInfoList"
          :key="item.key"
          class="quest-col"
          @click="selectQuest(item)"
        >
          <item
            :key="item.key"
            :item="item"
            :item-content-class="item.class"
          >
            <countBadge
              slot="itemBadge"
              :show="item.amount !== 1"
              :count="item.amount"
            />
            <template
              slot="popoverContent"
              slot-scope="context"
            >
              <div
                class="questPopover"
              >
                <h4 class="popover-content-title">
                  {{ context.item.text }}
                </h4>
                <questInfo :quest="context.item" />
              </div>
            </template>
          </item>
        </div>
      </div>
      <div class="row">
        <div class="col-10 offset-1 text-center">
          <span
            v-once
            class="no-quest-to-start"
          >
            <b>{{ $t('noQuestToStartTitle') }}</b> <br>
            <span v-html="$t('noQuestToStart', { questShop: '/shops/quests' })"></span>
          </span>
        </div>
      </div>
    </div>
    <div v-else>
      <div
        v-if="questData"
        class="quest-combined-content"
      >
        <questDialogContent
          :item="questData"
          :group="group"
          class="quest-detail"
        />
        <quest-rewards
          :quest="questData"
          class="mt-4"
        />
      </div>
      <div
        v-if="!groupHasQuest"
        class="text-center"
      >
        <button
          class="btn btn-primary mt-0 invite-btn"
          :disabled="!Boolean(selectedQuest) || loading"
          @click="questInit()"
        >
          {{ $t('inviteParty') }}
        </button>
      </div>
      <div
        v-if="fromSelectionDialog"
        class="text-center back-to-selection"
        @click="goBackToQuestSelection()"
      >
        <span
          v-once
          class="svg-icon color"
          v-html="icons.navigationBack"
        >
        </span>

        <span>
          {{ $t('backToSelection') }}
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
            class="btn btn-success mb-3"
            @click="questConfirm()"
          >
            {{ $t('startQuest') }}
          </button>
        </div>
        <div>
          <div
            v-once
            class="cancel"
            @click="questCancel()"
          >
            {{ $t('cancelQuest') }}
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  h2 {
    color: $purple-300;
    margin-top: 1rem;
  }

  .invite-btn {
    margin-bottom: 1rem;
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

    &:hover {
      text-decoration: underline;
    }

    .svg-icon {
      color: $blue-50;
      height: 14px;
      width: 9px;

      margin-right: 0.5rem;
    }
  }

  .quest-panel {
    background-color: $gray-700;

    // reset margin
    margin-left: -1rem;
    margin-right: -1rem;
    margin-bottom: -1rem;

    // add padding back
    padding-top: 1rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    padding-bottom: 2rem;

    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
  }

  .quest-panel-header {
    padding-bottom: 1rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .quest-items {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;

    // somehow the browser felt like setting this 398px instead
    // now its fixed to 400 :)
    width: 400px;

    margin-bottom: 1.5rem;

    .quest-col {
      ::v-deep {
        .item-wrapper {
          margin-bottom: 0;
        }
      }
    }
  }

  .quest-detail {
    margin-left: 1rem;
    margin-right: 1rem;
  }

  .no-quest-to-start {
    font-size: 12px;
    line-height: 1.33;
    text-align: center;

    color: $gray-100;
  }

  #quest-detail-modal {
    ::v-deep & {
      .modal-dialog {
        width: 448px !important;
      }
    }

    .quest-combined-content {
      margin-bottom: 1.5rem;
    }

    ::v-deep &:not(.need-bottom-padding) {
      .modal-content {
        // so that the rounded corners still apply
        overflow: hidden;
      }

      .modal-body {
        padding-bottom: 0;
      }

      .quest-combined-content {
        margin-bottom: 0;
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
      padding-bottom: .5em;

      .cancel {
        color: $maroon-50;
      }

      .cancel:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    }
  }

</style>

<script>
import orderBy from 'lodash/orderBy';
import { mapState } from '@/libs/store';
import * as Analytics from '@/libs/analytics';

import * as quests from '@/../../common/script/content/quests';

import navigationBack from '@/assets/svg/navigation_back.svg';
import questDialogContent from '../shops/quests/questDialogContent';
import closeIcon from '../shared/closeIcon';
import QuestRewards from '../shops/quests/questRewards';
import questActionsMixin from './questActions.mixin';
import SelectTranslatedArray from '../tasks/modal-controls/selectTranslatedArray';
import QuestInfo from '../shops/quests/questInfo';
import Item from '@/components/inventory/item';
import getItemInfo from '../../../../common/script/libs/getItemInfo';
import CountBadge from '../ui/countBadge';

export default {
  components: {
    CountBadge,
    QuestRewards,
    questDialogContent,
    closeIcon,
    SelectTranslatedArray,
    QuestInfo,
    Item,
  },
  mixins: [questActionsMixin],
  props: ['group'],
  data () {
    return {
      loading: false,
      selectMode: true,
      selectedQuest: {},
      fromSelectionDialog: false,
      icons: Object.freeze({
        navigationBack,
      }),
      shareUserIdShown: false,
      quests,
      sortBy: 'AZ',
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    questData () {
      return quests.quests[this.selectedQuest];
    },
    dialogClass () {
      if (!this.groupHasQuest || this.fromSelectionDialog || this.canEditQuest) {
        return 'need-bottom-padding';
      }

      return '';
    },

    questsInfoList () {
      const availableQuests = Object.entries(this.user.items.quests)
        .filter(([, amount]) => amount > 0);

      return orderBy(availableQuests.map(([key, amount]) => {
        const questItem = quests.quests[key];

        return {
          ...getItemInfo(this.user, 'quests', questItem),
          amount,
        };
      }), item => (this.sortBy === 'AZ' ? item.text : -item.amount));
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

    this.$root.$on('bv::show::modal', this.handleOpen);
  },
  beforeDestroy () {
  },
  methods: {
    selectQuest (selectQuestPayload) {
      this.selectMode = false;
      this.selectedQuest = selectQuestPayload.key;
      this.fromSelectionDialog = true;
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
      this.selectMode = true;
    },
    handleOpen (_, selectQuestPayload) {
      this.fromSelectionDialog = false;

      if (selectQuestPayload) {
        this.selectMode = false;
        this.selectedQuest = selectQuestPayload.key;
      } else {
        this.selectMode = true;
      }
    },
  },
};
</script>
