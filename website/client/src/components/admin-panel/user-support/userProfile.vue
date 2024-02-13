<template>
  <div class="accordion-group">
    <h3
      class="expand-toggle"
      :class="{'open': expand}"
      @click="expand = !expand"
    >
      Users Profile
    </h3>
    <div v-if="expand">
      <form @submit.prevent="saveHero({hero, msg: 'Users Profile'})">
        <div class="form-group">
          <label>Display name</label>
          <input
            v-model="hero.profile.name"
            class="form-control textField"
            type="text"
          >
        </div>
        <div class="form-group">
          <label>Photo URL</label>
          <input
            v-model="hero.profile.imageUrl"
            class="form-control textField"
            type="text"
          >
        </div>
        <div class="form-group">
          <label>About</label>
          <div class="row about-row">
          <textarea
            v-model="hero.profile.blurb"
            class="form-control col"
            rows="10"
          ></textarea>
          <div
            v-markdown="hero.profile.blurb"
            class="markdownPreview col"
          ></div>
          </div>
        </div>
        <input
          type="submit"
          value="Save"
          class="btn btn-primary"
        >
      </form>
    </div>
  </div>
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
