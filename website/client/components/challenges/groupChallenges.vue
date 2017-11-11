<template lang="pug">
div
  challenge-modal(:groupId='groupId', v-on:createChallenge='challengeCreated')
  .row.no-quest-section(v-if='challenges.length === 0')
    .col-12.text-center
      .svg-icon.challenge-icon(v-html="icons.challengeIcon")
      h4(v-once) {{ $t('haveNoChallenges') }}
      p(v-once) {{ $t('challengeDetails') }}
  router-link.title(:to="{ name: 'challenge', params: { challengeId: challenge._id } }", v-for='challenge in challenges',:key='challenge._id')
    .col-12.challenge-item
      .row
        .col-9
          router-link.title(:to="{ name: 'challenge', params: { challengeId: challenge._id } }")
            strong(v-markdown='challenge.name')
          p(v-markdown='challenge.summary || challenge.name')
          div
            .svg-icon.member-icon(v-html="icons.memberIcon")
            .member-count {{challenge.memberCount}}
        .col-3
          div
            span.svg-icon.gem(v-html="icons.gemIcon")
            span.prize {{challenge.prize}}
          div.prize-title Prize
  .col-12.text-center
    button.btn.btn-secondary(@click='createChallenge()') {{ $t('createChallenge') }}
</template>

<style scoped>
  .title {
    color: #4E4A57;
  }

  .member-icon {
    display: inline-block;
    width: 20px !important;
    vertical-align: bottom;
    height: 16px !important;
  }

  .member-count {
    width: 21px;
    height: 16px;
    font-size: 14px;
    line-height: 2;
    color: #878190;
    display: inline-block;
    text-align: center;
  }

  .challenge-icon {
    height: 30px;
    width: 30px;
    margin-bottom: 2em;
    margin: 0 auto;
  }

  .gem {
    width: 26px;
    vertical-align: bottom;
    display: inline-block;
  }

  .prize {
    color: #686274;
    font-size: 18px;
    margin-left: .5em;
  }

  .prize-title {
    padding-left: .7em;
  }

  .challenge-item {
    border-radius: 2px;
    background-color: #ffffff;
    box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.16), 0 1px 4px 0 rgba(26, 24, 29, 0.12);
    margin-bottom: 1em;
    padding: 2em;
  }
</style>

<script>
import challengeModal from './challengeModal';
import { mapState } from 'client/libs/store';
import markdownDirective from 'client/directives/markdown';

import challengeIcon from 'assets/svg/challenge.svg';
import gemIcon from 'assets/svg/gem.svg';
import memberIcon from 'assets/svg/member-icon.svg';

export default {
  props: ['groupId'],
  components: {
    challengeModal,
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  data () {
    return {
      challenges: [],
      icons: Object.freeze({
        challengeIcon,
        memberIcon,
        gemIcon,
      }),
      groupIdForChallenges: '',
    };
  },
  directives: {
    markdown: markdownDirective,
  },
  mounted () {
    this.loadChallenges();
  },
  watch: {
    async groupId () {
      this.loadChallenges();
    },
  },
  methods: {
    async loadChallenges () {
      this.groupIdForChallenges = this.groupId;
      if (this.groupId === 'party' && this.user.party._id) this.groupIdForChallenges = this.user.party._id;
      this.challenges = await this.$store.dispatch('challenges:getGroupChallenges', {groupId: this.groupIdForChallenges});
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
