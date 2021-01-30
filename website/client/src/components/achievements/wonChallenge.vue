<template>
  <small-modal
    id="won-challenge"
    :title="$t('wonChallenge')"
    has-rewards
  >
    <starred>
      <div class="achievement-karaoke-2x"></div>
    </starred>

    <div class="text" v-html="$t('wonChallengeDesc', { challengeName })"></div>

    <template #greyed>
      <your-rewards />
      <div class="w-100">
        <div class="d-flex align-items-center justify-content-center">
          <div
            v-once
            class="svg-icon gem mr-1"
            v-html="icons.gem"
          ></div>
          <strong>{{ challengePrize }}</strong>
        </div>
      </div>
    </template>
  </small-modal>
</template>

<style lang="scss" scoped>
  .gem {
    width: 1.5rem;
    height: 1.5rem;
  }

  .text::v-deep p {
    display: inline;
  }
</style>

<script>
import habiticaMarkdown from 'habitica-markdown';

import gem from '@/assets/svg/gem.svg';

import smallModal from '@/components/ui/modal/smallModal';
import starred from '@/components/ui/modal/starred';
import yourRewards from '@/components/ui/modal/your-rewards';

export default {
  components: {
    smallModal,
    starred,
    yourRewards,
  },
  data () {
    // const tweet = this.$t('wonChallengeShare');
    return {
      // tweet,
      notification: null,
      icons: Object.freeze({ gem }),
    };
  },
  computed: {
    challengeName () {
      return this.notification
        ? habiticaMarkdown.render(String(this.notification.data.name)) : null;
    },
    challengePrize () {
      return this.notification ? this.notification.data.prize : 0;
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
};
</script>
