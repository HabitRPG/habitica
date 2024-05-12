<template>
  <div
    v-if="filtersConversations.length > 0"
    class="conversations"
  >
    <conversation-item
      v-for="conversation in filtersConversations"
      :key="conversation.key"
      :active-key="selectedConversation?.key"
      :contributor="conversation.contributor"
      :backer="conversation.backer"
      :uuid="conversation.key"
      :display-name="conversation.name"
      :username="conversation.username"
      :last-message-date="conversation.date"
      :last-message-text="conversation.lastMessageText
        ? removeTags(parseMarkdown(conversation.lastMessageText)) : ''"
      @click="selectConversation(conversation.key)"
    />
  </div>
</template>

<style scoped lang="scss">
  .conversations {
    overflow-x: hidden;
    overflow-y: auto;
    height: 100%;
  }
</style>

<script>

import { defineComponent } from 'vue';
import habiticaMarkdown from 'habitica-markdown';
import conversationItem from '@/pages/private-messages/pm-conversation-item.vue';

export default defineComponent({
  components: { conversationItem },
  props: {
    filtersConversations: {
      type: Array,
      default: () => [],
    },
    selectedConversation: {
      type: Object,
      default: null,
    },
  },
  methods: {
    removeTags (html) {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    },
    parseMarkdown (text) {
      if (!text) return null;
      return habiticaMarkdown.render(String(text));
    },
    selectConversation (conversationKey) {
      this.$emit('selectConversation', conversationKey);
    },
  },
});
</script>
