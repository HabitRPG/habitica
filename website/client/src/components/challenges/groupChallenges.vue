<template lang="pug">
div
  challenge-modal(:groupId='groupId', v-on:createChallenge='challengeCreated')
  .row.no-quest-section(v-if='challenges.length === 0')
    .col-12.text-center
      .svg-icon.challenge-icon(v-html="icons.challengeIcon")
      h4(v-once) {{ $t('haveNoChallenges') }}
      p(v-once) {{ $t('challengeDetails') }}
      button.btn.btn-secondary(@click='createChallenge()') {{ $t('createChallenge') }}
  template(v-else)
    challenge-item(v-for='challenge in challenges',:challenge='challenge',:key='challenge._id',:fullLayout='false')
    .col-12.text-center
      button.btn.btn-secondary(@click='createChallenge()') {{ $t('createChallenge') }}
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .no-quest-section {
    padding: 2em;
    color: $gray-300;

    h4 {
      color: $gray-300;
    }

    p {
      margin-bottom: 2em;
    }

    .svg-icon {
      height: 30px;
      width: 30px;
      margin: 0 auto;
      margin-bottom: 2em;
    }
  }
</style>

<script>
import challengeModal from './challengeModal';
import { mapState } from '@/libs/store';
import markdownDirective from '@/directives/markdown';

import challengeItem from './challengeItem';
import challengeIcon from '@/assets/svg/challenge.svg';

export default {
  components: {
    challengeModal,
    challengeItem,
  },
  props: ['groupId'],
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  data () {
    return {
      challenges: [],
      icons: Object.freeze({
        challengeIcon,
      }),
      groupIdForChallenges: '',
    };
  },
  directives: {
    markdown: markdownDirective,
  },
  watch: {
    async groupId () {
      this.loadChallenges();
    },
  },
  mounted () {
    this.loadChallenges();
  },
  methods: {
    async loadChallenges () {
      this.groupIdForChallenges = this.groupId;
      if (this.groupId === 'party' && this.user.party._id) this.groupIdForChallenges = this.user.party._id;
      this.challenges = await this.$store.dispatch('challenges:getGroupChallenges', { groupId: this.groupIdForChallenges });
    },
    createChallenge () {
      this.$root.$emit('bv::show::modal', 'challenge-modal');
    },
    challengeCreated (challenge) {
      if (challenge.group._id !== this.groupIdForChallenges) return;
      this.challenges.push(challenge);
    },
  },
};
</script>
