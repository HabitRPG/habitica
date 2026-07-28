<template>
  <b-modal
    id="rebirth-enabled"
    size="sm"
    :hide-header="true"
  >
    <div
      class="close-x"
      @click.stop="close()"
    >
      <div
        class="svg-icon svg-close"
        v-html="icons.close"
      ></div>
    </div>
    <div class="content text-center">
      <h2
        v-once
        class="header"
      >
        {{ $t('rebirthUnlockedNewItem') }}
      </h2>
      <div class="d-flex align-items-center justify-content-center icon-area">
        <div
          v-once
          class="svg-icon sparkles mirror"
          v-html="icons.starGroup"
        ></div>
        <img
          class="orb-icon"
          src="@/assets/images/rebirth-orb.png"
          alt="Orb of Rebirth"
        >
        <div
          v-once
          class="svg-icon sparkles"
          v-html="icons.starGroup"
        ></div>
      </div>
      <p
        v-once
        class="subtitle"
      >
        {{ $t('rebirthUnlockedOrb') }}
      </p>
      <p
        v-once
        class="description"
      >
        {{ $t('rebirthUnlockedDesc') }}
      </p>
      <button
        v-once
        class="btn btn-primary"
        @click="close()"
      >
        {{ $t('onwards') }}
      </button>
    </div>
    <div
      slot="modal-footer"
      class="clearfix"
    ></div>
  </b-modal>
</template>

<style lang="scss">
  @import '@/assets/scss/colors.scss';

  #rebirth-enabled {
    .modal-dialog {
      width: 330px;
    }

    .modal-content {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 14px 28px 0 rgba($black, 0.24), 0 10px 10px 0 rgba($black, 0.28);
    }

    .modal-body {
      padding: 0;
    }

    .modal-footer {
      padding: 0;
      border-top: none;
    }
  }
</style>

<style lang="scss" scoped>
  @import '@/assets/scss/colors.scss';

  .content {
    padding: 24px 24px 0;
  }

  .header {
    font-size: 1.25rem;
    line-height: 1.4;
    color: $purple-200;
    margin-top: 8px;
    margin-bottom: 12px;
  }

  .icon-area {
    margin-bottom: 12px;
  }

  .sparkles {
    width: 40px;
    height: 64px;

    &.mirror {
      transform: scaleX(-1);
    }
  }

  .close-x {
    position: absolute;
    right: 16px;
    top: 16px;
    cursor: pointer;
    z-index: 2;

    &:hover .svg-close {
      opacity: 0.75;
    }

    .svg-close {
      width: 16px;
      height: 16px;
      opacity: 0.5;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }
  }

  .orb-icon {
    width: 62px;
    height: 62px;
    margin: 0 24px;
    image-rendering: pixelated;
  }

  .subtitle {
    font-family: 'Roboto', sans-serif;
    font-weight: 700;
    font-style: normal;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0;
    margin-bottom: 12px;
    color: $gray-50;
  }

  .description {
    font-size: 0.875rem;
    line-height: 1.71;
    margin-bottom: 24px;
    color: $gray-100;
  }

  .btn-primary {
    margin-bottom: 24px;
  }
</style>

<script>
import closeIcon from '@/assets/svg/close.svg?raw';
import starGroup from '@/assets/svg/star-group.svg?raw';
import { mapState } from '@/libs/store';

export default {
  data () {
    return {
      icons: Object.freeze({
        starGroup,
        close: closeIcon,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'rebirth-enabled');
    },
  },
};
</script>
