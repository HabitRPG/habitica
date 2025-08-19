<template>
  <div class="row standard-page col-12 d-flex justify-content-center">
    <div class="group-admin-content">
      <h1>{{ $t("groupAdmin") }}</h1>
      <form
        class="form-inline"
        @submit.prevent="loadGroup(groupID)"
      >
        <div class="input-group col pl-0 pr-0">
          <input
            v-model="groupID"
            class="form-control"
            type="text"
            placeholder="Group ID"
          >
          <div class="input-group-append">
            <button
              class="btn btn-primary"
              type="button"
              :disabled="!groupID"
              @click="loadGroup(groupID)"
            >
              Load
            </button>
          </div>
        </div>
      </form>

      <router-view
        class="mt-3"
        @changeGroupId="changeGroupId"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .uidField {
    min-width: 45ch;
  }

  .input-group-append {
    width:auto;
  }

  .group-admin-content {
    flex: 0 0 800px;
    max-width: 800px;
  }
</style>

<script>
import VueRouter from 'vue-router';
import { mapState } from '@/libs/store';

const { isNavigationFailure, NavigationFailureType } = VueRouter;

export default {
  data () {
    return {
      groupID: '',
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('groupAdmin'),
    });
  },
  methods: {
    changeGroupId (id) {
      this.groupID = id;
    },
    async loadGroup (groupId) {
      if (this.$router.currentRoute.name === 'groupAdminGroup') {
        await this.$router.push({
          name: 'groupAdmin',
        });
      }
      await this.$router.push({
        name: 'groupAdminGroup',
        params: { groupId },
      }).catch(failure => {
        if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
          this.$router.go();
        }
      });
    },
  },
};
</script>
