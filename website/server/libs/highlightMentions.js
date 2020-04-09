import habiticaMarkdown from 'habitica-markdown';

import { model as User } from '../models/user';

const mentionRegex = /\B@[-\w]+/g;

class TextWithCodeBlocks {
  constructor (blocks) {
    this.blocks = blocks;
    this.textBlocks = blocks.filter(block => !block.isCodeBlock);
    this.allText = this.textBlocks.map(block => block.text).join('\n');
  }

  transformTextBlocks (transform) {
    this.textBlocks.forEach(block => {
      block.text = transform(block.text);
    });
  }

  rebuild () {
    return this.blocks.map(block => block.text).join('');
  }
}

/**
 * Since tokens have both order and can be nested until infinite depth,
 * use a branching recursive algorithm to maintain order and check all tokens.
 */
function findCodeBlocks (tokens) {
  function recurse (ts, result) {
    const [head, ...tail] = ts;

    if (!head) {
      return result;
    }

    if (head.type === 'code_block'
        || head.type === 'code_inline'
        || head.type === 'fence'
    ) {
      result.push(head);
    }

    return recurse(tail, head.children ? recurse(head.children, result) : result);
  }

  return recurse(tokens, []);
}

function withOptionalIndentation (content) {
  return content.split('\n').map(line => `\\s*${line}`).join('\n');
}

function createRegex ({ content, type, markup }) {
  let regexStr = '';

  if (type === 'code_block') {
    regexStr = withOptionalIndentation(content);
  } else if (type === 'fence') {
    regexStr = (`${withOptionalIndentation(markup)}.*\n${
      withOptionalIndentation(content + markup)}`);
  } else { //  type == code_inline
    regexStr = `${markup} ?${content} ?${markup}`;
  }

  return new RegExp(regexStr);
}

function findTextAndCodeBlocks (text) {
  // For token description see https://markdown-it.github.io/markdown-it/#Token
  const tokens = habiticaMarkdown.parse(text);
  const codeBlocks = findCodeBlocks(tokens);

  const blocks = [];
  let remainingText = text;
  codeBlocks.forEach(codeBlock => {
    const regex = createRegex(codeBlock);
    const match = remainingText.match(regex);

    if (match.index) {
      blocks.push({ text: remainingText.substr(0, match.index), isCodeBlock: false });
    }
    blocks.push({ text: match[0], isCodeBlock: true });

    remainingText = remainingText.substr(match.index + match[0].length);
  });

  if (remainingText) {
    blocks.push({ text: remainingText, isCodeBlock: false });
  }
  return new TextWithCodeBlocks(blocks);
}

export default async function highlightMentions (text) {
  const textAndCodeBlocks = findTextAndCodeBlocks(text);

  const mentions = textAndCodeBlocks.allText.match(mentionRegex);
  let members = [];

  if (mentions && mentions.length <= 5) {
    const usernames = mentions.map(mention => mention.substr(1));
    members = await User
      .find({ 'auth.local.username': { $in: usernames }, 'flags.verifiedUsername': true })
      .select(['auth.local.username', '_id', 'preferences.pushNotifications', 'pushDevices', 'party', 'guilds'])
      .lean()
      .exec();
    members.forEach(member => {
      const { username } = member.auth.local;
      const regex = new RegExp(`@${username}(?![\\-\\w])`, 'g');
      const replacement = `[@${username}](/profile/${member._id})`;

      textAndCodeBlocks.transformTextBlocks(blockText => blockText.replace(regex, replacement));
    });
  }

  return [textAndCodeBlocks.rebuild(), mentions, members];
}
