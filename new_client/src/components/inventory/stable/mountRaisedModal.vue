<template lang="pug">
b-modal#mount-raised-modal(:hide-header="true")
  div.content(v-if="mount != null")
    div.dialog-header.title {{ $t('raisedPet', {pet: mount.text()}) }}
    div.inner-content
      div.pet-background
        .mount(:class="`Mount_Icon_${mount.key}`")
      h4.title {{ mount.text() }}
      button.btn.btn-primary.onward(@click="close()") {{ $t('onward') }}
  div.clearfix(slot="modal-footer")
</template>


<style lang="scss" scoped>
  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/modal.scss';

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
  import markdownDirective from 'client/directives/markdown';
  import {mountInfo} from 'common/script/content/stable';

  export default {
    data () {
      return {
        mount: null,
      };
    },
    directives: {
      markdown: markdownDirective,
    },
    created () {

    },
    mounted () {
      this.$root.$on('habitica::mount-raised', this.openDialog);
    },
    destroyed () {
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
    props: {
      hideText: {
        type: Boolean,
      },
    },
  };
</script>
