import _ from 'lodash';
import * as js2xml from 'js2xmlparser';

export function marshallUserData (userData) {
  // object maps can't be marshalled to XML
  userData.inbox.messages = _(userData.inbox.messages)
    .map(m => {
      m.flags = Object.keys(m.flags);
      return m;
    })
    .value();

  userData.newMessages = _.map(userData.newMessages, (msg, id) => ({ id, ...msg }));

  // _id gets parsed as a bytearray => which gets cast to a chararray => "weird chars"
  userData.unpinnedItems = userData.unpinnedItems.map(i => ({
    path: i.path,
    type: i.type,
  }));

  userData.pinnedItems = userData.pinnedItems.map(i => ({
    path: i.path,
    type: i.type,
  }));

  return js2xml.parse('user', userData, {
    cdataInvalidChars: true,
    declaration: {
      include: false,
    },
  });
}
