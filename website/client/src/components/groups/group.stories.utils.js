import rightSidebar from '@/components/groups/rightSidebar';
import getters from '@/store/getters';
import content from '../../../../common/script/content';

export function createStory ({
  template,
  data,
  user = null,
  challengeOptions = {},
}) {
  return {
    components: { rightSidebar },
    template,
    data,
    store: {
      getters,
      dispatch (id) {
        if (id === 'challenges:getGroupChallenges') {
          return [];
        }

        return null;
      },
      state: {
        content,
        user: {
          data: {
            party: {},
          },
          ...user,
        },
        challengeOptions,
      },
    },
  };
}

export const groupBossQuestParticipating = {
  leaderOnly: { challenges: false, getGems: false },
  quest: {
    progress: { collect: {}, hp: 30 },
    active: true,
    members: { 'acc2950e-9919-49bc-be7f-0ec4103e9f2b': true },
    extra: {},
    key: 'moon2',
    leader: 'acc2950e-9919-49bc-be7f-0ec4103e9f2b',
  },
  tasksOrder: {
    habits: [], dailys: [], todos: [], rewards: [],
  },
  purchased: {
    plan: {
      consecutive: {
        count: 0, offset: 0, gemCapExtra: 0, trinkets: 0,
      },
      quantity: 1,
      extraMonths: 0,
      gemsBought: 0,
      mysteryItems: [],
    },
  },
  privacy: 'private',
  chat: [],
  memberCount: 1,
  challengeCount: 0,
  balance: 0,
  _id: '6b125aa8-ef98-4307-b5b4-181091b747c9',
  type: 'party',
  name: 'Testings Party',
  managers: {},
  categories: [],
  leader: {
    auth: { local: { username: 'test' } },
    flags: { verifiedUsername: true },
    profile: { name: 'Testing' },
    _id: 'acc2950e-9919-49bc-be7f-0ec4103e9f2b',
    id: 'acc2950e-9919-49bc-be7f-0ec4103e9f2b',
  },
  summary: 'Testings Party',
  id: '6b125aa8-ef98-4307-b5b4-181091b747c9',
};

export const groupBossQuestRage = {
  leaderOnly: { challenges: false, getGems: false },
  quest: {
    progress: { collect: {}, hp: 30, rage: 20.33434535 },
    active: true,
    members: { 'acc2950e-9919-49bc-be7f-0ec4103e9f2b': true },
    extra: {},
    key: 'dilatoryDistress2',
    leader: 'acc2950e-9919-49bc-be7f-0ec4103e9f2b',
  },
  tasksOrder: {
    habits: [], dailys: [], todos: [], rewards: [],
  },
  purchased: {
    plan: {
      consecutive: {
        count: 0, offset: 0, gemCapExtra: 0, trinkets: 0,
      },
      quantity: 1,
      extraMonths: 0,
      gemsBought: 0,
      mysteryItems: [],
    },
  },
  privacy: 'private',
  chat: [],
  memberCount: 1,
  challengeCount: 0,
  balance: 0,
  _id: '6b125aa8-ef98-4307-b5b4-181091b747c9',
  type: 'party',
  name: 'Testings Party',
  managers: {},
  categories: [],
  leader: {
    auth: { local: { username: 'test' } },
    flags: { verifiedUsername: true },
    profile: { name: 'Testing' },
    _id: 'acc2950e-9919-49bc-be7f-0ec4103e9f2b',
    id: 'acc2950e-9919-49bc-be7f-0ec4103e9f2b',
  },
  summary: 'Testings Party',
  id: '6b125aa8-ef98-4307-b5b4-181091b747c9',
};

export function groupCollectionQuest (active) {
  return {
    leaderOnly: { challenges: false, getGems: false },
    quest: {
      progress: { collect: {} },
      active,
      members: {
        '05ca98f4-4706-47b5-8d02-142e6e78ba2e': true,
        'just-a-member': true,
        'b3b0be03-3f62-49ae-b776-b16419ef32cf': null,
      },
      extra: {},
      key: 'atom1',
      leader: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
    },
    tasksOrder: {
      habits: ['320496be-d663-4711-a7da-03205a2204b2'],
      dailys: ['0c6a3ecd-dbaf-4a34-bb61-1a2ecd3daa0e', '686e7766-9cef-4b77-8c8f-f4d6c5b63a85'],
      todos: ['76b3ef3e-1b01-4f24-a37e-0320f31d8132'],
      rewards: ['76dad8ea-0d95-47c3-ad9a-8e136ad80b7f'],
    },
    purchased: {
      active: true,
      plan: {
        consecutive: {
          count: 0, offset: 0, gemCapExtra: 0, trinkets: 0,
        },
        quantity: 3,
        extraMonths: 0,
        gemsBought: 0,
        mysteryItems: [],
        customerId: 'group-unlimited',
        dateCreated: null,
        dateTerminated: null,
        dateUpdated: null,
        owner: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
        paymentMethod: 'Group Unlimited',
        planId: 'group_monthly',
        subscriptionId: '',
      },
    },
    privacy: 'private',
    chat: [],
    memberCount: 3,
    challengeCount: 0,
    balance: 0,
    _id: '96ea599a-737b-47e2-ac17-8bd85b6ab62a',
    type: 'party',
    name: 'Party',
    managers: {},
    categories: [],
    leader: {
      auth: { local: { username: 'test2' } },
      flags: { verifiedUsername: true },
      profile: { name: 'MyDisplay2' },
      _id: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
      id: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
    },
    summary: 'Party',
    id: '96ea599a-737b-47e2-ac17-8bd85b6ab62a',
  };
}

