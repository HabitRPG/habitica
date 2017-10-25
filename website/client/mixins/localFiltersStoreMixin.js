import { setLocalSetting, getLocalSetting } from 'client/libs/userlocalManager';

export default {
  watch: {
    viewOptions: {
      handler (newVal) {
        if (!newVal) return;
        if (!this.viewOptionsLoaded) return;
        setLocalSetting(this.$route.name, JSON.stringify(newVal));
      },
      deep: true,
    },
  },
  methods: {
    $_localFiltersStoreMixin_loadFilters () { // eslint-disable-line
      let filters = getLocalSetting(this.$route.name);
      filters = JSON.parse(filters);
      this.viewOptions = Object.assign({}, this.viewOptions, filters);
      this.viewOptionsLoaded = true;
    },
  },
};
