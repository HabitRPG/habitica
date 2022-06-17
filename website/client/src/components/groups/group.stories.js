import {
  collectionQuestLeaderParticipating,
  collectionQuestNotParticipating,
  createStory,
  groupBossQuestParticipating,
  groupBossQuestRage,
  groupCollectionQuest,
  groupCollectionQuestPending,
} from './group.stories.utils';

export default {
  title: 'Group Components|Party/Quest States',
};

export const NotAMember = () => createStory({
  template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true"
                       :is-leader="false" :is-member="false"
                       class="col-12"/>
      </div>
    `,
  data () {
    return {
      group: {
        leader: {},
        quest: {},
        purchased: {},
      },
    };
  },
  user: {
    data: {
      _id: 'some-user',
      party: {},
      preferences: {},
    },
  },
  challengeOptions: {},
});

NotAMember.story = {
  name: 'Not a Member',
};

export const MemberNoQuest = () => createStory({
  template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true"
                       :is-leader="false" :is-member="true"
                       class="col-12"/>
      </div>
    `,
  data () {
    return {
      group: {
        leader: {},
        quest: {},
        purchased: {},
      },
    };
  },
  user: {
    data: {
      _id: 'some-user',
      party: {},
      preferences: {},
    },
  },
  challengeOptions: {},
});

MemberNoQuest.story = {
  name: 'Member/No Quest',
};

export const LeaderNoQuest = () => createStory({
  template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true"
                       :is-leader="true" :is-member="true"
                       class="col-12"/>
      </div>
    `,
  data () {
    return {
      group: {
        description: 'Some text',
        leader: {},
        quest: {},
        purchased: {},
        privacy: 'private',
      },
    };
  },
  user: {
    data: {
      _id: 'some-user',
      party: {},
      preferences: {},
    },
  },
  challengeOptions: {},
});

LeaderNoQuest.story = {
  name: 'Leader/No Quest',
};

export const QuestOwnerQuestNotStarted = () => createStory({
  template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" :is-member="true" class="col-12"/>
      </div>
    `,
  data () {
    return {
      group: groupCollectionQuest(false),
    };
  },
  user: {
    data: {
      _id: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
      party: {},
      preferences: {},
    },
  },
  challengeOptions: {},
});

QuestOwnerQuestNotStarted.story = {
  name: 'Quest Owner/Quest Not Started',
};

export const MemberQuestAcceptedQuestNotStarted = () => createStory({
  template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" :is-member="true" class="col-12"/>
      </div>
    `,
  data () {
    return {
      group: groupCollectionQuest(false),
    };
  },
  user: {
    data: {
      _id: 'just-a-member',
      party: {},
      preferences: {},
    },
  },
  challengeOptions: {},
});

MemberQuestAcceptedQuestNotStarted.story = {
  name: 'Member/Quest accepted/Quest Not Started',
};

export const MemberQuestAcceptedStarted = () => createStory({
  template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" :is-member="true" class="col-12"/>
      </div>
    `,
  data () {
    return {
      group: groupCollectionQuest(true),
    };
  },
  user: {
    data: {
      _id: 'just-a-member',
      party: {},
      preferences: {},
    },
  },
  challengeOptions: {},
});

MemberQuestAcceptedStarted.story = {
  name: 'Member/Quest accepted/Started',
};

export const MemberQuestInvitePending = () => createStory({
  template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true"
                       :is-member="true"
                       class="col-12"/>
      </div>
    `,
  data () {
    return {
      group: groupCollectionQuestPending,
    };
  },
  user: {
    data: {
      _id: 'some-user',
      party: {
        quest: {
          RSVPNeeded: true,
        },
      },
      preferences: {},
    },
  },
  challengeOptions: {},
});

MemberQuestInvitePending.story = {
  name: 'Member/Quest Invite Pending',
};

export const CollectionQuestQuestOwnerParticipating = () => createStory({
  template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" :is-member="true" :is-leader="true" class="col-12"/>
      </div>
    `,
  data () {
    return {
      group: collectionQuestLeaderParticipating,
    };
  },
  user: {
    data: {
      _id: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
      party: {
        quest: {
          progress: {
            up: 0,
            down: 0,
            collectedItems: 2,
            collect: {},
          },
        },
      },
      preferences: {},
    },
  },
  challengeOptions: {},
});

CollectionQuestQuestOwnerParticipating.story = {
  name: 'Collection Quest/Quest Owner Participating',
};

export const CollectionQuestNotParticipating = () => createStory({
  template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" :is-member="true" class="col-12"/>
      </div>
    `,
  data () {
    return {
      group: collectionQuestNotParticipating,
    };
  },
  user: {
    data: {
      _id: 'not-the-leader',
      party: {
        quest: {
          progress: {
            up: 0,
            down: 0,
            collectedItems: 2,
            collect: {},
          },
        },
      },
      preferences: {},
    },
  },
  challengeOptions: {},
});

CollectionQuestNotParticipating.story = {
  name: 'Collection Quest/Not Participating',
};

export const BossQuestParticipating = () => createStory({
  template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" :is-member="true" class="col-12"/>
      </div>
    `,
  data () {
    return {
      group: groupBossQuestParticipating,
    };
  },
  user: {
    data: {
      _id: 'acc2950e-9919-49bc-be7f-0ec4103e9f2b',
      party: {
        quest: {
          progress: {
            up: 20,
            down: 0,
            collectedItems: 2,
            collect: {},
          },
        },
      },
      preferences: {},
    },
  },
  challengeOptions: {},
});

BossQuestParticipating.story = {
  name: 'Boss Quest/Participating',
};

export const BossQuestParticipatingNoPending = () => createStory({
  template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" :is-member="true" class="col-12"/>
      </div>
    `,
  data () {
    return {
      group: groupBossQuestParticipating,
    };
  },
  user: {
    data: {
      _id: 'acc2950e-9919-49bc-be7f-0ec4103e9f2b',
      party: {
        quest: {
          progress: {
            up: 0,
            down: 0,
            collectedItems: 2,
            collect: {},
          },
        },
      },
      preferences: {},
    },
  },
  challengeOptions: {},
});

BossQuestParticipatingNoPending.story = {
  name: 'Boss Quest/Participating - No Pending',
};

export const BossQuestRageEnabled = () => createStory({
  template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" :is-member="true" class="col-12"/>
      </div>
    `,
  data () {
    return {
      group: groupBossQuestRage,
    };
  },
  user: {
    data: {
      _id: 'acc2950e-9919-49bc-be7f-0ec4103e9f2b',
      party: {
        quest: {
          progress: {
            up: 20,
            down: 0,
            collectedItems: 2,
            collect: {},
          },
        },
      },
      preferences: {},
    },
  },
  challengeOptions: {},
});

BossQuestRageEnabled.story = {
  name: 'Boss Quest/Rage Enabled',
};

export const NotAParty = () => createStory({
  template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="false" :is-member="true" class="col-12"/>
      </div>
    `,
  data () {
    return {
      group: {
        quest: {},
        leader: {},
      },
    };
  },
  user: {
    data: {
      _id: 'some-user',
      party: {},
      preferences: {},
    },
  },
  challengeOptions: {},
});

NotAParty.story = {
  name: 'Not a party',
};
