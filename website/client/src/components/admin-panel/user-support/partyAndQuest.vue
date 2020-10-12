<template>
  <div class="accordion-group">
    <h3
      class="expand-toggle"
      :class="{'open': expand}"
      @click="expand = !expand"
    >
      Party, Quest
      <span
        v-if="errorsOrWarningsExist"
      >- ERRORS / WARNINGS EXIST</span>
    </h3>
    <div v-if="expand">
      <div
        v-if="errorsOrWarningsExist"
        class="errorMessage"
      >
        <p v-if="partyNotExistError">
          ERROR: User has a Party ID but that Party does not exist.
          If you are seeing a red error notification on screen now
          ("<strong>Group with id ... not found</strong>"), it's refering to this issue.
          <br>Ask a database admin to delete the user's Party ID ({{ userPartyData._id }}).
        </p>
        <p
          v-if="questErrors"
          v-html="questErrors"
        ></p>
      </div>

      <div>
        Party:
        <span v-if="userHasParty">
          yes: party ID {{ groupPartyData._id }},
          member count {{ groupPartyData.memberCount }} (may be wrong)
          <br>
          <span v-if="userIsPartyLeader">User is the party leader</span>
          <span v-else>Party leader is
            <router-link :to="{'name': 'userProfile', 'params': {'userId': groupPartyData.leader}}">
              {{ groupPartyData.leader }}
            </router-link>
          </span>
        </span>
        <span v-else>no</span>
      </div>
      <div class="subsection-start">
        <p v-html="questStatus"></p>
      </div>
    </div>
  </div>
</template>

<script>
import * as quests from '@/../../common/script/content/quests';

