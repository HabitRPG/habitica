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
              role="tab"
              tabindex="0"
              class="headings"
              :aria-expanded="openHeading === entry.heading ? 'true' : 'false'"
              :aria-controls="entry.heading"
              @click="toggle(entry.heading)"
              @keydown.enter.space.prevent="toggle(entry.heading)"
            >
              {{ entry.question }}
            </h3>
            <collapse
              :id="entry.heading"
              :visible="openHeading === entry.heading"
              role="tabpanel"
            >
              <!-- questions -->
              <div
                v-once
                v-markdown="entry.web"
                class="card-body p-0 pb-3"
              ></div>
            </collapse>
          </div>
        </div>
      </div>
    </div>
    <faq-sidebar />
  </div>
</template>

<style lang="scss" scoped>
  @import '@/assets/scss/faq.scss';
</style>

<script>
import collapse from '@/components/ui/collapse';
import FaqSidebar from '@/components/shared/faqSidebar';
import markdownDirective from '@/directives/markdown';

export default {
  components: {
    collapse,
    FaqSidebar,
  },
  directives: {
    markdown: markdownDirective,
  },
  data () {
    return {
      faq: {},
      openHeading: null,
      stillNeedHelp: '',
    };
  },
  async mounted () {
    this.$store.dispatch('common:setTitle', {
      section: this.$t('help'),
      subSection: this.$t('faq'),
    });
    this.faq = await this.$store.dispatch('faq:getFAQ');
    const hash = window.location.hash.replace('#', '');
    if (this.faq.questions.some(entry => entry.heading === hash)) this.openHeading = hash;
    this.stillNeedHelp = this.faq.stillNeedHelp.web;
    document.body.style.background = '#ffffff';
  },
  methods: {
    toggle (heading) {
      this.openHeading = this.openHeading === heading ? null : heading;
      window.history.pushState({}, heading, `#${heading}`);
    },
  },
};
</script>
