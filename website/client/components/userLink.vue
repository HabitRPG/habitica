<template lang="pug">
  b-link(
    v-if='user && user.profile',
    @click.prevent='showProfile(user)'
    ) {{user.profile.name}}
</template>

<script>
  export default {
    props: ['user'],
    methods: {
      async showProfile (user) {
        let heroDetails = await this.$store.dispatch('members:fetchMember', { memberId: user._id });
        this.$root.$emit('habitica:show-profile', {
          user: heroDetails.data.data,
          startingPage: 'profile',
        });
      },
    },
  };
</script>