export default {
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
    async questActionsCancelQuest () {
      if (!window.confirm(this.$t('sureCancel'))) {
        return;
      }
      const quest = await this.$store.dispatch('quests:sendAction', { groupId: this.group._id, action: 'quests/cancel' });
      this.group.quest = quest;
    },
  },
};
