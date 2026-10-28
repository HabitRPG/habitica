<template>
  <div>
    <h2>
      Segments
      <button
        class="btn btn-primary float-right"
        @click="showCreateForm = true"
      >
        Create Segment
      </button>
    </h2>
    <table class="table table-bordered bg-white">
      <thead>
        <tr>
          <th class="name-col">
            Name
          </th>
          <th>Conditions</th>
          <th class="btncol"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="segment in segments"
          :key="segment._id"
        >
          <td class="name-col">
            <span class="badge badge-pill badge-default"
              :class="'badge-' + segment.color">
            {{ segment.name }}
            </span>
            <div v-if="segment.description" class="text-muted small">
              {{ segment.description }}
            </div>
          </td>
          <td>
              <span v-for="(condition, index) in segment.conditions" :key="index">
                {{ describeCondition(condition) }}<span v-if="index < segment.conditions.length - 1"> and </span>
              </span>
          </td>
          <td class="btn-cell">
            <button
              class="btn btn-flat"
              @click="editedSegment = segment"
            >
              <span
                v-once
                class="svg-icon icon-16 color"
                v-html="icons.editIcon"
              ></span>
            </button>
            <button
              class="btn btn-flat"
              @click="deleteSegment(segment._id)"
            >
              <span
                v-once
                class="svg-icon icon-16 color"
                v-html="icons.deleteIcon"
              ></span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <SegmentForm
      v-if="editedSegment"
      :segment="editedSegment"
      :attributes="attributes"
      @save="saveSegment"
      @hide="editedSegment = null"
    />
    <SegmentForm
      v-if="showCreateForm"
      :segment="newSegment()"
      :attributes="attributes"
      @save="createSegment"
      @hide="showCreateForm = false"
    />
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/colors.scss';

h2 {
  margin-top: 2rem;
}

td {
  font-size: 1rem;
  vertical-align: middle;
}

.name-col {
  white-space: nowrap;
}

.btncol {
  width: 100px;
}

.btn-cell {
  padding: 0.4rem;
  white-space: nowrap;

  .btn {
    color: $gray-200;
    padding: 0.4rem;

    &:hover {
      color: $purple-300;
    }
  }
}

.disabled-row td {
  color: $gray-200;
}
</style>

<script>
import editIcon from '@/assets/svg/edit.svg?raw';
import deleteIcon from '@/assets/svg/delete.svg?raw';
import SegmentForm from './segmentForm.vue';

const OPERATOR_NAMES = {
  eq: '=',
  neq: '≠',
  lt: '<',
  lte: '≤',
  gt: '>',
  gte: '≥',
  in: 'is one of',
  nin: 'is not one of',
};

export default {
  components: {
    SegmentForm,
  },
  props: {
    segments: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      attributes: [],
      showCreateForm: false,
      editedSegment: null,
      icons: Object.freeze({
        editIcon,
        deleteIcon,
      }),
    };
  },
  async mounted () {
    this.attributes = await this.$store.dispatch('clientConfig:getClientConfigAttributes');
  },
  methods: {
    newSegment () {
      return {
        name: '',
        description: '',
        color: '',
        conditions: [],
      };
    },
    describeCondition (condition) {
      const attribute = this.attributes.find(a => a.key === condition.attribute);
      const value = Array.isArray(condition.value) ? condition.value.join(', ') : condition.value;
      return `${attribute ? attribute.name : condition.attribute} ${OPERATOR_NAMES[condition.operator] || condition.operator} ${value}`;
    },
    async saveSegment (segment) {
      await this.$store.dispatch('clientConfig:updateClientConfigSegment', { segment });
      this.editedSegment = null;
      this.$emit('changed');
    },
    async createSegment (segment) {
      await this.$store.dispatch('clientConfig:createClientConfigSegment', { segment });
      this.showCreateForm = false;
      this.$emit('changed');
    },
    async deleteSegment (segmentId) {
      if (!window.confirm('Are you sure you want to delete this segment?')) {
        return;
      }
      await this.$store.dispatch('clientConfig:deleteClientConfigSegment', { segmentId });
      this.$emit('changed');
    },
  },
};
</script>
