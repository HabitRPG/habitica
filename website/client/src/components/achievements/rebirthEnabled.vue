<template>
  <b-modal
    id="rebirth-enabled"
    size="sm"
    :hide-header="true"
  >
    <close-icon @click="close()" />
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
        <Sprite
          class="orb-icon"
          image-name="rebirth_orb"
        />
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
    margin-bottom: 16px;
  }

  .icon-area {
    margin-bottom: 16px;
  }

  .sparkles {
    width: 40px;
    height: 64px;

    &.mirror {
      transform: scaleX(-1);
    }
  }

  .orb-icon {
    margin: 0 8px;

    ::v-deep img {
      width: 96px;
      height: 96px;
    }
  }

  .subtitle {
    font-size: 1rem;
    font-weight: bold;
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
import closeIcon from '@/components/shared/closeIcon';
import Sprite from '@/components/ui/sprite';
import starGroup from '@/assets/svg/star-group.svg?raw';
import { mapState } from '@/libs/store';

export default {
  components: {
    closeIcon,
    Sprite,
  },
  data () {
    return {
      icons: Object.freeze({
        starGroup,
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
