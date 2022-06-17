import MemberDetails from './memberDetails.vue';
import MemberDetailsNew from './memberDetailsNew.vue';
import { userStyles } from '../../config/storybook/mock.data';

export default {
  title: 'Member Details',
};

export const PartyHeaderOld = () => ({
  components: { MemberDetails },
  template: `
      <div style="position: absolute; margin: 20px">
        <member-details :member="user"></member-details>
      </div>
    `,
  data () {
    return {
      user: userStyles,
    };
  },
});

PartyHeaderOld.story = {
  name: 'party header (old)',
};

export const QuestParticipantsNew = () => ({
  components: { MemberDetailsNew },
  template: `
      <div style="position: absolute; margin: 20px">
        <member-details-new :member="user"></member-details-new>
      </div>
    `,
  data () {
    return {
      user: userStyles,
    };
  },
});

QuestParticipantsNew.story = {
  name: 'quest participants (new)',
};
