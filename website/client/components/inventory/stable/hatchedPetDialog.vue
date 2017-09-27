<template lang="pug">

  b-modal#hatchedPet-modal(
    :hide-header="true"
  )
    div.content(v-if="pet != null")
      div.dialog-header.title(v-once) {{ $t('hatchedPetGeneric') }}


      div.inner-content
        div.pet-background
          div(:class="pet.class")

        h4.title {{ pet.name }}
        div.text(v-if="!hideText")
          | Visit the
          |
          router-link(:to="{name: 'stable'}") {{ $t('stable') }}
          |
          | to feed and equip your newest pet!
          // @TODO make translatable with the entire sentence in one string (translators can't do sentences in multiple parts)

        button.btn.btn-primary(@click="close()") {{ $t('onward') }}

    div.clearfix(slot="modal-footer")
</template>


<style lang="scss">

  @import '~client/assets/scss/colors.scss';
  @import '~client/assets/scss/modal.scss';

  #hatchedPet-modal {
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

    .Pet {
      margin: auto;
    }

    .dialog-header {
      color: $purple-200;
    }
  }

</style>


<script>
  import bModal from 'bootstrap-vue/lib/components/modal';

  export default {
    components: {
      bModal,
    },
    data () {
      return {
        pet: null,
      };
    },
    created () {

    },
    mounted () {
      this.$root.$on('hatchedPet::open', this.openDialog);
    },
    destroyed () {
      this.$root.$off('hatchedPet::open', this.openDialog);
    },
    methods: {
      openDialog (item) {
        this.pet = item;
        this.$root.$emit('show::modal', 'hatchedPet-modal');
      },

      close () {
        this.$emit('closed', this.item);
        this.$root.$emit('hide::modal', 'hatchedPet-modal');
        this.pet = null;
      },
    },
    props: {
      hideText: {
        type: Boolean,
      },
    },
  };
</script>
