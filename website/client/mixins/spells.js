import isArray from 'lodash/isArray';

// @TODO: Let's separate some of the business logic out of Vue if possible
export default {
  methods: {
    handleCastCancelKeyUp (keyEvent) {
      if (keyEvent.keyCode !== 27) return;
      this.castCancel();
    },
    async castStart (spell, member) {
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
        return this.castEnd(null, spell.target);
      } else if (spell.target === 'party') {
        if (!this.user.party._id) {
          let party = [this.user];
          return this.castEnd(party, spell.target);
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
        return this.castEnd(tasks, spell.target);
      } else if (spell.target === 'user') {
        let result = await this.castEnd(member, spell.target);

        if (member.id === this.user.id) {
          this.$set(this.$store.state.user.data, 'stats', member.stats);
        }

        return result;
      } else {
        // If the cast target has to be selected (and can be cancelled)
        document.addEventListener('keyup', this.handleCastCancelKeyUp);

        this.$root.$on('castEnd', (target, type, $event) => {
          this.castEnd(target, type, $event);
        });
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

      let spell = this.spell;

      this.castCancel();

      // the selected member doesn't have the flags property which sets `cardReceived`
      if (spell.pinType !== 'card') {
        spell.cast(this.user, target);
      }

      let targetId = target ? target._id : null;

      let spellText = typeof spell.text === 'function' ? spell.text() : spell.text;

      let apiResult = await this.$store.dispatch('user:castSpell', {key: spell.key, targetId});
      let msg = '';


      switch (type) {
        case 'task':
          msg = this.$t('youCastTarget', {
            spell: spellText,
            target: target.text,
          });
          break;
        case 'user':
          msg = spell.pinType === 'card' ?
            this.$t('sentCardToUser', { profileName: target.profile.name }) :
            this.$t('youCastTarget', {
              spell: spellText,
              target: target.profile.name,
            });
          break;
        case 'party':
          msg = this.$t('youCastParty', {
            spell: spellText,
          });
          break;
        default:
          msg = this.$t('youCast', {
            spell: spellText,
          });
          break;
      }

      if (spell.pinType === 'card') {
        const newUserGp = apiResult.data.data.user.stats.gp;
        this.$store.state.user.data.stats.gp = newUserGp;
      }


      this.markdown(msg); // @TODO: mardown directive?

      // If using mpheal and there are other mages in the party, show extra notification
      if (type === 'party' && spell.key === 'mpheal') {
        // Get party
        let members = await this.$store.dispatch('members:getGroupMembers', {
          groupId: target[0].party._id,
          includeAllPublicFields: true,
        });
        // Counting mages
        let magesCount = 0;
        for (let i = 0; i < members.length; i++) {
          if (members[i].stats.class === 'wizard') {
            magesCount++;
          }
        }
        // If there are mages, show message telling that the mpheal don't work on other mages
        if (magesCount > 0) {
          this.markdown(this.$t('spellWizardNoEthOnMage'));
        }
      }

      // @TODO:
      if (!beforeQuestProgress) return apiResult;
      let questProgress = this.questProgress() - beforeQuestProgress;
      if (questProgress > 0) {
        let userQuest = this.quests[this.user.party.quest.key];
        if (userQuest.boss) {
          this.quest('questDamage', questProgress.toFixed(1));
        } else if (userQuest.collection && userQuest.collect) {
          this.quest('questCollection', questProgress);
        }
      }


      return apiResult;
      // @TOOD: User.sync();
    },
    castCancel () {
      this.potionClickMode = false;
      this.applyingAction = false;
      this.spell = null;
      document.querySelector('body').style.cursor = 'initial';
      this.$store.state.spellOptions.castingSpell = false;

      // Remove listeners
      this.$root.$off('castEnd');
      document.removeEventListener('keyup', this.handleCastCancelKeyUp);
    },
  },
};
