import GroupChatReporter from './groupChatReporter';
import InboxChatReporter from './inboxChatReporter';

export function chatReporterFactory (type, req, res) {
  if (type === 'Group') {
    return new GroupChatReporter(req, res);
  } else if (type === 'Inbox') {
    return new InboxChatReporter(req, res);
  }
}
