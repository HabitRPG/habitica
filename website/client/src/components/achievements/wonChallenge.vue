<template>
  <b-modal
    id="won-challenge"
    :title="$t('wonChallenge')"
    size="md"
    :hide-footer="true"
  >
    <div class="modal-body text-center">
      <h4 v-markdown="user.achievements.challenges[user.achievements.challenges.length - 1]"></h4>
      <div class="row">
        <div class="col-4">
          <div class="achievement-karaoke-2x"></div>
        </div>
        <div class="col-4">
          <!-- @TODO: +generatedAvatar({sleep: false})-->
          <avatar
            class="avatar"
            :member="user"
            :avatar-only="true"
          />
        </div>
        <div class="col-4">
          <div class="achievement-karaoke-2x"></div>
        </div>
      </div>
      <p>{{ $t('congratulations') }}</p>
      <br>
      <button
        class="btn btn-primary"
        @click="close()"
      >
        {{ $t('hurray') }}
      </button>
    </div>
    <div class="modal-footer">
      <div class="col-3">
        <a
          class="twitter-share-button"
          href="https://twitter.com/intent/tweet?text=#{tweet}&via=habitica&url=#{env.BASE_URL}/social/won-challenge&count=none"
        >{{ $t('tweet') }}</a>
      </div>
      <div
        class="col-4"
        style="margin-left:.8em"
      >
        <div
          class="fb-share-button"
          data-href="#{env.BASE_URL}/social/won-challenge"
          data-layout="button"
        ></div>
      </div>
      <div
        class="col-4"
        style="margin-left:.8em"
      >
        <a
          class="tumblr-share-button"
          data-href="#{env.BASE_URL}/social/won-challenge"
          data-notes="none"
        ></a>
      </div>
    </div>
  </b-modal>
</template>

<style scoped>
  .achievement-karaoke-2x {
    margin: 0 auto;
    margin-top: 6em;
  }

  .avatar {
    width: 140px;
    margin: 0 auto;
    margin-bottom: 1.5em;
    margin-top: 1.5em;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import markdownDirective from '@/directives/markdown';
import Avatar from '../avatar';

export default {
  components: {
    Avatar,
  },
  directives: {
    markdown: markdownDirective,
  },
  data () {
    const tweet = this.$t('wonChallengeShare');
    return {
      tweet,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'won-challenge');
    },
  },
};
</script>
