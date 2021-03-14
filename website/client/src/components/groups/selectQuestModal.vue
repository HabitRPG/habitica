<template>
  <b-modal
    id="select-quest-modal"
    title="Empty"
    size="md"
    :hide-footer="true"
    :hide-header="true"
  >
    <div class="dialog-close">
      <close-icon @click="hideDialog()" />
    </div>
    <div>
      <h2 class="text-center textCondensed">
        {{ $t('quests') }}
      </h2>
      <div class="quest-panel">
        <div class="row">
          <!-- eslint-disable vue/no-use-v-if-with-v-for -->
          <div
            v-for="item in questsInfoList"
            :key="item.key"
            class="col-4 quest-col"
            @click="selectQuest(item)"
          >
            <item
              :key="item.key"
              :item="item"
              :item-content-class="item.class"
            >
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
              class="description"
            >{{ $t('noQuestToStart') }}</span>
          </div>
        </div>
      </div>
    </div>
  </b-modal>
</template>

<style lang='scss' scoped>
  @import '~@/assets/scss/colors.scss';

  .btn-primary {
    margin: 1em 0;
  }

  h2 {
    font-size: 20px;
    font-weight: bold;
    line-height: 1.4;

    color: $purple-300;
  }

  #select-quest-modal {
  @media only screen and (max-width: 1200px) {
    .modal-dialog {
      max-width: 33%;

      .left-panel {
        left: initial;
        width: 100%;
        right: 100%;

        .col-4 {
          width: 100px;
        }
      }

      .side-panel, .right-sidebar {
        left: calc(100% - 10px);
        max-width: 100%;
        right: initial;

        .questRewards {
          width: 90%;

          .reward-item {
            width: 100%;
          }
        }
      }
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

        .side-panel, .right-sidebar {
          margin: 20px 0 0 0;
          position: static;
          box-shadow: none;
          height: auto;
          width: 100%;
          z-index: 0;
          order: 2;
          left: 0;

          .questRewards {
            padding: 0 2em 2em 2em;
            width: 100%;
            z-index: 0;
          }
        }
      }
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
import QuestInfo from '../shops/quests/questInfo';
import Item from '@/components/inventory/item';
import closeIcon from '../shared/closeIcon';
import getItemInfo from '../../../../common/script/libs/getItemInfo';

export default {
  components: {
    QuestInfo,
    closeIcon,
    Item,
  },
  props: ['group'],
  data () {
    return {
      loading: false,
      selectedQuest: {},
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
    questsInfoList () {
      const availableQuests = Object.entries(this.user.items.quests)
        .filter(([, amount]) => amount > 0)
        .map(([key]) => key);

      return availableQuests.map(key => {
        const questItem = quests.quests[key];

        return getItemInfo(this.user, 'quests', questItem);
      });
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
  },
  methods: {
    selectQuest (quest) {
      this.hideDialog();

      this.$root.$emit('bv::show::modal', 'quest-detail-modal');
      this.$root.$emit('selectQuest', {
        key: quest.key,
        from: 'quest-selection',
      });

      this.selectedQuest = quest.key;
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

      this.hideDialog();
    },
    hideDialog () {
      this.$root.$emit('bv::hide::modal', 'select-quest-modal');
    },
  },
};
</script>
