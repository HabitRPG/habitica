<template lang="pug">
  b-link(
    v-if='group',
    @click.prevent='goToGroup'
    ) {{group.name}}

</template>

<script>
  export default {
    props: ['group'],
    methods: {
      goToGroup () {
        if (this.group.type === 'party') {
          this.$router.push({name: 'party'});
        } else {
          this.$router.push({name: 'guild', params: {groupId: this.group._id}});
        }
      },
    },
  };
</script>