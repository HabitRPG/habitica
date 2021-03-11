<template>
  <div class="quest-content">
    <div
      class="quest-image"
      :class="'quest_' + item.key"
    ></div>
    <h3 class="title">
      {{ itemText }}
    </h3>
    <div
      v-if="group && leader"
      class="leader-label"
    >
      <span>Quest-Owner: </span><user-label :user="leader" />
    </div>
    <div
      class="text"
      v-html="itemNotes"
    ></div>
    <questInfo
      class="questInfo"
      :quest="item"
    />
  </div>
</template>


<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .quest-image {
    margin: 0 auto;
    margin-bottom: 1em;
    margin-top: 1.5em;
  }

  .text {
    margin-bottom: 8px;
    overflow-y: scroll;
    text-overflow: ellipsis;
  }

  .leader-label {
    font-size: 14px;
    font-weight: bold;
    line-height: 1.71;
    color: $gray-50;
    text-align: center;
    margin-bottom: 0.5rem;

    ::v-deep .user-label {
      font-size: 14px;
    }
  }

  .questInfo {
    width: 70%;
    margin: 0 auto;
    margin-bottom: 10px;

    display: flex;
    justify-content: center;
  }
</style>

<script>
import QuestInfo from './questInfo.vue';
import UserLabel from '../../userLabel';

export default {
  components: {
    UserLabel,
    QuestInfo,
  },
  data () {
    return {
      leader: null,
    };
  },
  props: {
    item: {
      type: Object,
    },
    group: {
      type: Object,
    },
  },
  async created () {
    if (this.group.quest && this.group.quest.active) {
      try {
        const fetchMemberResult = await this.$store.dispatch('members:fetchMember', {
          memberId: this.group.quest.leader,
        });

        // this should be handled in fetchMember instead
        this.leader = fetchMemberResult.data.data;
      } catch {
        this.leader = null;
      }
    }
  },
  computed: {
    itemText () {
      if (this.item.text instanceof Function) {
        return this.item.text();
      }
      return this.item.text;
    },
    itemNotes () {
      if (this.item.notes instanceof Function) {
        return this.item.notes();
      }
      return this.item.notes;
    },
  },
};
</script>
