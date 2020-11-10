<template>
  <b-modal
    id="won-challenge"
    :title="$t('wonChallenge')"
    size="sm"
    :hide-header="true"
  >
    <close-icon @click="close()" />
    <div
      class="text-center"
    >
      <h1
        v-once
        class="header purple"
      >
        {{ $t('wonChallenge') }}
      </h1>
      <div class="d-flex align-items-center justify-content-center mb-4">
        <div
          v-once
          class="svg-icon sparkles sparkles-rotate"
          v-html="icons.sparkles"
        ></div>
        <div class="achievement-karaoke-2x"></div>
        <div
          v-once
          class="svg-icon sparkles"
          v-html="icons.sparkles"
        ></div>
      </div>
      <p
        class="mb-4 chal-desc"
        v-html="$t('wonChallengeDesc', {challengeName: challengeName})"
      >
      </p>
    </div>
    <div
      v-if="notification"
      slot="modal-footer"
      class="pt-3 w-100"
    >
      <div class="d-flex align-items-center justify-content-center mb-3">
        <div
          v-once
          class="svg-icon stars"
          v-html="icons.stars"
        ></div>
        <strong v-once>{{ $t('yourReward') }}</strong>
        <div
          v-once
          class="svg-icon stars stars-rotate"
          v-html="icons.stars"
        ></div>
      </div>

      <div class="d-flex align-items-center justify-content-center mb-4">
        <div
          v-once
          class="svg-icon gem mr-1"
          v-html="icons.gem"
        ></div>
        <strong>{{ notification.data.prize }}</strong>
      </div>
      <button
        v-once
        class="btn btn-primary"
        @click="close()"
      >
        {{ $t('onwards') }}
      </button>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';

  #won-challenge {
    .modal-body {
      padding: 0 1.5rem;
    }

    .modal-footer {
      background: $gray-700;
      border-top: none;
      padding: 0 1.5rem 2rem 1.5rem;
    }

    .modal-dialog {
      width: 20.625rem;
      font-size: 0.875rem;
      line-height: 1.71;
      text-align: center;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .purple {
    color: $purple-300;
  }

  .header {
    font-size: 1.25rem;
    line-height: 1.4;
    text-align: center;
    margin-top: 2rem;
  }

  .sparkles {
    width: 2.5rem;
    height: 4rem;
    margin-left: 2rem;

    &.sparkles-rotate {
      transform: rotate(180deg);
      margin-right: 2rem;
      margin-left: 0rem;
    }
  }

  .stars {
    width: 2rem;
    height: 1.063rem;
    margin-right: 1.25rem;

    &.stars-rotate {
      transform: rotate(180deg);
      margin-left: 1.25rem;
      margin-right: 0rem;
    }
  }

  .gem {
    width: 1.5rem;
    height: 1.5rem;
  }

  .chal-desc ::v-deep p {
    display: inline;
  }
</style>

<script>
import habiticaMarkdown from 'habitica-markdown';
import closeIcon from '@/components/shared/closeIcon';
import sparkles from '@/assets/svg/star-group.svg';
import gem from '@/assets/svg/gem.svg';
import stars from '@/assets/svg/sparkles-left.svg';
import { mapState } from '@/libs/store';

export default {
  components: {
    closeIcon,
  },
  data () {
    // const tweet = this.$t('wonChallengeShare');
    return {
      // tweet,
      notification: null,
      icons: Object.freeze({
        sparkles,
        gem,
        stars,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    challengeName () {
      if (!this.notification) return null;
      return habiticaMarkdown.render(String(this.notification.data.name));
    },
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
