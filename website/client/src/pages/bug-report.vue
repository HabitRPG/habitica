<template>
  <form
      class="form"
      @submit.prevent.stop="sendBugReport()"
  >
    <p class="form-text">
      Bug Details:
    </p>
    <textarea
      v-model="message"
      class="form-control"
      rows="5">

    </textarea>

    <br >
    <br >

    <button
        class="btn btn-block btn-info"
        type="submit"
    >
      Send Bug Report
    </button>
  </form>
</template>

<script>
import axios from 'axios';

export default {
  name: 'bug-report',
  methods: {
    async sendBugReport () {
      await axios.post('/api/v4/bug-report', {
        message: this.message,
      });
    },
  },
  data () {
    return {
      message: '',
    };
  },
};
</script>

<style scoped>

</style>
