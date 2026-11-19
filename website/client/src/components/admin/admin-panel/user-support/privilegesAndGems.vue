<template>
  <form
    @submit.prevent="saveHero({hero: {
      _id: hero._id,
      flags: hero.flags,
      balance: hero.balance,
      auth: hero.auth,
      secret: hero.secret,
    }, msg: 'Privileges or Gems or Moderation Notes'})"
  >
    <div class="card mt-2">
      <div class="card-header">
        <h3
          class="mb-0 mt-0"
          :class="{'open': expand}"
          @click="expand = !expand"
        >
          Privileges, Gem Balance
          <b
            v-if="hasUnsavedChanges && !expand"
            class="text-warning float-right"
          >
            Unsaved changes
          </b>
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
          v-if="editedHero.flags"
          class="form-group row"
        >
          <div class="col-sm-9 offset-sm-3">
            <div class="custom-control custom-checkbox">
              <input
                id="chatShadowMuted"
                v-model="editedHero.flags.chatShadowMuted"
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
          v-if="editedHero.flags"
          class="form-group row"
        >
          <div class="col-sm-9 offset-sm-3">
            <div class="custom-control custom-checkbox">
              <input
                id="chatRevoked"
                v-model="editedHero.flags.chatRevoked"
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
                v-model="editedHero.auth.blocked"
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
              v-model="editedHero.balance"
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
              v-model="editedHero.secret.text"
              class="form-control"
              cols="5"
              rows="5"
            ></textarea>
            <div
              v-markdown="editedHero.secret.text"
              class="markdownPreview"
            ></div>
          </div>
        </div>
      </div>
      <div
        v-if="expand"
        class="card-footer d-flex align-items-center justify-content-between"
      >
        <input
          type="submit"
          value="Save"
          class="btn btn-primary mt-1"
        >
        <b
          v-if="hasUnsavedChanges"
          class="text-warning float-right"
        >
          Unsaved changes
        </b>
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
  if (self.editedHero.flags.chatRevoked
      || self.editedHero.flags.chatShadowMuted
      || self.editedHero.auth.blocked
      || (self.editedHero.secret.text && !self.editedHero.contributor.level)) {
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
    hasUnsavedChanges: {
      type: Boolean,
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
