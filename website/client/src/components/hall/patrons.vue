<template>
  <div class="row">
    <small class="muted">{{ $t('blurbHallPatrons') }}</small>
    <div class="table-responsive">
      <table
        class="table table-striped"
        infinite-scroll="loadMore()"
      >
        <thead>
          <tr>
            <th>{{ $t('name') }}</th>
            <th v-if="user.contributor.admin">
              {{ $t('UUID') }}
            </th>
            <th>{{ $t('backerTier') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="patron in patrons"
            :key="patron._id"
          >
            <td>
              <a
                v-class="userLevelStyle(patron)"
                class="label label-default"
                @click="clickMember(patron._id, true)"
              ></a>
              {{ patron.profile.name }}
            </td>
            <td v-if="user.contributor.admin">
              {{ patron._id }}
            </td>
            <td>{{ patron.backer.tier }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState } from '@/libs/store';
import styleHelper from '@/mixins/styleHelper';

export default {
  mixins: [styleHelper],
  data () {
    return {
      patrons: [],
    };
  },
  computed: {
    ...mapState({ user: 'user.data' }),
  },
  async mounted () {
    this.patrons = await this.$store.dispatch('hall:getPatrons', { page: 0 });
  },
  methods: {
    //  @TODO: Import member modal - clickMember()
  },
};
</script>
