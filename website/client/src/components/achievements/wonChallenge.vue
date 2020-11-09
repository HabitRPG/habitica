<template>
  <b-modal
    id="won-challenge"
    :title="$t('wonChallenge')"
    size="md"
    :hide-footer="true"
  >
    <div
      v-if="notification"
      class="modal-body text-center"
    >
      <h4 v-markdown="notification.data.name"></h4>
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
      <p v-once>
        {{ $t('congratulations') }}
      </p>
      <br>
      <button
        v-once
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
      notification: null,
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.$root.$on('habitica:won-challenge', notification => {
      this.notification = notification;
      this.$root.$emit('bv::show::modal', 'won-challenge');
    });
  },
  beforeDestroy () {
    this.$root.$off('habitica:won-challenge');
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'won-challenge');
    },
  },
};
</script>
