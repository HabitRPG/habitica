<template>
  <div class="attributes-group">
    <div
      v-for="attr in ATTRIBUTES"
      :key="attr"
      class="popover-content-attr"
      :class="`attr-${attr}`"
    >
      <div class="group-content">
        <span
          class="popover-content-attr-cell key"
          :class="{'hasValue': hasSumValue(attr) }"
        >{{ `${$t(attr)}: ` }}</span>
        <span
          class="popover-content-attr-cell label key-value value"
          :class="{'green': hasSumValue(attr) }"
        >{{ `${stats.sum[attr]}` }}</span>
        <span
          class="popover-content-attr-cell label bold"
          :class="{'hasValue': hasGearValue(attr) }"
        >{{ $t('gear') }}:</span>
        <span
          class="popover-content-attr-cell label"
          :class="{'hasValue': hasGearValue(attr) }"
        >{{ stats.gear[attr] }}</span>
        <span
          class="popover-content-attr-cell label bold"
          :class="{'hasValue': hasClassBonus(attr) }"
        >{{ $t('classEquipBonus') }}:</span>
        <span
          class="popover-content-attr-cell label"
          :class="{'hasValue': hasClassBonus(attr) }"
        >{{ `${stats.classBonus[attr]}` }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">

  @import '@/assets/scss/colors.scss';

  .attributes-group {
    border-radius: 4px;
    // unless we have a way to give a popover an id or class, it needs to expand the attributes area
    margin: -12px -16px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
  }

  .popover-content-attr {
    font-weight: bold;
    width: fit-content;
    background-color: $gray-50;

    .attr-str, .attr-int {
      padding-top: 0.25rem;
      padding-bottom: 0.5rem;
    }

    .attr-con, .attr-per {
      padding-bottom: 0.75rem;
      padding-top: 0.5rem;
    }
  }

  .group-content {
    display: grid;
    grid-template-columns: auto auto;
    column-gap: 2rem;
    justify-content: start;
    padding: 4px 12px;
    width: fit-content;
  }

  .popover-content-attr-cell {
    text-align: left;

    &:nth-of-type(even) {
      text-align: right;
    }

    &.key {
      color: $white;
      font-size: 12px;
      font-weight: bold;
      line-height: 1.33;
    }

    &.label {
      font-size: 10px;
      line-height: 1.2;
      color: $gray-300;
    }

    &.label.bold {
      font-weight: bold;
    }

    &.label.value {
      font-size: 12px;
      font-weight: bold;
      line-height: 1.33;
      text-align: right;
      white-space: nowrap;

      &.green {
        color: $green-10;

        &:before {
          content: '+';
        }
      }
    }
  }

  .modal-body {

    .group-content {
      padding: 0.25rem 1rem;
    }

    .popover-content-attr {
      background-color: #f4f4f4;
    }

    .popover-content-attr-cell {
      &.key {
        color: $gray-100;
        font-size: 0.875rem;
        font-weight: bold;
        line-height: 1.71;

        opacity: 0.5;

        &.hasValue {
          opacity: 1;
        }
      }

      &.label {
        color: $gray-100;
        font-size: 0.75rem;
        line-height: 1.33;
        opacity: 0.5;

        &.bold {
          font-weight: bold;
        }

        &.key-value {
          line-height: 1.71;
        }

        &.hasValue {
          opacity: 1;
        }
      }

      &.label.value {
        text-align: right;

        &.green {
          color: $green-10;
          opacity: 1;
        }
      }
    }

  }
</style>

<script>
import { mapState } from '@/libs/store';
import statsMixin from '@/mixins/stats';

export default {
  mixins: [statsMixin],
  props: {
    item: {
      type: Object,
    },
    user: {
      type: Object,
    },
  },
  computed: {
    ...mapState({
      ATTRIBUTES: 'constants.ATTRIBUTES',
      flatGear: 'content.gear.flat',
    }),
  },
  methods: {
    hasSumValue (attr) {
      return this.stats.sum[attr] > 0;
    },
    hasGearValue (attr) {
      return this.stats.gear[attr] > 0;
    },
    hasClassBonus (attr) {
      return this.stats.classBonus[attr] > 0;
    },
  },
};
</script>
