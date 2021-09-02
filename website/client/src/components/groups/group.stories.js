/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import {
  collectionQuestLeaderParticipating,
  collectionQuestNotParticipating,
  createStory,
  groupBossQuestParticipating,
  groupBossQuestRage,
  groupCollectionQuest,
  groupCollectionQuestPending,
} from './group.stories.utils';

storiesOf('Group Components|Party/Quest States', module)
  .add('Not a Member', () => createStory({
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
          leader: {

          },
          quest: {
          },
          purchased: {
          },
        },
      };
    },
    user: {
      data: {
        _id: 'some-user',
        party: {

        },
        preferences: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Member/No Quest', () => createStory({
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
          leader: {

          },
          quest: {
          },
          purchased: {
          },
        },
      };
    },
    user: {
      data: {
        _id: 'some-user',
        party: {

        },
        preferences: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Leader/No Quest', () => createStory({
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
          leader: {

          },
          quest: {
          },
          purchased: {
          },
          privacy: 'private',
        },
      };
    },
    user: {
      data: {
        _id: 'some-user',
        party: {

        },
        preferences: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Quest Owner/Quest Not Started', () => createStory({
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
        party: {

        },
        preferences: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Member/Quest accepted/Quest Not Started', () => createStory({
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
        party: {

        },
        preferences: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Member/Quest accepted/Started', () => createStory({
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
        party: {

        },
        preferences: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Member/Quest Invite Pending', () => createStory({
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
        preferences: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Collection Quest/Quest Owner Participating', () => createStory({
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
        preferences: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Collection Quest/Not Participating', () => createStory({
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
        preferences: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Boss Quest/Participating', () => createStory({
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
        preferences: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Boss Quest/Participating - No Pending', () => createStory({
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
        preferences: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Boss Quest/Rage Enabled', () => createStory({
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
        preferences: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Not a party', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="false" :is-member="true" class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: {
          quest: {},
          leader: {

          },
        },
      };
    },
    user: {
      data: {
        _id: 'some-user',
        party: {

        },
        preferences: {

        },
      },
    },
    challengeOptions: {},
  }));
