<template lang="pug">
.card
  .card-block
    .row
      .col-md-8
        router-link(:to="{ name: 'guild', params: { guildId: guild._id } }")
          h3 {{ guild.name }}
        p {{ guild.description }}
      .col-md-2
        button.btn.float-right(:class="[isMember ? 'btn-danger' : 'btn-success']") {{ isMember ? $t('leave') : $t('join') }}
    .row
      .col-md-12
        .category-label(v-for="category in guild.categories")
          | {{category}}
</template>

<style lang="scss" scoped>
.card {
  height: 280px;
  border-radius: 4px;
  background-color: #ffffff;
  box-shadow: 0 2px 2px 0 rgba(26, 24, 29, 0.15), 0 1px 4px 0 rgba(26, 24, 29, 0.1);
  margin-bottom: 1rem;
}

.card h3 {
  height: 24px;
  font-size: 16px;
  font-weight: bold;
  font-stretch: condensed;
  line-height: 1.5;
  color: #34313a;
}

.card .category-label {
  min-width: 100px;
  border-radius: 100px;
  background-color: #edecee;
  padding: .5em;
  display: inline-block;
  margin-right: .5em;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.33;
  text-align: center;
  color: #a5a1ac;
}
</style>

<script>
import { mapState } from 'client/libs/store';
import groupUtilities from 'client/mixins/groupsUtilities';

export default {
  mixins: [groupUtilities],
  props: ['guild'],
  computed: {
    ...mapState({user: 'user.data'}),
    isMember () {
      return this.isMemberOfGroup(this.user, this.guild);
    },
  },
};
</script>
