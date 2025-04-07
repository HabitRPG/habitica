// This file is just to improve the dev-experiences when working with untyped js classes
// These Types don't have to have all properties (for now) but should be extended once the
// type is used in any new method

interface InboxMessage {
  id: string;
  uniqueMessageId: string;
  likes: {
    [userId: string]: boolean
  }
}
