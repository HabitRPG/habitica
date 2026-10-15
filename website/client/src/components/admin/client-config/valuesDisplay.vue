<template>
  <div>
    <template v-if="values.length == 0">
      {{ defaultValue }}
    </template>
    <template v-else>
      <ul class="list-unstyled mb-0">
        <li><span class="font-weight-bold">Default:</span> {{ defaultValue }}</li>
        <li
          v-for="(value, index) in values"
          :key="index"
        >
          <span class="font-weight-bold">
            {{ getPlatformName(value.platform) }}:
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
  },
  methods: {
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
