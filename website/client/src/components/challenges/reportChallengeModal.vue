<template>
  <b-modal
    id="report-challenge"
    :title="$t('abuseFlagModalHeading')"
    size="lg"
    :hide-footer="true"
  >
    <div class="modal-body">
      <h4>{{ challenge.name }}</h4>
      <blockquote>
        <div>
          {{ challenge.summary }}
        </div>
      </blockquote>
      <p
        v-html="$t('abuseFlagModalBodyChallenge', abuseFlagModalBody)"
      ></p>
    </div>
    <div class="modal-footer">
      <button
        v-if="user.contributor.admin"
        class="pull-left btn btn-danger"
        @click="clearFlagCount()"
      >
        {{ $t("resetFlagCount") }}
      </button>
      <button
        class="btn btn-primary"
        @click="close()"
      >
        {{ $t("cancel") }}
      </button>
      <button
        class="btn btn-danger"
        @click="reportAbuse()"
      >
        {{ $t("abuseFlagModalButton") }}
      </button>
    </div>

  </b-modal>
</template>

<script>
import { mapState } from '@/libs/store';
import notifications from '@/mixins/notifications';

export default {
  mixins: [notifications],
  computed: {
    ...mapState({ user: 'user.data' }),
    userIsAdmin () {
      return this.user.contributor.admin;
    },
  },
  data () {
    const abuseFlagModalBody = {
      firstLinkStart: '<a href="/static/community-guidelines" target="_blank">',
      secondLinkStart: '<a href="/static/terms" target="_blank">',
      linkEnd: '</a>',
    };
    return {
      abuseFlagModalBody,
      challenge: {},
    };
  },
  created () {
    this.$root.$on('habitica::report-challenge', data => {
      this.challenge = data.challenge;
      this.$root.$emit('bv::show::modal', 'report-challenge');
    });
  },
  destroyed () {
    this.$root.$off('habitica::report-challenge');
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'report-challenge');
    },
    async reportAbuse () {
      this.text(this.$t('abuseReported'));

      await this.$store.dispatch('challenges:flag', {
        challengeId: this.challenge._id,
      });
      this.close();
    },
    async clearFlagCount () {
      await this.$store.dispatch('challenges:clearFlagCount', {
        challengeId: this.challenge._id,
      });
      this.close();
    },
  },
};
</script>
