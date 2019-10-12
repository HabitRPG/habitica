<template>
  <div :class="achievementClass">
    <avatar
      :member="user"
      :avatar-only="true"
      :with-background="true"
    />
  </div>
</template>

<script>
import { mapState } from '@/libs/store';
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
