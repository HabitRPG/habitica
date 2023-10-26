<template>
  <div
    class="d-flex"
  >
    <div
      v-b-tooltip="{title: likeTooltip(likeCount)}"
      class="d-flex"
    >
      <div
        v-if="likeCount > 0"
        class="action d-flex align-items-center mr-2"
        :class="{isLiked: true, currentUserLiked: likedByCurrentUser}"
        @click="like()"
      >
        <div
          class="svg-icon"
          :title="$t('liked')"
          v-html="icons.liked"
        ></div>
        +{{ likeCount }}
      </div>
      <div
        v-if="likeCount === 0"
        class="action d-flex align-items-center mr-1"
        @click="like()"
      >
        <div
          class="svg-icon"
          :title="$t('like')"
          v-html="icons.like"
        ></div>
      </div>
    </div>
    <span v-if="likeCount === 0">{{ $t('like') }}</span>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/tiers.scss';

.action {
  display: inline-block;
  color: $gray-200;
  margin-right: 1em;
  font-size: 12px;

  :hover {
    cursor: pointer;
  }

  .svg-icon {
    color: $gray-300;
    margin-right: .2em;
    width: 16px;
  }
}

.activeLike {
  color: $purple-300;

  .svg-icon {
    color: $purple-400;
  }
}

</style>

<script>
import likeIcon from '@/assets/svg/like.svg';
import likedIcon from '@/assets/svg/liked.svg';


export default {
  props: {
    likeCount: {
      type: Number,
    },
    likedByCurrentUser: {
      type: Boolean,
    },
  },
  data () {
    return {
      icons: Object.freeze({
        like: likeIcon,
        liked: likedIcon,
      }),
    };
  },

  methods: {
    async like () {
      this.$emit('toggle-like');
    },
    likeTooltip (likedStatus) {
      if (!likedStatus) return this.$t('like');
      return null;
    },

  },
};
</script>
