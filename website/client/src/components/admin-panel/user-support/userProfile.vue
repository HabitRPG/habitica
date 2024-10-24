<template>
  <form @submit.prevent="saveHero({hero, msg: 'Users Profile'})">
    <div class="card mt-2">
      <div class="card-header">
        <h3
          class="mb-0 mt-0"
          :class="{'open': expand}"
          @click="expand = !expand"
        >
          User Profile
        </h3>
      </div>
      <div
        v-if="expand"
        class="card-body"
      >
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Display name</label>
          <div class="col-sm-9">
            <input
              v-model="hero.profile.name"
              class="form-control"
              type="text"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Photo URL</label>
          <div class="col-sm-9">
            <input
              v-model="hero.profile.imageUrl"
              class="form-control"
              type="text"
            >
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">About</label>
          <div class="col-sm-9">
            <textarea
              v-model="hero.profile.blurb"
              class="form-control"
              rows="10"
            ></textarea>
            <div
              v-markdown="hero.profile.blurb"
              class="markdownPreview"
            ></div>
          </div>
        </div>
      </div>
      <div
        v-if="expand"
        class="card-footer"
      >
        <input
          type="submit"
          value="Save"
          class="btn btn-primary mt-1"
        >
      </div>
    </div>
  </form>
</template>

<style lang="scss" scoped>
  .about-row {
    margin-left: 0px;
    margin-right: 0px;
  }
</style>

<script>
import markdownDirective from '@/directives/markdown';
import saveHero from '../mixins/saveHero';

import { mapState } from '@/libs/store';
import { userStateMixin } from '../../../mixins/userState';

function resetData (self) {
  self.expand = false;
}

export default {
  directives: {
    markdown: markdownDirective,
  },
  mixins: [
    userStateMixin,
    saveHero,
  ],
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  props: {
    resetCounter: {
      type: Number,
      required: true,
    },
    hero: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      expand: false,
    };
  },
  watch: {
    resetCounter () {
      resetData(this);
    },
  },
  mounted () {
    resetData(this);
  },
};
</script>
