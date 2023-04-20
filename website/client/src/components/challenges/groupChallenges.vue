<template>
  <div>
    <challenge-modal
      :group-id="groupId"
      @createChallenge="challengeCreated"
    />
    <div
      v-if="challenges.length === 0"
      class="row no-challenge-section"
    >
      <div class="col-12 text-center">
        <div
          class="svg-icon challenge-icon color"
          v-html="icons.challengeIcon"
        ></div>
        <h4 v-once>
          {{ $t('haveNoChallenges') }}
        </h4>
        <p v-once>
          {{ $t('challengeDetails') }}
        </p>
        <button
          v-if="canCreateChallenges"
          class="btn btn-secondary"
          @click="createChallenge()"
        >
          {{ $t('createChallenge') }}
        </button>
      </div>
    </div>
    <template v-else>
      <challenge-item
        v-for="challenge in challenges"
        :key="challenge._id"
        :challenge="challenge"
        :full-layout="false"
      />
      <div class="col-12 text-center">
        <button
          v-if="canCreateChallenges"
          class="btn btn-secondary"
          @click="createChallenge()"
        >
          {{ $t('createChallenge') }}
        </button>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .no-challenge-section {
    padding: 2em;

    h4 {
      margin-bottom: 0;
    }

    p {
      margin-bottom: 1em;
      color: $gray-100;
      font-size: 0.75rem;
      line-height: 1.33;
    }

    .challenge-icon {
      width: 1.125rem;
      height: 1.25rem;
      margin: 0 auto 0.5em;
      object-fit: contain;
      border-radius: 2px;
      color: $gray-200;
    }
  }
</style>

<script>
import challengeModal from './challengeModal';
import { mapState } from '@/libs/store';
import markdownDirective from '@/directives/markdown';

import externalLinks from '../../mixins/externalLinks';

import challengeItem from './challengeItem';
import challengeIcon from '@/assets/svg/challenge.svg';

export default {
  components: {
    challengeModal,
    challengeItem,
  },
  directives: {
    markdown: markdownDirective,
  },
  mixins: [externalLinks],
  props: ['group'],
  data () {
    return {
      challenges: [],
      icons: Object.freeze({
        challengeIcon,
      }),
      groupIdForChallenges: '',
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    canCreateChallenges () {
      if (this.group.leaderOnly.challenges) {
        return this.group.leader._id === this.user._id;
      }
      return true;
    },
  },
  watch: {
    'group._id': function groupId () {
      this.loadChallenges();
    },
  },
  mounted () {
    this.loadChallenges();
    this.handleExternalLinks();
  },
  updated () {
    this.handleExternalLinks();
  },
  methods: {
    async loadChallenges () {
      this.groupIdForChallenges = this.group._id;
      if (this.group._id === 'party' && this.user.party._id) this.groupIdForChallenges = this.user.party._id;
      this.challenges = await this.$store.dispatch('challenges:getGroupChallenges', { groupId: this.groupIdForChallenges });
    },
    createChallenge () {
      this.$root.$emit('habitica:create-challenge');
    },
    challengeCreated (challenge) {
      if (challenge.group._id !== this.groupIdForChallenges) return;
      this.challenges.push(challenge);
    },
  },
};
</script>
