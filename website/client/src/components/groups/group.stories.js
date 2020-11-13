/* eslint-disable import/no-extraneous-dependencies */
import { storiesOf } from '@storybook/vue';
import {
  createStory,
  groupBossQuestParticipating,
  groupCollectionQuestNotStarted,
} from '@/components/groups/group.stories.utils';

storiesOf('Group Components|Party/Quest States', module)
  .add('Leader & Member/No Quest', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true"
                       class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: {
          quest: {},
        },
      };
    },
    user: {
      data: {
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Quest Owner/Quest Not Started', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: groupCollectionQuestNotStarted,
      };
    },
    user: {
      data: {
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Member/Quest Invite Pending', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: {
          quest: {},
        },
      };
    },
    user: {
      data: {
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Collection Quest/Quest Owner Participating', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: {
          quest: {},
        },
      };
    },
    user: {
      data: {
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Collection Quest/Not Participating', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: {
          quest: {},
        },
      };
    },
    user: {
      data: {
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Boss Quest/Participating', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: groupBossQuestParticipating,
      };
    },
    user: {
      data: {
        party: {

        },
      },
    },
    challengeOptions: {},
  }))
  .add('Boss Quest/Rage Enabled', () => createStory({
    template: `
      <div class="component-showcase">
        <right-sidebar :group="group" :is-party="true" class="col-12"/>
      </div>
    `,
    data () {
      return {
        group: {
          quest: {},
        },
      };
    },
    user: {
      data: {
        party: {

        },
      },
    },
    challengeOptions: {},
  }));
