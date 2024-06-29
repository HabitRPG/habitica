<template>
  <div class="top-container mx-auto">
    <div class="main-text mr-4 col-8">
      <!-- title -->
      <div
        class="title-details"
        role="tablist"
      >
        <div class="body-text">
          <h1
            v-once
            id="faq-heading"
          >
            {{ $t('frequentlyAskedQuestions') }}
          </h1>
          <!-- subheadings -->
          <div
            v-for="(entry, index) in faq.questions"
            :key="index"
            class="body-text"
          >
            <h2
              v-if="index === 0"
              v-once
            >
              {{ $t('commonQuestions') }}
            </h2>
            <h2
              v-if="entry.heading === 'play-with-others'"
              v-once
              id="parties"
            >
              {{ $t('parties') }}
            </h2>
            <h2
              v-if="entry.heading === 'what-is-group-plan'"
              v-once
              id="group-plans"
            >
              {{ $t('groupPlan') }}
            </h2>
            <!-- entry header -->
            <h3
              v-once
              v-b-toggle="entry.heading"
              role="tab"
              variant="info"
              class="headings"
              @click="handleClick($event)"
            >
              {{ entry.question }}
            </h3>
            <b-collapse
              :id="entry.heading"
              :visible="isVisible(entry.heading)"
              accordion="faq"
              role="tabpanel"
            >
              <!-- questions -->
              <div
                v-once
                v-markdown="entry.web"
                class="card-body p-0 pb-3"
              ></div>
            </b-collapse>
          </div>
        </div>
      </div>
    </div>
    <faq-sidebar />
  </div>
</template>

<style lang="scss" scoped>
  @import '~@/assets/scss/faq.scss';
</style>

<script>
import FaqSidebar from '@/components/shared/faqSidebar';
import markdownDirective from '@/directives/markdown';

export default {
  components: {
    FaqSidebar,
  },
  directives: {
    markdown: markdownDirective,
  },
  data () {
    return {
      faq: {},
      headings: [],
      stillNeedHelp: '',
    };
  },
  async mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('help'),
      subSection: this.$t('faq'),
    });
    this.faq = await this.$store.dispatch('faq:getFAQ');
    for (const entry of this.faq.questions) {
      this.headings.push(entry.heading);
    }
    this.stillNeedHelp = this.faq.stillNeedHelp.web;
    document.body.style.background = '#ffffff';
  },
  methods: {
    isVisible (heading) {
      const hash = window.location.hash.replace('#', '');
      return hash && this.headings.includes(hash) && hash === heading;
    },
    handleClick (e) {
      if (!e) return;
      const heading = e.target.nextElementSibling.id;
      window.history.pushState({}, heading, `#${heading}`);
    },
  },
};
</script>
