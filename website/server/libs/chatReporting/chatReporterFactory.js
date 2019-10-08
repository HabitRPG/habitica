import GroupChatReporter from './groupChatReporter';
import InboxChatReporter from './inboxChatReporter';

export function chatReporterFactory (type, req, res) {
  if (type === 'Group') {
    return new GroupChatReporter(req, res);
  } if (type === 'Inbox') {
    return new InboxChatReporter(req, res);
  }
}
