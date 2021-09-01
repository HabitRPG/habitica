<template>
  <b-modal
    id="mount-raised-modal"
    :hide-header="true"
  >
    <div
      v-if="mount != null"
      class="content"
    >
      <div class="dialog-header title">
        {{ $t('raisedPet', {pet: mount.text()}) }}
      </div>
      <div class="inner-content">
        <div class="pet-background">
          <div
            class="mount"
            :class="`Mount_Icon_${mount.key}`"
          ></div>
        </div>
        <h4 class="title">
          {{ mount.text() }}
        </h4>
        <button
          class="btn btn-primary onward"
          @click="close()"
        >
          {{ $t('onward') }}
        </button>
      </div>
    </div>
    <div
      slot="modal-footer"
      class="clearfix"
    ></div>
  </b-modal>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/mixins.scss';

  #mount-raised-modal {
    @include centeredModal();

    .modal-dialog {
      width: 330px;
    }

    .content {
      text-align: center;
    }

    .inner-content {
      margin: 24px auto auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .pet-background {
      width: 112px;
      height: 112px;
      border-radius: 4px;
      background-color: $gray-700;
    }

    .mount {
      margin: 0 auto;
    }

    .dialog-header {
      color: $purple-200;
    }

    .onward {
      margin-top: 1em;
      margin-bottom: 1em;
    }
  }
</style>

<script>
import markdownDirective from '@/directives/markdown';
import { mountInfo } from '@/../../common/script/content/stable';

export default {
  directives: {
    markdown: markdownDirective,
  },
  props: {
    hideText: {
      type: Boolean,
    },
  },
  data () {
    return {
      mount: null,
    };
  },
  mounted () {
    this.$root.$on('habitica::mount-raised', this.openDialog);
  },
  beforeDestroy () {
    this.$root.$off('habitica::mount-raised', this.openDialog);
  },
  methods: {
    openDialog (mountKey) {
      this.mount = mountInfo[mountKey];
      this.$root.$emit('bv::show::modal', 'mount-raised-modal');
    },
    close () {
      this.$root.$emit('bv::hide::modal', 'mount-raised-modal');
      this.mount = null;
    },
  },
};
</script>
