import axios from 'axios';
import isArray from 'lodash/isArray';

// @TODO: Let's separate some of the business logic out of Vue if possible
export default {
  methods: {
    async castStart (spell) {
      if (this.$store.state.spellOptions.castingSpell) {
        this.castCancel();
        return;
      }

      if (this.user.stats.mp < spell.mana) return this.text(this.$t('notEnoughMana'));

      if (spell.immediateUse && this.user.stats.gp < spell.value) {
        return this.text('Not enough gold.');
      }

      this.potionClickMode = true;
      this.applyingAction = true;
      this.$store.state.spellOptions.castingSpell = true;
      this.spell = spell;

      if (spell.target === 'self') {
        this.castEnd(null, spell.target);
      } else if (spell.target === 'party') {
        if (!this.user.party._id) {
          let party = [this.user];
          this.castEnd(party, spell.target);
          return;
        }

        let party = this.$store.state.partyMembers;
        party = isArray(party) ? party : [];
        party = party.concat(this.user);
        this.castEnd(party, spell.target);
      } else if (spell.target === 'tasks') {
        let userTasks = this.$store.state.tasks.data;
        // exclude rewards
        let tasks = userTasks.habits
          .concat(userTasks.dailys)
          .concat(userTasks.todos);
        // exclude challenge and group plan tasks
        tasks = tasks.filter((task) => {
          if (task.challenge && task.challenge.id && !task.challenge.broken) return false;
          if (task.group && task.group.id && !task.group.broken) return false;
          return true;
        });
        this.castEnd(tasks, spell.target);
      }
    },
    async castEnd (target, type) {
      if (!this.$store.state.spellOptions.castingSpell) return;
      let beforeQuestProgress;
      if (this.spell.target === 'party') beforeQuestProgress = this.questProgress();

      if (!this.applyingAction) return 'No applying action';

      if (this.spell.target !== type) return this.text(this.$t('invalidTarget'));
      if (target && target.type && target.type === 'reward') return this.text(this.$t('invalidTarget'));
      if (target && target.challenge && target.challenge.id) return this.text(this.$t('invalidTarget'));
      if (target && target.group && target.group.id) return this.text(this.$t('invalidTarget'));

      // @TODO: just call castCancel?
      this.$store.state.spellOptions.castingSpell = false;
      this.potionClickMode = false;

      this.spell.cast(this.user, target);
      // User.save(); // @TODO:

      let spell = this.spell;
      let targetId = target ? target._id : null;
      this.spell = null;
      this.applyingAction = false;

      let spellUrl = `/api/v3/user/class/cast/${spell.key}`;
      if (targetId) spellUrl += `?targetId=${targetId}`;

      let spellText = typeof spell.text === 'function' ? spell.text() : spell.text;

      await axios.post(spellUrl);
      let msg = this.$t('youCast', {
        spell: spellText,
      });

      switch (type) {
        case 'task':
          msg = this.$t('youCastTarget', {
            spell: spellText,
            target: target.text,
          });
          break;
        case 'user':
          msg = this.$t('youCastTarget', {
            spell: spellText,
            target: target.profile.name,
          });
          break;
        case 'party':
          msg = this.$t('youCastParty', {
            spell: spellText,
          });
          break;
      }

      this.markdown(msg); // @TODO: mardown directive?
      // @TODO:
      if (!beforeQuestProgress) return;
      let questProgress = this.questProgress() - beforeQuestProgress;
      if (questProgress > 0) {
        let userQuest = this.quests[this.user.party.quest.key];
        if (userQuest.boss) {
          this.quest('questDamage', questProgress.toFixed(1));
        } else if (userQuest.collection && userQuest.collect) {
          this.quest('questCollection', questProgress);
        }
      }
      // @TOOD: User.sync();
    },
    castCancel () {
      this.potionClickMode = false;
      this.applyingAction = false;
      this.spell = null;
      document.querySelector('body').style.cursor = 'initial';
      this.$store.state.spellOptions.castingSpell = false;
    },
  },
};
