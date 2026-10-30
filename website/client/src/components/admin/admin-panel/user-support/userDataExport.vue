<template>
  <div class="card mt-2">
    <div class="card-header">
      <h3
        class="mb-0 mt-0"
        :class="{'open': expand}"
        @click="expand = !expand"
      >
        User Data Export
      </h3>
    </div>
    <div
      v-if="expand"
      class="card-body"
    >
      <p>
        Files are the same as the ones available from users settings.
      </p>
      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Task history:</label>
        <div class="col-sm-9">
          <a
            :href="exportUrl('history.csv')"
            class="btn btn-secondary btn-sm"
          >
            CSV
          </a>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-sm-3 col-form-label">User data:</label>
        <div class="col-sm-9">
          <a
            :href="exportUrl('userdata.json')"
            class="btn btn-secondary btn-sm mr-2"
          >
            JSON
          </a>
          <a
            :href="exportUrl('userdata.xml')"
            class="btn btn-secondary btn-sm"
          >
            XML
          </a>
        </div>
      </div>
      <div class="form-group row">
        <label class="col-sm-3 col-form-label">Private messages:</label>
        <div class="col-sm-9">
          <a
            :href="exportUrl('inbox.html')"
            class="btn btn-secondary btn-sm"
          >
            HTML
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    userId: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      expand: false,
    };
  },
  methods: {
    exportUrl (file) {
      return `/export/admin/${this.userId}/${file}`;
    },
  },
};
</script>
