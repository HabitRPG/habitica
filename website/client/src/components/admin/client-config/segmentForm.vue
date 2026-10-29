<template>
  <b-modal
    size="lg"
    :visible="true"
    title="Edit Segment"
    :ok-disabled="!canSave()"
    @ok="saveSegment"
    @hide="$emit('hide')"
  >
    <div class="row">
      <div class="form-group col">
        <label class="form-label">Name</label>
        <input
          v-model="editedSegment.name"
          class="form-control"
          type="text"
        >
      </div>
      <div class="form-group col-auto">
        <label class="form-label">Color</label>
        <select
          v-model="editedSegment.color"
          class="form-control"
        >
          <option
            v-for="color in colors"
            :key="color"
            :value="color"
          >
            {{ color }}
          </option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <input
        v-model="editedSegment.description"
        class="form-control"
        type="text"
      >
    </div>
    <hr>
    <h3>Conditions</h3>
    <p class="text-muted small">
      Users must match all conditions. Logged out users are never part of a segment.
    </p>
    <div
      v-for="(condition, index) in editedSegment.conditions"
      :key="index"
      class="row"
    >
      <div class="form-group col">
        <label class="form-label">Attribute</label>
        <select
          v-model="condition.attribute"
          class="custom-select"
          @change="resetCondition(condition)"
        >
          <option
            v-for="attribute in attributes"
            :key="attribute.key"
            :value="attribute.key"
          >
            {{ attribute.name }}
          </option>
        </select>
      </div>
      <div class="form-group col-auto">
        <label class="form-label">Operator</label>
        <select
          v-model="condition.operator"
          class="custom-select"
        >
          <option
            v-for="operator in getOperators(condition)"
            :key="operator"
            :value="operator"
          >
            {{ operatorNames[operator] }}
          </option>
        </select>
      </div>
      <div class="form-group col">
        <label class="form-label">Value</label>
        <input
          v-if="getType(condition) === 'boolean'"
          v-model="condition.value"
          type="checkbox"
          class="d-block boolean-input"
        >
        <input
          v-else-if="getType(condition) === 'number'"
          v-model.number="condition.value"
          type="number"
          class="form-control"
        >
        <input
          v-else
          v-model="condition.value"
          type="text"
          class="form-control"
          :placeholder="isList(condition) ? 'Comma separated values' : ''"
        >
      </div>
      <div class="col-auto">
        <span
          class="cursor-pointer delete-button"
          @click="editedSegment.conditions.splice(index, 1)"
        >
          <div
            v-once
            class="svg-icon icon-16"
            v-html="icons.destroy"
          >
          </div>
        </span>
      </div>
    </div>

    <button
      class="btn btn-secondary"
      @click="addCondition"
    >
      Add Condition
    </button>
  </b-modal>
</template>

<style scoped lang="scss">
@import '@/assets/scss/colors.scss';

.delete-button {
  display: inline-flex;
  margin-top: 38px;

  &:hover {
    cursor: pointer;
    color: $maroon-50;
  }
}

.enable-switch {
  margin-top: 32px;
}

.boolean-input {
  margin-top: 12px;
}
</style>

<script>
import deleteIcon from '@/assets/svg/delete.svg?raw';

export default {
  name: 'SegmentForm',
  props: {
    segment: {
      type: Object,
      required: true,
    },
    attributes: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      colors: ['red', 'orange', 'yellow', 'green', 'blue', 'teal', 'purple'],
      editedSegment: {
        name: '',
        description: '',
        color: 'red',
        conditions: [],
      },
      operatorNames: Object.freeze({
        eq: 'equals',
        neq: 'does not equal',
        lt: 'less than',
        lte: 'at most',
        gt: 'greater than',
        gte: 'at least',
        in: 'is one of',
        nin: 'is not one of',
        contains: 'contains',
      }),
      icons: Object.freeze({
        destroy: deleteIcon,
      }),
    };
  },
  mounted () {
    this.editedSegment = {
      ...this.segment,
      conditions: (this.segment.conditions || []).map(condition => ({
        ...condition,
        value: Array.isArray(condition.value) ? condition.value.join(', ') : condition.value,
      })),
    };
  },
  methods: {
    getAttribute (condition) {
      return this.attributes.find(a => a.key === condition.attribute);
    },
    getType (condition) {
      const attribute = this.getAttribute(condition);
      return attribute ? attribute.type : 'string';
    },
    getOperators (condition) {
      const attribute = this.getAttribute(condition);
      return attribute ? attribute.operators : [];
    },
    isList (condition) {
      return condition.operator === 'in' || condition.operator === 'nin';
    },
    resetCondition (condition) {
      [condition.operator] = this.getOperators(condition);
      condition.value = this.getType(condition) === 'boolean' ? true : '';
    },
    addCondition () {
      const condition = { attribute: this.attributes[0] && this.attributes[0].key };
      this.resetCondition(condition);
      this.editedSegment.conditions.push(condition);
    },
    canSave () {
      const { name, conditions } = this.editedSegment;
      return name.length > 0
        && conditions.every(c => c.attribute && c.operator && c.value !== '');
    },
    saveSegment () {
      if (!this.canSave()) {
        return;
      }
      this.$emit('save', this.editedSegment);
    },
  },
};
</script>
