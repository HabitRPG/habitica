import VueRouter from 'vue-router';

const { isNavigationFailure, NavigationFailureType } = VueRouter;

export default {
  methods: {
    async saveHero ({
      hero,
      msg = 'User',
      clearData,
      reloadData,
    }) {
      await this.$store.dispatch('hall:updateHero', { heroDetails: hero });
      await this.$store.dispatch('snackbars:add', {
        title: '',
        text: `${msg} updated`,
        type: 'info',
      });

      if (clearData) {
        // Use clearData when the saved changes may affect data in other components
        // (e.g., adding a contributor tier will increase the Gem balance)
        // The admin should re-fetch the data if they need to keep working on that user.
        this.$emit('clear-data');
        this.$router.push({ name: 'adminPanel' });
      } else if (reloadData) {
        if (this.$router.currentRoute.name === 'adminPanelUser') {
          await this.$router.push({
            name: 'adminPanel',
          });
        }
        await this.$router.push({
          name: 'adminPanelUser',
          params: { userIdentifier: hero._id },
        }).catch(failure => {
          if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
            this.$router.go();
          }
        });
      }
    },
  },
};
