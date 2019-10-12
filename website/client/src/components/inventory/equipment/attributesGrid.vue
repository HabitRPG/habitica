<template>
  <div class="attributes-group">
    <div
      v-for="attr in ATTRIBUTES"
      :key="attr"
      class="popover-content-attr"
    >
      <div class="group-content">
        <span
          class="popover-content-attr-cell key"
          :class="{'hasValue': hasSumValue(attr) }"
        >{{ `${$t(attr)}: ` }}</span>
        <span
          class="popover-content-attr-cell label value"
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

  @import '~@/assets/scss/colors.scss';


  .attributes-group {
    border-radius: 4px;
    // unless we have a way to give a popover an id or class, it needs expand the attributes area
    margin: -12px -16px;
    display:flex;
    flex-wrap: wrap;
  }

  .popover-content-attr {
    font-weight: bold;
    width: calc(50% - 1px);
    background-color: $gray-50;

    &:nth-of-type(even) {
      margin-left: 1px;
    }

    &:nth-child(1), &:nth-child(2) {
      margin-bottom: 1px;
    }
  }

  .group-content {
    display: inline-flex;
    flex-wrap: wrap;
    padding: 4px 12px;
    width: 100%;
  }

  .popover-content-attr-cell {
    width: 70%;
    text-align: left;

    &:nth-of-type(even) {
      text-align: right;
      width: 30%;
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
      padding: 8px 17px;
    }

    .popover-content-attr {
      background-color: #f4f4f4;

      &:nth-of-type(even) {
        margin-left: 1px;
        width: 50%;
      }
    }

    .popover-content-attr-cell {
      &.key {
        color: $gray-400;
        font-size: 16px;
        font-weight: bold;
        line-height: 1.25;

        &.hasValue {
          color: $gray-50;
        }
      }

      &.label {
        color: $gray-400;
        font-size: 12px;
        font-weight: bold;
        line-height: 1.33;

        &.hasValue {
          color: $gray-200;
        }
      }

      &.label.value {

        &.green {
          color: $green-10;

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
