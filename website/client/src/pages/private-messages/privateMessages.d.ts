export namespace PrivateMessages {
  // Shared properties between message types
  interface SharedMessageProps {
    username: string;
    contributor: Record<string, unknown>;
    userStyles: Record<string, unknown>;
    canReceive: boolean;
  }

  /**
   * This is the Type we get from our API
   */
  interface ConversationSummaryMessageEntry extends SharedMessageProps {
    uuid: string;
    user: string;

    timestamp: string;
    text: string;
    count: number;
  }

  /**
   * The Visual (Sidebar) Entry
   */
  interface ConversationEntry extends SharedMessageProps {
    /**
     * UUID
     */
    key: string;
    name: string;


    lastMessageText: '',
    canLoadMore: boolean;
    page: 0
  }

  /**
   * Loaded Private Messages, partial type
   */
  interface PrivateMessageEntry extends SharedMessageProps {
    text: string;
  }
}