function determineQuestStatus (self) {
  // Quest data is in the user doc and party doc. They can be out of sync.
  // Here we collate data from both sources, showing error messages if needed.

  // First get data from the party's document.
  const groupQuestData = self.groupPartyData.quest;
  let questExists = false; // true if quest is active or in invitation stage
  let questIsActive = false; // true if quest's invitation stage is over
  let inviteStatusForUser = '';
  let expectedRsvpStatusForUser = false;
  let countOfQuestMembers = 0;
  if (self.userHasParty && groupQuestData) {
    questIsActive = groupQuestData.active;
    if (groupQuestData.members) countOfQuestMembers = Object.keys(groupQuestData.members).length;
    if (groupQuestData.key) {
      questExists = true;
      if (!countOfQuestMembers) {
        self.questErrors = 'ERROR: Quest is running or in invitation stage but has no participants.';
      } else if (groupQuestData.members[self.userId] === null) {
        inviteStatusForUser = 'pending';
        if (questIsActive) {
          self.questErrors = 'ERROR: Quest is running but user\'s invitation is still pending ("null") in quest object.';
        } else {
          expectedRsvpStatusForUser = true;
        }
      } else if (groupQuestData.members[self.userId] === false) {
        inviteStatusForUser = 'rejected';
        if (questIsActive) {
          self.questErrors = 'ERROR: Quest is running and user\'s invitation was rejected BUT '
            + 'it wasn\'t cleared properly from the quest\'s data ("false"). '
            + 'That shouldn\'t cause any problems though.';
        }
      } else if (groupQuestData.members[self.userId] === true) {
        inviteStatusForUser = 'accepted';
      } else if (questIsActive) {
        inviteStatusForUser = 'rejected OR not accepted before quest start OR user joined party after quest started';
      } else {
        inviteStatusForUser = 'missing';
        self.questErrors = 'ERROR: Quest is in invitation stage but user doesn\'t have an invitation '
          + 'in the party\'s data ("quest.members" needs to be fixed).';
      }
    } else if (questIsActive) {
      self.questErrors = 'ERROR: Quest is running but there is no "key" to say which quest it is. '
        + 'This means the other data and errors in this section are unreliable, '
        + 'and there may be more errors not shown here.'
        + 'Other errors here may tell you which key to add.'
        + 'After fixing, check for more errors.';
      // @TODO display a similar message for when it happens during invitation stage
    }
  }
  if (self.questErrors) self.questErrors += '<br>';
  // from this point on, further quest errors need to be appended to that

  let questStatus = '<p>';
  if (questExists) {
    questStatus = 'Quest exists and is ';
    if (questIsActive) {
      questStatus += 'running.<br>User is ';
      if (inviteStatusForUser !== 'accepted') questStatus += 'not ';
      questStatus += 'a participant.';
    } else {
      questStatus += 'in invitation stage.<br>'
        + `User's invitation is ${inviteStatusForUser}.`;
    }
    questStatus += '<br>';
    if (!groupQuestData.leader) {
      self.questErrors += 'ERROR: quest does not have its owner specified '
        + '(party needs value for "quest.leader").<br>';
    } else if (groupQuestData.leader === self.userId) {
      questStatus += 'User is the quest owner.';
    } else {
      questStatus += `Quest owner is ${groupQuestData.leader}`;
    }
  } else {
    questStatus = 'No quest.';
  }
  questStatus += '</p>';

  // Assess quest participants.
  if (questExists && countOfQuestMembers) {
    const participants = (questIsActive) ? 'participants' : 'invitees';
    questStatus += `<p>Quest has ${countOfQuestMembers} ${participants}:<ul>`;
    for (const [memberId, inviteStatus] of Object.entries(groupQuestData.members)) {
      questStatus += '<li>';
      questStatus += (memberId === self.userId)
        ? `@${self.username}`
        : memberId;
      let invitationDescription = '';
      const errMsg = ' - MINOR ERROR: this data should have been deleted when quest started';
      if (inviteStatus === true) {
        if (!questIsActive) invitationDescription = ' - invitation accepted';
        // we don't display anything if quest is running - obvious that participant accepted
      } else if (inviteStatus === false) {
        invitationDescription += ' - invitation rejected';
        if (questIsActive) invitationDescription += errMsg;
      } else {
        invitationDescription += ' - invitation pending';
        if (questIsActive) invitationDescription += errMsg;
      }
      questStatus += invitationDescription;
      questStatus += '</li>';
    }
    questStatus += '</ul></p>';
    // @TODO: show error if all invitations accepted but quest not active
  }

  // Now get data from the user's document.
  if (!self.userPartyData.quest) self.userPartyData.quest = {};
  if (self.userPartyData.quest.RSVPNeeded !== expectedRsvpStatusForUser) {
    self.questErrors
      += `ERROR: User's quest invitation ("party.quest.RSVPNeeded") should be "${expectedRsvpStatusForUser}" but isn't.<br>`;
  }

  if (inviteStatusForUser === 'pending' || inviteStatusForUser === 'accepted') {
    if (!self.userPartyData.quest.key) {
      self.questErrors += 'ERROR: User has accepted quest invitation or invitation is '
        + 'still pending but their account has no "key" for the quest.<br>';
    } else if (self.userPartyData.quest.key !== groupQuestData.key) {
      self.questErrors += 'ERROR: User has accepted quest invitation or invitation is '
        + `still pending but the "key" in their account (${self.userPartyData.quest.key}) `
        + `is different than the quest's "key" (${groupQuestData.key}).<br>`;
    }
  } else if (self.userPartyData.quest.key) {
    self.questErrors += `ERROR: User has a "key" for the quest (${self.userPartyData.quest.key})`
      + 'but perhaps should not have (no quest exists, or user not participating, '
      + 'or quest is in erroneous state).<br>';
  }

  // Display details of quest (name, type, progress, etc).
  if (questExists) {
    const questContent = quests.quests[groupQuestData.key];
    if (questContent) {
      let questContentData = `<strong>Quest Details</strong>:<br>Quest name: ${questContent.text()}<br>Quest "key": ${questContent.key}`;
      let questProgress = '<strong>Quest Progress:</strong>';
      if (!questIsActive) questProgress += ' none (quest is in invitation stage)';
      let userProgressToday;
      let userMadeZeroProgress = false;
      if (questContent.boss) {
        // NB Data rounding below is done in the same way as on the user's party page.
        questContentData += `<br>Boss name: ${questContent.boss.name()}`
          + `<br>Boss's starting HP: ${questContent.boss.hp}`
          + `<br>Boss's Strength: ${questContent.boss.str}`;
        let bossHasRage;
        if (questContent.boss.rage && questContent.boss.rage.value) {
          bossHasRage = true;
          questContentData += `<br>Boss's rage name for this quest: ${questContent.boss.rage.title()}`;
          questContentData += `<br>Boss's rage limit: ${questContent.boss.rage.value}`;
        }
        if (questIsActive) {
          if (!groupQuestData.progress || groupQuestData.progress.hp === undefined) {
            self.questErrors += 'ERROR: Party\'s quest is missing some or all of the "progress" data.<br>';
          } else {
            questProgress += `<br>Current Boss HP: ${Math.ceil(groupQuestData.progress.hp * 100) / 100}`;
          }
          if (bossHasRage) {
            questProgress += `<br>Current Rage: ${Math.floor(groupQuestData.progress.rage * 100) / 100}`;
          }
        }
        userProgressToday = `Player's pending damage to Boss: ${Math.floor(self.userPartyData.quest.progress.up * 10) / 10}`;
        if (!self.userPartyData.quest.progress.up) userMadeZeroProgress = true;
      } else {
        questContentData += '<br>Need to collect:<ul>';
        if (questIsActive) questProgress += '<br>Current found items: <ul>';
        for (const [key, obj] of Object.entries(questContent.collect)) {
          questContentData += `<li>${obj.text()}: ${obj.count} ("key": ${key})</li>`;
          if (questIsActive) {
            if (!groupQuestData.progress || !groupQuestData.progress.collect) {
              self.questErrors += 'ERROR: Party\'s quest is missing some or all of the "progress" data.<br>';
            } else if (groupQuestData.progress.collect[key] !== undefined) {
              questProgress += `<li>${obj.text()}: ${groupQuestData.progress.collect[key]}</li>`;
            } else {
              self.questErrors += `ERROR: Party's quest has no entry for "${key}" `
                + '("quest.progress.collect" needs to be fixed).<br>';
            }
          }
        }
        questContentData += '</ul>';
        if (questIsActive) questProgress += '</ul>';
        userProgressToday = `Player's pending collected items: ${self.userPartyData.quest.progress.collectedItems}`;
        if (!self.userPartyData.quest.progress.collectedItems) userMadeZeroProgress = true;
      }
      if (userMadeZeroProgress) userProgressToday += '<br>NB: Zero pending quest progress may be from an error in which the user\'s database document is missing the pending progress fields. That error can\'t be identified here because the API will apply default data. If the user claims to have made pending progress but none is showing for them, a database admin has to check that.';
      questStatus += `<p>${questContentData}</p>`
        + `<p>${questProgress}</p>`
        + `<p>${userProgressToday}</p>`;
      questStatus += `<p><strong>Raw Quest Data:</strong></p><pre>party: ${JSON.stringify(groupQuestData, null, '  ')}`
        + `\nuser: ${JSON.stringify(self.userPartyData.quest, null, '  ')}</pre>`;
    } else {
      self.questErrors += `ERROR: quest "key" ${groupQuestData.key} does not match a known quest.`;
    }
  }
  return questStatus;
}

function resetData (self) {
  self.questStatus = '';
  self.questErrors = '';
  self.errorsOrWarningsExist = false;
  self.expand = false;

  if (self.partyNotExistError) {
    self.errorsOrWarningsExist = true;
  } else {
    self.userIsPartyLeader = self.groupPartyData.leader === self.userId;
  }

  // check for quest errors even if party doesn't exist (user can have old quest data)
  self.questStatus = determineQuestStatus(self);
  if (self.questErrors) self.errorsOrWarningsExist = true;

  self.expand = self.errorsOrWarningsExist;
}

export default {
  props: {
    resetCounter: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    userHasParty: {
      type: Boolean,
      required: true,
    },
    partyNotExistError: {
      type: Boolean,
      required: true,
    },
    userPartyData: {
      type: Object,
      required: true,
    },
    groupPartyData: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      userIsPartyLeader: false,
      questStatus: '',
      questErrors: '',
      errorsOrWarningsExist: false,
      expand: false,
    };
  },
  watch: {
    resetCounter () {
      resetData(this);
    },
  },
  mounted () {
    resetData(this);
  },
};
</script>
