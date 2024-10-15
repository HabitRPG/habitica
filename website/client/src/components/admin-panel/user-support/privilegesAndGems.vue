<template>
  <form @submit.prevent="saveHero({hero, msg: 'Privileges or Gems or Moderation Notes'})">
    <div class="card mt-2">
      <div class="card-header">
        <h3
          class="mb-0 mt-0"
          :class="{'open': expand}"
          @click="expand = !expand"
        >
          Privileges, Gem Balance
        </h3>
      </div>
      <div
        v-if="expand"
        class="card-body"
      >
        <p
          v-if="errorsOrWarningsExist"
          class="errorMessage"
        >
          Player has had privileges removed or has moderation notes.
        </p>
        <div
          v-if="hero.flags"
          class="form-group row"
        >
          <div class="col-sm-9 offset-sm-3">
            <div class="custom-control custom-checkbox">
              <input
                id="chatShadowMuted"
                v-model="hero.flags.chatShadowMuted"
                class="custom-control-input"
                type="checkbox"
              >
              <label
                class="custom-control-label"
                for="chatShadowMuted"
              >
                Shadow Mute
              </label>
            </div>
          </div>
        </div>
        <div
          v-if="hero.flags"
          class="form-group row"
        >
          <div class="col-sm-9 offset-sm-3">
            <div class="custom-control custom-checkbox">
              <input
                id="chatRevoked"
                v-model="hero.flags.chatRevoked"
                class="custom-control-input"
                type="checkbox"
              >
              <label
                class="custom-control-label"
                for="chatRevoked"
              >
                Mute (Revoke Chat Privileges)
              </label>
            </div>
          </div>
        </div>
        <div class="form-group row">
          <div class="col-sm-9 offset-sm-3">
            <div class="custom-control custom-checkbox">
              <input
                id="blocked"
                v-model="hero.auth.blocked"
                class="custom-control-input"
                type="checkbox"
              >
              <label
                class="custom-control-label"
                for="blocked"
              >
                Ban / Block
              </label>
            </div>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">
            Balance
          </label>
          <div class="col-sm-9">
            <input
              v-model="hero.balance"
              class="form-control balanceField"
              type="number"
              step="0.25"
            >
            <small>
              Balance is in USD, not in Gems.
              E.g., if this number is 1, it means 4 Gems.
              Arrows change Balance by 0.25 (i.e., 1 Gem per click).
              Do not use when awarding tiers; tier gems are automatic.
            </small>
          </div>
        </div>
        <div class="form-group row">
          <label class="col-sm-3 col-form-label">Moderation Notes</label>
          <div class="col-sm-9">
            <textarea
              v-model="hero.secret.text"
              class="form-control"
              cols="5"
              rows="5"
            ></textarea>
            <div
              v-markdown="hero.secret.text"
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
  .balanceField {
    min-width: 15ch;
  }
</style>

<script>
import markdownDirective from '@/directives/markdown';
import saveHero from '../mixins/saveHero';

function resetData (self) {
  self.errorsOrWarningsExist = false;
  self.expand = false;
  if (self.hero.flags.chatRevoked || self.hero.flags.chatShadowMuted || self.hero.auth.blocked
      || (self.hero.secret.text && !self.hero.contributor.level)) {
    // We automatically expand this section if the user has had privileges removed.
    // We also expand if they have secret.text UNLESS they have a contributor tier because
    // in that case the notes are probably about their contributions and can be seen in the
    // Contributor Details section (which will be automatically expanded because of their tier).
    self.errorsOrWarningsExist = true;
    self.expand = true;
  }
}

export default {
  directives: {
    markdown: markdownDirective,
  },
  mixins: [
    saveHero,
  ],
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
      errorsOrWarningsExist: false,
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
