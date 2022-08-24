<template>
  <b-modal
    id="group-plans-update"
    title="New Shared Task Board"
    size="lg"
    hide-footer="hide-footer"
    :no-close-on-backdrop="true"
    :no-close-on-esc="true"
    :centered="true"
  >
    <div
      slot="modal-header"
      class="w-100 d-flex pt-2 justify-content-center"
    >
      <h2
        class="mx-auto mt-4"
        v-once
      >
        {{ $t('newGroupsWelcome') }}
      </h2>
      <div
        class="svg-icon color close-x ml-auto my-auto"
        aria-hidden="true"
        tabindex="0"
        @click="close()"
        @keypress.enter="close()"
        v-html="icons.close"
      ></div>
      <img
        class="task-columns"
        src="~@/assets/images/group-plans/task-columns.png"
        srcset="~@/assets/images/group-plans/task-columns@2x.png 2x,
          ~@/assets/images/group-plans/task-columns@3x.png 3x"
      >
    </div>
    <div
      class="d-flex flex-column justify-content-center p-4"
    >
      <div class="d-flex align-items-center justify-content-center mb-3">
        <div
          class="svg-icon sparkles my-auto mr-3"
          v-html="icons.sparkles"
        >
        </div>
        <h3
          class="my-auto"
          v-once
        >
          {{ $t('newGroupsWhatsNew') }}
        </h3>
        <div
          class="svg-icon sparkles my-auto ml-3 flip-x"
          v-html="icons.sparkles"
        >
        </div>
      </div>
      <ul
        class="mb-4 px-4"
      >
        <li>{{ $t('newGroupsBullet01') }}</li>
        <li>{{ $t('newGroupsBullet02') }}</li>
        <li>{{ $t('newGroupsBullet03') }}</li>
        <li>{{ $t('newGroupsBullet04') }}</li>
        <li>{{ $t('newGroupsBullet05') }}</li>
        <li>{{ $t('newGroupsBullet06') }}</li>
        <li>{{ $t('newGroupsBullet07') }}</li>
        <li>{{ $t('newGroupsBullet08') }}</li>
        <li>{{ $t('newGroupsBullet09') }}</li>
        <li>{{ $t('newGroupsBullet10') }}
          <ul class="p-0">
            <li v-html="$t('newGroupsBullet10a')"></li>
            <li v-html="$t('newGroupsBullet10b')"></li>
            <li v-html="$t('newGroupsBullet10c')"></li>
          </ul>
        </li>
      </ul>
      <div
        class="mx-auto"
        v-html="$t('newGroupsVisitFAQ')"
      ></div>
      <div
        class="mx-auto"
      >
        {{ $t('newGroupsEnjoy') }}
      </div>
    <button
      class="btn btn-primary mt-4 mb-1 mx-auto"
      @click="close()"
      @keypress.enter="close()"
    >
      {{ $t('getStarted') }}
    </button>
    </div>
  </b-modal>
</template>

<style lang="scss">
  @import '~@/assets/scss/colors.scss';
  #group-plans-update {
    .modal-content {
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      border: none;
      box-shadow: 0 14px 28px 0 rgba($black, 0.24), 0 10px 10px 0 rgba($black, 0.28);
    }

    .modal-dialog {
      max-width: 566px;
      margin-top: 0px;
    }

    .modal-header {
      background-image: linear-gradient(64deg, $purple-200, $purple-300 55%);
      height: 136px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    .modal-header, .modal-body, .modal-footer {
      padding: 0px;
      border: none;
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  h2 {
    color: $white;
    line-height: 28px;
  }

  li {
    padding-left: 0.75rem;
  }

  ul {
    line-height: 24px;
    list-style-type: square;
    li ul {
      list-style-type: none;
      li::before {
        margin-right: 1rem;
        font-size: 16px;
        content: '▫';
      }
    }
  }

  .btn-primary {
    width: max-content;
  }

  .close-x {
    color: $purple-400;
    height: 16px;
    width: 16px;
    position: absolute;
    opacity: 0.75;
    cursor: pointer;
    right: 18px;
    top: 18px;

    &:hover, &:focus {
      opacity: 1;
    }
  }

  .sparkles {
    width: 32px;
    height: 17px;

    &.flip-x {
      transform: scaleX(-1);
    }
  }

  .task-columns {
    position: absolute;
    top: 84px;
  }
</style>

<script>
import closeIcon from '@/assets/svg/close.svg';
import sparkles from '@/assets/svg/sparkles-left.svg';

export default {
  data () {
    return {
      icons: Object.freeze({
        close: closeIcon,
        sparkles,
      }),
    };
  },
  methods: {
    close () {
      this.$store.dispatch('user:set', { 'flags.tour.groupPlans': -2 });
      this.$root.$emit('bv::hide::modal', 'group-plans-update');
    },
  },
};
</script>
