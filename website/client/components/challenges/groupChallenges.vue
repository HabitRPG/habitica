<template lang="pug">
div
  .row.no-quest-section(v-if='challenges.length === 0')
    .col-12.text-center
      .svg-icon.challenge-icon(v-html="icons.challengeIcon")
      h4(v-once) {{ $t('haveNoChallenges') }}
      p(v-once) {{ $t('challengeDescription') }}
      button.btn.btn-secondary(v-once) {{ $t('createChallenge') }}
  .col-12.challenge-item(v-for='challenge in challenges')
    .row
      .col-9
        router-link.title(:to="{ name: 'challenge', params: { challengeId: challenge._id } }")
          strong {{challenge.name}}
        p {{challenge.description}}
        div
          .svg-icon.member-icon(v-html="icons.memberIcon")
          .member-count {{challenge.memberCount}}
      .col-3
        div
          span.svg-icon.gem(v-html="icons.gemIcon")
          span.prize {{challenge.prize}}
        div.prize-title Prize
</template>

<style>
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
import gemIcon from 'assets/svg/gem.svg';
import memberIcon from 'assets/svg/member-icon.svg';
import challengeIcon from 'assets/svg/challenge.svg';

export default {
  props: ['groupId'],
  async mounted () {
    this.challenges = await this.$store.dispatch('challenges:getGroupChallenges', {groupId: this.groupId});
  },
  data () {
    return {
      challenges: [],
      icons: Object.freeze({
        challengeIcon,
        memberIcon,
        gemIcon,
      }),
    };
  },
};
</script>
