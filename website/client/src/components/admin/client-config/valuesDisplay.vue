<template>
  <div>
    <template
      v-if="values.length == 0"
      class="text-error"
    >
      {{ defaultValue }}
    </template>
    <template v-else>
      <ul class="list-unstyled mb-0">
        <li><span class="badge badge-pill badge-sm badge-default mb-1">Default</span> {{ defaultValue }}</li>
        <li
          v-for="(value, index) in values"
          :key="index"
        >
          <span
            class="badge badge-pill badge-sm badge-default mb-1"
            :class="'badge-' + getSegmentForValue(value).color"
          >
            {{ getTargetName(value) }}
          </span> {{ value.value }}
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ConfigValueField',
  props: {
    type: {
      type: String,
      default: 'text',
    },
    defaultValue: {
      type: [String, Number, Boolean],
    },
    values: {
      type: Array,
      default: () => [],
    },
    segments: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    getTargetName (value) {
      const parts = [];
      if (value.platform) parts.push(this.getPlatformName(value.platform));
      if (value.segment) {
        const segment = this.getSegmentForValue(value);
        parts.push(segment ? segment.name : 'Unknown segment');
      }
      return parts.join(' / ');
    },
    getSegmentForValue (value) {
      return this.segments.find(s => s._id === value.segment) || {};
    },
    getPlatformName (platform) {
      switch (platform) {
        case 'ios':
          return 'iOS';
        case 'android':
          return 'Android';
        default:
          return platform;
      }
    },
  },
};
</script>
