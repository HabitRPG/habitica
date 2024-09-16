<template>
  <div class="quest-content">
    <Sprite
      class="quest-image"
      :image-name="item.purchaseType === 'bundles'
      ? `quest_bundle_${item.key}` : `quest_${item.key}`"
    />
    <h3 class="text-center">
      {{ itemText }}
    </h3>
    <div
      v-if="group && leader"
      class="leader-label"
    >
      <span v-once>
        {{ $t('questOwner') }}:
      </span>
      <user-label :user="leader" />
    </div>
    <div
      class="mx-4"
      v-html="itemNotes"
    ></div>
    <questInfo
      class="questInfo"
      :quest="item"
      :abbreviated="true"
    />
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  h3 {
    color: $gray-10;
    margin-bottom: 4pxrem;
  }

  .quest-image {
    margin: 0 auto;
    margin-bottom: 16px;
    margin-top: 24px;
    display: block;
  }

  .leader-label {
    font-size: 14px;
    font-weight: bold;
    line-height: 1.71;
    color: $gray-50;
    text-align: center;
    margin-bottom: 8px;

    ::v-deep .user-label {
      font-size: 0.875rem;
    }
  }

  .questInfo {
    width: 160px;
    margin: 0 auto;

    display: flex;
    justify-content: center;
  }
</style>

<script>
import QuestInfo from './questInfo.vue';
import UserLabel from '../../userLabel';
import Sprite from '../../ui/sprite';

export default {
  components: {
    UserLabel,
    QuestInfo,
    Sprite,
  },
  props: {
    item: {
      type: Object,
    },
    group: {
      type: Object,
    },
  },
  data () {
    return {
      leader: null,
    };
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
  async created () {
    if (this.group && this.group.quest && this.group.quest.active) {
      try {
        const fetchMemberResult = await this.$store.dispatch('members:fetchMember', {
          memberId: this.group.quest.leader,
        });

        this.leader = fetchMemberResult;
      } catch {
        this.leader = null;
      }
    }
  },
};
</script>
