<template lang="pug">
  b-modal#lost-masterclasser(:title='title', size='md', :hide-footer='true')
    .modal-body
      .col-12
        achievement-avatar.avatar
      .col-6.offset-3.text-center
        p {{ $t('achievementLostMasterclasserModalText') }}
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
    computed: {
      ...mapState({user: 'user.data'}),
    },
    data () {
      return {
        title: `${this.$t('modalAchievement')} ${this.$t('achievementLostMasterclasser')}`,
      };
    },
    methods: {
      close () {
        this.$root.$emit('bv::hide::modal', 'lost-masterclasser');
      },
    },
  };
</script>
