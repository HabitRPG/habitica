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
          :class="attributeMap[attr]"
        >{{ `${$t(attributeMap[attr])}: ` }}</span>
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
    // unless we have a way to give a popover an id or class, it needs expand the attributes area
    margin: -12px -16px;
    display:flex;
    flex-wrap: wrap;
  }

  .popover-content-attr {
    font-weight: bold;
    width: calc(50%);
    background-color: $gray-50;

    .attr-str, .attr-int {
      padding-top: 0.25rem;
      padding-bottom: 0.5rem;
    }

    .attr-con, .attr-per {
      padding-bottom: 0.75rem;
      padding-top: 0.5rem;
    }

    &:nth-of-type(3) {
      border-bottom-left-radius: 8px;
    }

    &:nth-of-type(4) {
      border-bottom-right-radius: 8px;
      padding-bottom: 8px;
    }
  }

  .group-content {
    display: inline-flex;
    flex-wrap: wrap;
    padding: 8px 16px;
    width: 100%;
  }

  .popover-content-attr-cell {
    width: 65%;
    text-align: left;

    &:nth-of-type(even) {
      text-align: right;
      width: 35%;
    }

    &.key {
      color: $white;
      font-size: 12px;
      font-weight: bold;
      line-height: 1.33;
      white-space: nowrap;
    }

    &.label {
      font-size: 10px;
      line-height: 1.2;
      color: $gray-300;

      &.hasValue {
        color: $gray-500;
      }
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
        color: $green-500;

        &:before {
          content: '+';
        }
      }
    }
  }

  .modal-body {
    .attributes-group {
      margin: inherit;
      gap: 8px;

      .strength {
        color: $maroon-100;
      }
      .intelligence {
        color: $blue-10;
      }
      .constitution {
        color: $yellow-5;
      }
      .perception {
        color: $purple-300;
      }
    }

    .group-content {
      padding: 0.25rem 1rem;
    }

    .popover-content-attr {
      width: calc(50% - 9px);
      background-color: $gray-700;
      border-radius: 4px;

      &:nth-of-type(even) {
        width: 50%;
      }
    }

    .popover-content-attr-cell {
      &.key {
        font-size: 0.875rem;
        font-weight: bold;
        line-height: 1.71;
      }

      &.label {
        color: $gray-300;
        font-size: 0.75rem;
        line-height: 1.33;

        &.bold {
          font-weight: bold;
        }

        &.key-value {
          line-height: 1.71;
        }

        &.hasValue {
          color: $gray-100;
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
  data () {
    return {
      attributeMap: {
        con: 'constitution',
        int: 'intelligence',
        per: 'perception',
        str: 'strength',
      },
    };
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
