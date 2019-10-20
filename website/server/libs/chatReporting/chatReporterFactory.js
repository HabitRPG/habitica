import GroupChatReporter from './groupChatReporter';
import InboxChatReporter from './inboxChatReporter';

export function chatReporterFactory (type, req, res) { // eslint-disable-line import/prefer-default-export, max-len
  if (type === 'Group') {
    return new GroupChatReporter(req, res);
  } if (type === 'Inbox') {
    return new InboxChatReporter(req, res);
  }

  throw new Error('Invalid chat reporter type.');
}
