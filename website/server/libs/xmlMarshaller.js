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

  const copyUserData = JSON.parse(JSON.stringify(userData));

  const newPurchased = {};
  if (userData.purchased != null) {
    for (const itemType in userData.purchased) {
      if (userData.purchased[itemType] != null) {
        if (typeof userData.purchased[itemType] === 'object') {
          const fixedData = [];
          for (const item in userData.purchased[itemType]) {
            if (item != null) {
              if (typeof userData.purchased[itemType][item] === 'object') {
                fixedData.push({ item: userData.purchased[itemType][item] });
              } else {
                fixedData.push(item);
              }
            }
          }
          newPurchased[itemType] = fixedData;
        } else {
          newPurchased[itemType] = userData.purchased[itemType];
        }
      }
    }
    copyUserData.purchased = newPurchased;
  }

  return js2xml.parse('user', copyUserData, {
    cdataInvalidChars: true,
    replaceInvalidChars: true,
    declaration: {
      include: false,
    },
  });
}
