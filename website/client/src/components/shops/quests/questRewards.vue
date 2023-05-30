<template>
  <div
    v-if="quest.drop"
    class="quest-rewards"
  >
    <div
      class="header d-flex align-items-center"
      @click="toggle"
    >
      <span class="d-flex justify-content-center">
        <div
          v-once
          class="your-rewards d-flex align-items-center"
        >
          <span
            class="sparkles"
            v-html="icons.sparkles"
          ></span>
          <span class="rewards-title">{{ $t('rewards') }}</span>
          <span
            class="sparkles mirror"
            v-html="icons.sparkles"
          ></span>
        </div>
      </span>
      <SectionButton
        :visible="opened"
        @click="toggle"
      />
    </div>
    <div
      v-if="opened"
      class="content ml-3 mr-3"
    >
      <item-with-label
        v-for="drop in getDropsList(quest.drop.items, true)"
        :key="drop.key"
        :item="{}"
        label-class="purple"
      >
        <div slot="itemImage">
          <div :class="getDropIcon(drop)"></div>
        </div>
        <div slot="popoverContent">
          <quest-popover :item="drop" />
        </div>
        <div slot="label">
          {{ $t('ownerOnly') }}
        </div>
      </item-with-label>

      <item-with-label
        :item="{}"
        label-class="yellow"
      >
        <div slot="itemImage">
          <div
            class="icon-48"
            v-html="icons.expIcon"
          ></div>
        </div>
        <div slot="label">
          {{ $t('amountExp', { amount: quest.drop.exp }) }}
        </div>
      </item-with-label>

      <item-with-label
        v-if="quest.drop.gp > 0"
        :item="{}"
        label-class="yellow"
      >
        <div slot="itemImage">
          <div
            class="icon-48"
            v-html="icons.goldIcon"
          ></div>
        </div>
        <div slot="label">
          {{ $t('amountGold', { amount: quest.drop.gp }) }}
        </div>
      </item-with-label>

      <item-with-label
        v-for="drop in getDropsList(quest.drop.items, false)"
        :key="drop.type+'_'+drop.key"
        :item="{}"
        class="item-with-label"
      >
        <countBadge
          slot="badges"
          :show="drop.amount !== 1"
          :count="drop.amount"
        />
        <div slot="itemImage">
          <div :class="getDropIcon(drop)"></div>
        </div>
        <div slot="popoverContent">
          <equipmentAttributesPopover
            v-if="drop.klass"
            :item="drop"
          />
          <div v-else>
            <h4
              v-once
              class="popover-content-title"
              :class="{'mb-0': !Boolean(drop.notes)}"
            >
              {{ drop.text }}
            </h4>
            <div
              v-once
              class="popover-content-text"
            >
              {{ drop.notes }}
            </div>
          </div>
        </div>
        <div slot="label">
          {{ $t('newItem') }}
        </div>
      </item-with-label>
    </div>
  </div>
</template>

<script>
import sparkles from '@/assets/svg/sparkles-left.svg';
import expIcon from '@/assets/svg/experience.svg';
import goldIcon from '@/assets/svg/gold.svg';
import SectionButton from '../../sectionButton';
import ItemWithLabel from '../itemWithLabel';
import { QuestHelperMixin } from './quest-helper.mixin';
import EquipmentAttributesPopover from '@/components/inventory/equipment/attributesPopover';
import QuestPopover from './questPopover';
import CountBadge from '../../ui/countBadge';

export default {
  components: {
    CountBadge,
    QuestPopover,
    ItemWithLabel,
    SectionButton,
    EquipmentAttributesPopover,
  },
  mixins: [QuestHelperMixin],
  props: ['quest'],
  data () {
    return {
      opened: true,
      icons: Object.freeze({
        sparkles,
        expIcon,
        goldIcon,
      }),
    };
  },
  computed: {
    droppedItem () {
      const item = this.quest.drop.items[0];

      if (item) {
        return item;
      }

      return null;
    },
  },
  methods: {
    toggle () {
      this.opened = !this.opened;
    },
  },
};
</script>

<style scoped lang="scss">
  @import '~@/assets/scss/colors.scss';

  .quest-rewards {
    background-color: $gray-700;
  }

  .header {
    height: 3.5rem;
    position: relative;

    ::v-deep {
      .section-button {
        position: absolute;
        right: 1.5rem;
      }
    }

    span {
      flex: 1;
    }

    .mirror {
      transform: scaleX(-1);
    }

    .your-rewards {
      margin: 0 auto;
      width: fit-content;

      .sparkles {
        width: 2rem;
      }

      .rewards-title {
        font-weight: bold;
        margin: 1rem;
        color: $gray-50;
        align-self: baseline; // center would move it to the top?!
      }
    }
  }

  .content{
    display: flex;
    flex-direction: row;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;

    padding-bottom: 1rem;
  }

  .item-with-label ::v-deep .image {
    height: 68px;
    width: 68px;

    .rewards_pet {
      margin-top: -20px
    }
  }
</style>
