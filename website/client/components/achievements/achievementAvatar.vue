<template lang="pug">
  div(:class='achievementClass')
    //- +generatedAvatar({sleep: false})
    avatar(:member='user', :avatarOnly='true', :withBackground='true')
</template>

<script>
import { mapState } from 'client/libs/store';
import Avatar from '../avatar';

export default {
  components: {
    Avatar,
  },
  data () {
    return {
      achievementClass: `achievement-${this.badge}2x`,
    };
  },
  computed: {
    ...mapState({
      user: 'user.data',
    }),
  },
};
</script>