export const groupCollectionQuestPending = {
  leaderOnly: { challenges: false, getGems: false },
  quest: {
    progress: { collect: {} },
    active: false,
    members: { '05ca98f4-4706-47b5-8d02-142e6e78ba2e': true, 'b3b0be03-3f62-49ae-b776-b16419ef32cf': null },
    extra: {},
    key: 'atom1',
    leader: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
  },
  tasksOrder: {
    habits: ['320496be-d663-4711-a7da-03205a2204b2'],
    dailys: ['0c6a3ecd-dbaf-4a34-bb61-1a2ecd3daa0e', '686e7766-9cef-4b77-8c8f-f4d6c5b63a85'],
    todos: ['76b3ef3e-1b01-4f24-a37e-0320f31d8132'],
    rewards: ['76dad8ea-0d95-47c3-ad9a-8e136ad80b7f'],
  },
  purchased: { active: true },
  privacy: 'private',
  chat: [],
  memberCount: 2,
  challengeCount: 0,
  balance: 0,
  _id: '96ea599a-737b-47e2-ac17-8bd85b6ab62a',
  type: 'party',
  name: "MyDisplay2's Party",
  managers: {},
  categories: [],
  leader: {
    auth: { local: { username: 'test2' } },
    flags: { verifiedUsername: true },
    profile: { name: 'MyDisplay2' },
    _id: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
    id: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
  },
  summary: "MyDisplay2's Party",
  id: '96ea599a-737b-47e2-ac17-8bd85b6ab62a',
};

export const collectionQuestLeaderParticipating = {
  leaderOnly: { challenges: false, getGems: false },
  quest: {
    progress: { collect: { fireCoral: 4, blueFins: 0 } },
    active: true,
    members: { '05ca98f4-4706-47b5-8d02-142e6e78ba2e': true },
    extra: {},
    key: 'dilatoryDistress1',
    leader: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
  },
  tasksOrder: {
    habits: ['320496be-d663-4711-a7da-03205a2204b2'],
    dailys: ['0c6a3ecd-dbaf-4a34-bb61-1a2ecd3daa0e', '686e7766-9cef-4b77-8c8f-f4d6c5b63a85'],
    todos: ['76b3ef3e-1b01-4f24-a37e-0320f31d8132'],
    rewards: ['76dad8ea-0d95-47c3-ad9a-8e136ad80b7f'],
  },
  purchased: {
    active: true,
    plan: {
      consecutive: {
        count: 0, offset: 0, gemCapExtra: 0, trinkets: 0,
      },
      quantity: 3,
      extraMonths: 0,
      gemsBought: 0,
      mysteryItems: [],
      customerId: 'group-unlimited',
      dateCreated: null,
      dateTerminated: null,
      dateUpdated: null,
      owner: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
      paymentMethod: 'Group Unlimited',
      planId: 'group_monthly',
      subscriptionId: '',
    },
  },
  privacy: 'private',
  chat: [],
  memberCount: 2,
  challengeCount: 0,
  balance: 0,
  _id: '96ea599a-737b-47e2-ac17-8bd85b6ab62a',
  type: 'party',
  name: "MyDisplay2's Party",
  managers: {},
  categories: [],
  leader: {
    auth: { local: { username: 'test2' } },
    flags: { verifiedUsername: true },
    profile: { name: 'MyDisplay2' },
    _id: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
    id: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
  },
  summary: "MyDisplay2's Party",
  id: '96ea599a-737b-47e2-ac17-8bd85b6ab62a',
};

export const collectionQuestNotParticipating = {
  leaderOnly: { challenges: false, getGems: false },
  quest: {
    progress: { collect: { fireCoral: 4, blueFins: 3 } },
    active: true,
    members: { },
    extra: {},
    key: 'dilatoryDistress1',
    leader: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
  },
  tasksOrder: {
    habits: ['320496be-d663-4711-a7da-03205a2204b2'],
    dailys: ['0c6a3ecd-dbaf-4a34-bb61-1a2ecd3daa0e', '686e7766-9cef-4b77-8c8f-f4d6c5b63a85'],
    todos: ['76b3ef3e-1b01-4f24-a37e-0320f31d8132'],
    rewards: ['76dad8ea-0d95-47c3-ad9a-8e136ad80b7f'],
  },
  purchased: {
    active: true,
    plan: {
      consecutive: {
        count: 0, offset: 0, gemCapExtra: 0, trinkets: 0,
      },
      quantity: 3,
      extraMonths: 0,
      gemsBought: 0,
      mysteryItems: [],
      customerId: 'group-unlimited',
      dateCreated: null,
      dateTerminated: null,
      dateUpdated: null,
      owner: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
      paymentMethod: 'Group Unlimited',
      planId: 'group_monthly',
      subscriptionId: '',
    },
  },
  privacy: 'private',
  chat: [],
  memberCount: 2,
  challengeCount: 0,
  balance: 0,
  _id: '96ea599a-737b-47e2-ac17-8bd85b6ab62a',
  type: 'party',
  name: "MyDisplay2's Party",
  managers: {},
  categories: [],
  leader: {
    auth: { local: { username: 'test2' } },
    flags: { verifiedUsername: true },
    profile: { name: 'MyDisplay2' },
    _id: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
    id: '05ca98f4-4706-47b5-8d02-142e6e78ba2e',
  },
  summary: "MyDisplay2's Party",
  id: '96ea599a-737b-47e2-ac17-8bd85b6ab62a',
};
