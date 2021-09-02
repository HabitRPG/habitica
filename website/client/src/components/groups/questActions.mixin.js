export default {
  computed: {
    onActiveQuest () {
      return this.group.quest.active;
    },
    groupHasQuest () {
      return this.group.quest && Boolean(this.group.quest.key);
    },
    canEditQuest () {
      if (!this.group.quest) return false;
      const isQuestLeader = this.group.quest.leader === this.user._id;
      const isPartyLeader = this.group.leader && this.group.leader._id === this.user._id;
      return isQuestLeader || isPartyLeader;
    },
  },
  methods: {
    async questActionsConfirmQuest () {
      let count = 0;
      for (const uuid in this.group.quest.members) {
        if (this.group.quest.members[uuid]) count += 1;
      }
      if (!window.confirm(this.$t('questConfirm', {
        questmembers: count,
        totalmembers: this.group.memberCount,
      }))) {
        return false;
      }
      await this._questForceStart();

      return true;
    },
    async _questForceStart () {
      const quest = await this.$store.dispatch('quests:sendAction', { groupId: this.group._id, action: 'quests/force-start' });
      this.group.quest = quest;
    },
    // this method combines both if a quest is active or not
    // it'll call the appropriate api endpoint
    async questActionsCancelOrAbortQuest () {
      const partyState = this.$store.state.party;

      if (!partyState.data) {
        partyState.data = {};
      }

      if (this.onActiveQuest) {
        if (!window.confirm(this.$t('sureAbort'))) {
          return false;
        }

        const quest = await this.$store.dispatch('quests:sendAction', {
          groupId: this.group._id,
          action: 'quests/abort',
        });
        this.group.quest = quest;
        partyState.data.quest = quest;
        this.$store.dispatch('party:getMembers', { forceLoad: true });
      } else {
        if (!window.confirm(this.$t('sureCancel'))) {
          return false;
        }

        const quest = await this.$store.dispatch('quests:sendAction', {
          groupId: this.group._id,
          action: 'quests/cancel',
        });
        this.group.quest = quest;
        partyState.data.quest = quest;
      }

      return true;
    },
  },
};
