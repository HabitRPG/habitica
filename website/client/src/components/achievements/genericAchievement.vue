<template>
  <b-modal
    id="generic-achievement"
    :title="data.message"
    size="md"
    :hide-header="true"
  >
    <span
      class="close-icon svg-icon inline icon-10"
      @click="close()"
      v-html="icons.close"
    ></span>
    <div class="content">
      <div
        v-once
        class="dialog-header title"
      >
        {{ $t('earnedAchievement') }}
      </div>
      <div class="inner-content">
        <div class="achievement-background d-flex align-items-center">
          <div
            class="icon"
            :class="achievementClass"
          ></div>
        </div>
        <h4
          class="title"
          v-html="$t(achievement.titleKey)"
        >
        </h4>
        <button
          class="btn btn-primary"
          @click="close()"
        >
          {{ $t('huzzah') }}
        </button>
      </div>
    </div>
    <div
      slot="modal-footer"
      class="clearfix"
    ></div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/mixins.scss';

  #generic-achievement {
    @include centeredModal();

    .modal-dialog {
      width: 330px;
    }

    .modal-footer {
      padding-top: 0px;
    }
  }
</style>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  .content {
    text-align: center;
  }

  .inner-content {
    margin: 24px auto auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .achievement-background {
    width: 112px;
    height: 112px;
    border-radius: 4px;
    background-color: $gray-700;
  }

  .dialog-header {
    margin-top: 16px !important;
    color: $purple-200 !important;
  }

  .title {
    margin-bottom: 24px !important;
  }

  .icon {
    margin: 0 auto;
  }
</style>

<script>
import { mapState } from '@/libs/store';
import achievements from '@/../../common/script/content/achievements';
import svgClose from '@/assets/svg/close.svg';

export default {
  props: ['data'],
  data () {
    return {
      icons: Object.freeze({
        close: svgClose,
      }),
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
    achievement () {
      return achievements[this.data.achievement];
    },
    achievementClass () {
      return `${this.achievement.icon}2x`;
    },
  },
  methods: {
    close () {
      this.$root.$emit('bv::hide::modal', 'generic-achievement');
    },
  },
};
</script>
