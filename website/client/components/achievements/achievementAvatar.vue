<template lang="pug">
.container-fluid
    .row
      .col-4(style='padding:0')
        div(:class='achievementClass')
      .col-4(style='padding:0')
        .herobox(:style="`${margin}em`")
          .character-sprites
            //- +generatedAvatar({sleep: false})
            avatar(:member='user')
      .col-4
        div(:class='achievementClass' style='margin: 2em auto')
</template>

<script>
import { mapState } from 'client/libs/store';
import Avatar from '../avatar';

export default {
  components: {
    Avatar,
  },
  props: ['badge', 'margin'],
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
