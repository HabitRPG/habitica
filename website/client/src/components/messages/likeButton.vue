<template>
  <div
    class="d-inline-flex like-button"
    @click="like()"
  >
    <div
      v-b-tooltip="{title: likeTooltip(likeCount)}"
      class="d-flex"
    >
      <div
        v-if="likeCount > 0"
        class="action d-flex align-items-center mr-0"
        :class="{isLiked: true, currentUserLiked: likedByCurrentUser}"
      >
        <div
          class="svg-icon mr-1"
          :title="$t('liked')"
          v-html="icons.liked"
        ></div>
        +{{ likeCount }}
      </div>
      <div
        v-if="likeCount === 0"
        class="action d-flex align-items-center mr-1"
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
  margin-right: 1em;

  .svg-icon {
    color: $gray-100;
    width: 16px;
  }

  &.isLiked {
    color: $purple-200;
    font-weight: bold;

    .svg-icon {
      color: $purple-300;
    }
  }
}

.like-button {
  color: $gray-100;
  font-size: 12px;

  &:hover {
    cursor: pointer;
    color: $purple-200;

    .svg-icon {
      color: $purple-300;
    }
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
