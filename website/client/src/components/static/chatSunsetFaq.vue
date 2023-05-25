<template>
  <div class="container-fluid">
    <div class="row">
      <div>
        <h1>{{ $t('sunsetFaqTitle') }}</h1>
      </div>
      <div>
        <p v-html="$t('sunsetFaqPara1')"></p>  <!-- there's html in here -->
        <p>{{ $t('sunsetFaqPara2') }}</p>
        <p>{{ $t('sunsetFaqPara3') }}</p>
        <p>{{ $t('sunsetFaqPara4') }}</p>
        <p>{{ $t('sunsetFaqPara5') }}</p>
      </div>

      <!-- Which services are ending -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader1') }}
        </h3>
      </div>
      <div>
        <p v-html="$t('sunsetFaqPara6')"></p>
      </div>

      <!-- Why are tavern and guild ending? -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader2') }}
        </h3>
      </div>
      <div>
        <ul>
          <li>{{ $t('sunsetFaqList1') }}</li>
          <li>{{ $t('sunsetFaqList2') }}</li>
          <li>{{ $t('sunsetFaqList3') }}</li>
        </ul>
      </div>

      <!-- Can I still talk to my party/group members? -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader3') }}
        </h3>
      </div>
      <div>
        <p>{{ $t('sunsetFaqPara7') }}</p>
      </div>

      <!-- Pausing dailies -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader4') }}
        </h3>
      </div>
      <div>
        <p>{{ $t('sunsetFaqPara8') }}</p>
      </div>

      <!-- Accessing group plans -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader5') }}
        </h3>
      </div>
      <div>
        <p v-html="$t('sunsetFaqPara9')"></p> <!-- there's html in here -->
      </div>

      <!-- Can I access guild chats? -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader6') }}
        </h3>
      </div>
      <div>
        <p>{{ $t('sunsetFaqPara10') }}</p>
      </div>

      <!-- How can players find groups? -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader7') }}
        </h3>
      </div>
      <div>
        <p>{{ $t('sunsetFaqPara11') }}</p>
      </div>

      <!-- What about contributors? -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader8') }}
        </h3>
      </div>
      <div>
        <p v-html="$t('sunsetFaqPara12')"></p> <!-- there's html in here -->
        <p v-html="$t('sunsetFaqPara13')"></p> <!-- there's html in here -->
        <p v-html="$t('sunsetFaqPara14')"></p> <!-- there's html in here -->
        <p v-html="$t('sunsetFaqPara15')"></p> <!-- there's html in here -->
        <p v-html="$t('sunsetFaqPara16')"></p> <!-- there's html in here -->
        <p v-html="$t('sunsetFaqPara17')"></p> <!-- there's html in here -->
        <p v-html="$t('sunsetFaqPara18')"></p> <!-- there's html in here -->
        <p v-html="$t('sunsetFaqPara19')"></p> <!-- there's html in here -->
      </div>

      <!-- Challenges -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader9') }}
        </h3>
      </div>
      <div>
        <ul>
          <li>{{ $t('sunsetFaqList4') }}</li>
          <li>{{ $t('sunsetFaqList5') }}</li>
          <li>{{ $t('sunsetFaqList6') }}</li>
          <li>{{ $t('sunsetFaqList7') }}</li>
        </ul>
      </div>

      <!-- Questions about how to use Habitica -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader10') }}
        </h3>
      </div>
      <div>
        <li v-html="$t('sunsetFaqList8')"></li> <!-- there's html in here -->
        <li v-html="$t('sunsetFaqList9')"></li> <!-- there's html in here -->
        <li v-html="$t('sunsetFaqList10')"></li> <!-- there's html in here -->
      </div>

      <!-- Community Guidelines and TOS -->
      <div>
        <h3 class="headings">
          {{ $t('sunsetFaqHeader11') }}
        </h3>
      </div>
      <div>
        <p v-html="$t('sunsetFaqPara20')"></p>
      </div>
    </div>

    <!-- sidebar -->
    <!-- staff -->
    <div class="col-12 col-sm-4 sidebar">
      <div class="section">
        <div class="px-4">
          <sidebar-section :title="$t('staff')" />
          <div class="row">
            <div
              v-for="user in staff"
              :key="user.uuid"
              class="col-6 staff"
              :class="{
                staff: user.type === 'Staff',}"
            >
              <div>
                <router-link
                  class="title"
                  :to="{'name': 'userProfile', 'params': {'userId': user.uuid}}"
                >
                  {{ user.name }}
                </router-link>
                <div
                  v-if="user.type === 'Staff'"
                  class="svg-icon staff-icon"
                  v-html="icons.tierStaff"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- final div! -->
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/colors.scss';
  @import '~@/assets/scss/mixins.scss';

  .headings {
    font-size: 16px; // for some reason, em doesn't give the desired result
    font-weight: 400;
    line-height: 1.75;
    color: $purple-200;
  }

  .sidebar {
    background-color: $gray-600;
    padding: 0 0 0 0;
  }

</style>

<script>
import sidebarSection from '../sidebarSection';

export default {
  componenets: {
    sidebarSection,
  },

  async mounted () {
    this.$store.dispatch('common:setTitle', {
      subSection: this.$t('chat-sunset-faq'),
    });
  },
};
</script>
