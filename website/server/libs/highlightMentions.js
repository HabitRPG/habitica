import escapeRegExp from 'lodash/escapeRegExp';
import habiticaMarkdown from 'habitica-markdown';

import { model as User } from '../models/user';

const mentionRegex = /\B@[-\w]+/g;
const codeTokenTypes = ['code_block', 'code_inline', 'fence'];

/**
 * Container class for text blocks and code blocks combined
 * Blocks have the properties `text` and `isCodeBlock`
 */
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
function findCodeBlocks (tokens, aggregator) {
  const result = aggregator || [];
  const [head, ...tail] = tokens;
  if (!head) {
    return result;
  }

  if (codeTokenTypes.includes(head.type)) {
    result.push(head);
  }

  return findCodeBlocks(tail, head.children ? findCodeBlocks(head.children, result) : result);
}

/**
 * Since there are many factors that can prefix lines with indentation in
 * markdown, each line from a token's content needs to be prefixed with a
 * variable whitespace matcher.
 *
 * See for example: https://spec.commonmark.org/0.29/#example-224
 */
function withOptionalIndentation (content) {
  return content.split('\n').map(line => `\\s*${line}`).join('\n');
}

function createCodeBlockRegex ({ content, type, markup }) {
  const contentRegex = escapeRegExp(content);
  let regexStr = '';

  if (type === 'code_block') {
    regexStr = withOptionalIndentation(contentRegex);
  } else if (type === 'fence') {
    regexStr = `\\s*${markup}.*\n${withOptionalIndentation(contentRegex)}\\s*${markup}`;
  } else { // type === code_inline
    regexStr = `${markup} ?${contentRegex} ?${markup}`;
  }

  return new RegExp(regexStr);
}

/**
 * Uses habiticaMarkdown to determine what part of the text are code blocks
 * according to the specification here: https://spec.commonmark.org/0.29/
 */
function findTextAndCodeBlocks (text) {
  // For token description see https://markdown-it.github.io/markdown-it/#Token
  // The second parameter is mandatory even if not used, see
  // https://markdown-it.github.io/markdown-it/#MarkdownIt.parse
  const tokens = habiticaMarkdown.parse(text, {});
  const codeBlocks = findCodeBlocks(tokens);

  const blocks = [];
  let remainingText = text;
  codeBlocks.forEach(codeBlock => {
    const codeBlockRegex = createCodeBlockRegex(codeBlock);
    const match = remainingText.match(codeBlockRegex);

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

/**
 * Replaces `@user` mentions by `[@user](/profile/{user-id})` markup to inject
 * a link towards the user's profile page.
 * - Only works if there are no more that 5 user mentions
 * - Skips mentions in code blocks as defined by https://spec.commonmark.org/0.29/
 */
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
