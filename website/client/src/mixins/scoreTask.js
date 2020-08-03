import axios from 'axios';
import Vue from 'vue';

import * as Analytics from '@/libs/analytics';
import notifications from './notifications';
import scoreTask from '@/../../common/script/ops/scoreTask';
import { mapState } from '@/libs/store';

export default {
  mixins: [notifications],
  computed: {
    ...mapState({
      castingSpell: 'spellOptions.castingSpell',
      user: 'user.data',
    }),
  },
  methods: {
    async taskScore (task, direction) {
      if (this.castingSpell) return;
      const { user } = this;

      const Content = this.$store.state.content;

      if (task.group.approval.required && !task.group.approval.approved) {
        task.group.approval.requested = true;
        const groupResponse = await axios.get(`/api/v4/groups/${task.group.id}`);
        const managers = Object.keys(groupResponse.data.data.managers);
        managers.push(groupResponse.data.data.leader._id);
        if (managers.indexOf(user._id) !== -1) {
          task.group.approval.approved = true;
        }
      }

      try {
        scoreTask({ task, user, direction });
      } catch (err) {
        this.text(err.message);
        return;
      }

      switch (task.type) { // eslint-disable-line default-case
        case 'habit':
          this.$root.$emit('playSound', direction === 'up' ? 'Plus_Habit' : 'Minus_Habit');
          break;
        case 'todo':
          this.$root.$emit('playSound', 'Todo');
          break;
        case 'daily':
          this.$root.$emit('playSound', 'Daily');
          break;
        case 'reward':
          this.$root.$emit('playSound', 'Reward');
          break;
      }

      Analytics.updateUser();
      const response = await axios.post(`/api/v4/tasks/${task._id}/score/${direction}`);
      // used to notify drops, critical hits and other bonuses
      const tmp = response.data.data._tmp || {};
      const { crit } = tmp;
      const { drop } = tmp;
      const { firstDrops } = tmp;
      const { quest } = tmp;

      if (crit) {
        const critBonus = crit * 100 - 100;
        this.crit(critBonus);
      }

      if (quest && user.party.quest && user.party.quest.key) {
        const userQuest = Content.quests[user.party.quest.key];
        if (quest.progressDelta && userQuest.boss) {
          this.damage(quest.progressDelta.toFixed(1));
        } else if (quest.collection && userQuest.collect) {
          user.party.quest.progress.collectedItems += 1;
          this.quest('questCollection', quest.collection);
        }
      }

      if (firstDrops) {
        if (!user.items.eggs[firstDrops.egg]) Vue.set(user.items.eggs, firstDrops.egg, 0);
        if (!user.items.hatchingPotions[firstDrops.hatchingPotion]) {
          Vue.set(user.items.hatchingPotions, firstDrops.hatchingPotion, 0);
        }
        user.items.eggs[firstDrops.egg] += 1;
        user.items.hatchingPotions[firstDrops.hatchingPotion] += 1;
      }

      if (drop) {
        let dropText;
        let dropNotes;
        let type;

        this.$root.$emit('playSound', 'Item_Drop');

        // Note: For Mystery Item gear, drop.type will be 'head', 'armor', etc
        // so we use drop.notificationType below.

        if (drop.type !== 'gear' && drop.type !== 'Quest' && drop.notificationType !== 'Mystery') {
          if (drop.type === 'Food') {
            type = 'food';
          } else if (drop.type === 'HatchingPotion') {
            type = 'hatchingPotions';
          } else {
            type = `${drop.type.toLowerCase()}s`;
          }

          if (!user.items[type][drop.key]) {
            Vue.set(user.items[type], drop.key, 0);
          }
          user.items[type][drop.key] += 1;
        }

        if (drop.type === 'HatchingPotion') {
          dropText = Content.hatchingPotions[drop.key].text();
          dropNotes = Content.hatchingPotions[drop.key].notes();
          this.drop(this.$t('messageDropPotion', { dropText, dropNotes }), drop);
        } else if (drop.type === 'Egg') {
          dropText = Content.eggs[drop.key].text();
          dropNotes = Content.eggs[drop.key].notes();
          this.drop(this.$t('messageDropEgg', { dropText, dropNotes }), drop);
        } else if (drop.type === 'Food') {
          dropText = Content.food[drop.key].textA();
          dropNotes = Content.food[drop.key].notes();
          this.drop(this.$t('messageDropFood', { dropText, dropNotes }), drop);
        } else if (drop.type === 'Quest') {
          // TODO $rootScope.selectedQuest = Content.quests[drop.key];
          // $rootScope.openModal('questDrop', {controller:'PartyCtrl', size:'sm'});
        } else {
          // Keep support for another type of drops that might be added
          this.drop(drop.dialog);
        }
      }
    },
  },
};
