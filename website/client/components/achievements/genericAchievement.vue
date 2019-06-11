<template lang="pug">
  b-modal#generic-achievement(:title='data.message', size='md', :hide-footer='true')
    .modal-body
      .col-12
        achievement-avatar.avatar
      .col-6.offset-3.text-center
        p(v-html='data.modalText')
        button.btn.btn-primary(@click='close()') {{ $t('huzzah') }}
    achievement-footer
</template>

<style scoped>
  .avatar {
    width: 140px;
    margin: 0 auto;
    margin-bottom: 1.5em;
    margin-top: 1.5em;
  }
</style>

<script>
  import achievementFooter from './achievementFooter';
  import achievementAvatar from './achievementAvatar';

  import {mapState} from 'client/libs/store';

  export default {
    components: {
      achievementFooter,
      achievementAvatar,
    },
    props: ['data'],
    computed: {
      ...mapState({user: 'user.data'}),
    },
    methods: {
      close () {
        this.$root.$emit('bv::hide::modal', 'generic-achievement');
      },
    },
  };
</script>
