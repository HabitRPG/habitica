<template>
  <b-modal
    id="profile"
    size="lg"
    :hide-footer="true"
    :hide-header="true"
    @hidden="onHidden"
    @shown="onShown()"
  >
    <profile
      :user-id="userId"
      :starting-page="startingPage"
      style="margin-top:24px;"
    />
  </b-modal>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';

  .header {
    width: 100%;
  }
</style>

<script>
import profile from './profile';

export default {
  components: {
    profile,
  },
  data () {
    return {
      userId: undefined,
      startingPage: undefined,
      path: undefined,
      selectedPage: '',
    };
  },
  watch: {
    startingPage () {
      console.log('watch triggered!');
      this.selectedPage = this.startingPage;
    },
  },
  mounted () {
    this.$root.$on('habitica:show-profile', data => {
      this.userId = data.userId;
      this.startingPage = data.startingPage || 'profile';
      this.path = data.path;
      this.$root.$emit('bv::show::modal', 'profile');
    });
    this.selectPage(this.startingPage);
  },
  beforeDestroy () {
    this.$root.$off('habitica:show-profile');
  },
  methods: {
    onShown () {
      window.history.pushState('', null, this.path);
    },
    onHidden () {
      if (this.$route.path !== window.location.pathname) {
        this.$router.push({ path: this.$route.path });
        this.startingPage = 'tavern';
        console.log(this.pathDecode('section'));
        console.log(this.pathDecode('subsection'));
        window.history.replaceState(null, null, '');
        this.$store.dispatch('common:setTitle', {
          section: this.$t(this.pathDecode('section')),
          subSection: this.$t(this.pathDecode('subsection')),
        });
      }
    },
    pathDecode (section) {
      const str = this.$route.path;
      const firstI = str.indexOf('/') + 1;
      const secondI = str.lastIndexOf('/');
      let newstr = '';
      if (section === 'section') {
        newstr = str.slice(firstI, secondI);
      } else if (section === 'subsection') {
        newstr = str.slice(secondI + 1);
      }
      return newstr;
    },
  },
};
</script>
