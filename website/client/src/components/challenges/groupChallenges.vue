<template>
  <div>
    <challenge-modal
      :group-id="groupId"
      @createChallenge="challengeCreated"
    />
    <div
      v-if="challenges.length === 0"
      class="row no-quest-section"
    >
      <div class="col-12 text-center">
        <div
          class="svg-icon challenge-icon"
          v-html="icons.challengeIcon"
        ></div>
        <h4 v-once>
          {{ $t('haveNoChallenges') }}
        </h4>
        <p v-once>
          {{ $t('challengeDetails') }}
        </p>
        <button
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
  directives: {
    markdown: markdownDirective,
  },
  props: ['groupId'],
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
