<template lang="pug">
  b-modal#testing(:title="$t('guildReminderTitle')", size='lg', :hide-footer="true")
    .modal-content(style='min-width:28em')
      .modal-body.text-center
        h3(style='margin-bottom: 0') {{ $t('wonChallenge') }}
        h4(v-markdown='user.achievements.challenges[user.achievements.challenges.length - 1]')
        .container-fluid
          .row(style='margin-bottom:1em')
            .col-xs-4(style='padding:0')
              .container-fluid
                .row
                  .col-xs-4(style='padding:0')
                  .col-xs-4(style='padding:0')
                    .achievement-karaoke-2x(style='margin-top: 2em')
            .col-xs-4(style='padding:0')
              .herobox(style='padding:0; width:0; height:7em')
                .character-sprites(style='width:0')
                  // @TODO: +generatedAvatar({sleep: false})
            .col-xs-4(style='padding:0')
              .container-fluid
                .row
                  .col-xs-4(style='padding:0')
                  .col-xs-4(style='padding:0')
                    .achievement-karaoke-2x(style='margin-top: 2em')
        p {{ $t('congratulations') }}
        br
        button.btn.btn-primary(@click='close()') {{ $t('hurray') }}
      .modal-footer(style='margin-top:0', ng-init='loadWidgets()')
        .container-fluid
          .row
            .col-xs-3
              a.twitter-share-button(href='https://twitter.com/intent/tweet?text=#{tweet}&via=habitica&url=#{env.BASE_URL}/social/won-challenge&count=none') {{ $t('tweet') }}
            .col-xs-4(style='margin-left:.8em')
              .fb-share-button(data-href='#{env.BASE_URL}/social/won-challenge', data-layout='button')
            .col-xs-4(style='margin-left:.8em')
              a.tumblr-share-button(data-href='#{env.BASE_URL}/social/won-challenge', data-notes='none')
</template>

<style scope>
  .dont-despair, .death-penalty {
    margin-top: 1.5em;
  }
</style>

<script>
import { mapState } from 'client/libs/store';
import bModal from 'bootstrap-vue/lib/components/modal';
import markdownDirective from 'client/directives/markdown';

export default {
  components: {
    bModal,
  },
  directives: {
    markdown: markdownDirective,
  },
  computed: {
    ...mapState({user: 'user.data'}),
  },
  data () {
    let tweet = this.$t('wonChallengeShare');
    return {
      tweet,
    };
  },
  methods: {
    close () {
      this.$root.$emit('hide::modal', 'testing');
    },
  },
};
</script>
