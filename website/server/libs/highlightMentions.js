import escapeRegExp from 'lodash/escapeRegExp';
import habiticaMarkdown from 'habitica-markdown';

import { model as User } from '../models/user';
import logger from './logger';

const mentionRegex = /\B@[-\w]+/g;
const ignoreTokenTypes = ['code_block', 'code_inline', 'fence', 'link_open'];

/**
 * Container class for valid text blocks and text blocks that should be ignored.
 * Blocks have the properties `text` and `ignore`
 */
class TextBlocks {
  constructor (blocks) {
    this.blocks = blocks;
    this.validBlocks = blocks.filter(block => !block.ignore);
    this.allValidText = this.validBlocks.map(block => block.text).join('\n');
  }

  transformValidBlocks (transform) {
    this.validBlocks.forEach(block => {
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
function findIgnoreBlocks (tokens) {
  // Links span multiple tokens, so keep local state of whether we're in a link
  let inLink = false;

  function recursor (ts, result) {
    const [head, ...tail] = ts;
    if (!head) {
      return result;
    }

    if (!inLink && ignoreTokenTypes.includes(head.type)) {
      result.push(head);
    }

    if (head.type.includes('link')) {
      inLink = !inLink;
    } else if (inLink && head.type === 'text') {
      const linkBlock = result[result.length - 1];
      linkBlock.textContents = (linkBlock.textContents || []).concat(head.content);
    }

    return recursor(tail, head.children ? recursor(head.children, result) : result);
  }

  return recursor(tokens, []);
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

/* This is essentially a workaround around the fact that markdown-it doesn't
 * provide sourcemap functionality and is the most brittle part of this code.
 *
 * Known errors (Not supported markdown link variants):
 * - [a](<b)c>) https://spec.commonmark.org/0.29/#example-489
 * - [link](\(foo\)) https://spec.commonmark.org/0.29/#example-492
 * - [link](foo(and(bar))) https://spec.commonmark.org/0.29/#example-493
 * - [link](foo\(and\(bar\)) https://spec.commonmark.org/0.29/#example-494
 * - [link](<foo(and(bar)>) https://spec.commonmark.org/0.29/#example-495
 * - [link](foo\)\:) https://spec.commonmark.org/0.29/#example-496
 */
function toSourceMapRegex (token) {
  const { type, content, markup } = token;
  const contentRegex = escapeRegExp(content);
  let regexStr = '';

  if (type === 'code_block') {
    regexStr = withOptionalIndentation(contentRegex);
  } else if (type === 'fence') {
    regexStr = `\\s*${markup}.*\n${withOptionalIndentation(contentRegex)}\\s*${markup}`;
  } else if (type === 'code_inline') {
    regexStr = `${markup} ?${contentRegex} ?${markup}`;
  } else if (type === 'link_open') {
    const texts = token.textContents ? token.textContents.map(escapeRegExp) : [''];
    regexStr = markup === 'linkify' || markup === 'autolink' ? texts[0]
      : `\\[[^\\]]*${texts.join('[^\\]]*')}[^\\]]*\\]\\([^)]*\\)`;
  } else {
    throw new Error(`No source mapping regex defined for ignore blocks of type ${type}`);
  }

  return new RegExp(regexStr, 's');
}

/**
 * Uses habiticaMarkdown to determine which text blocks should be ignored (links and code blocks)
 * according to the specification here: https://spec.commonmark.org/0.29/
 */
function findTextBlocks (text) {
  // For token description see https://markdown-it.github.io/markdown-it/#Token
  // The second parameter is mandatory even if not used, see
  // https://markdown-it.github.io/markdown-it/#MarkdownIt.parse
  const tokens = habiticaMarkdown.parse(text, {});
  const ignoreBlockRegexes = findIgnoreBlocks(tokens).map(toSourceMapRegex);

  const blocks = [];
  let index = 0;
  ignoreBlockRegexes.forEach(regex => {
    const targetText = text.substr(index);
    const match = targetText.match(regex);

    if (!match) {
      logger.error(
        new Error('Failed to match source-mapping regex to find ignore block'),
        { text, targetText, regex: String(regex) },
      );
      return;
    }

    if (match.index) {
      blocks.push({ text: targetText.substr(0, match.index), ignore: false });
    }

    blocks.push({ text: match[0], ignore: true });
    index += match.index + match[0].length;
  });

  if (index < text.length) {
    blocks.push({ text: text.substr(index), ignore: false });
  }

  return new TextBlocks(blocks);
}

function determineBaseUrl () {
  // eslint-disable-next-line no-process-env
  return process.env.NODE_ENV === 'production' ? 'https://habitica.com' : '';
}

/**
 * Replaces `@user` mentions by `[@user](/profile/{user-id})` markup to inject
 * a link towards the user's profile page.
 * - Only works if there are no more that 5 user mentions
 * - Skips mentions in code blocks as defined by https://spec.commonmark.org/0.29/
 * - Skips mentions in links
 */
export default async function highlightMentions (text) {
  const textBlocks = findTextBlocks(text);

  const mentions = textBlocks.allValidText.match(mentionRegex);
  let members = [];

  if (mentions && mentions.length <= 5) {
    const usernames = mentions.map(mention => mention.substr(1));
    members = await User
      .find({ 'auth.local.username': { $in: usernames }, 'flags.verifiedUsername': true })
      .select(['auth.local.username', '_id', 'preferences.pushNotifications', 'pushDevices', 'party', 'guilds'])
      .lean()
      .exec();
    const baseUrl = determineBaseUrl();
    members.forEach(member => {
      const { username } = member.auth.local;
      const regex = new RegExp(`@${username}(?![\\-\\w])`, 'g');
      const replacement = `[@${username}](${baseUrl}/profile/${member._id})`;

      textBlocks.transformValidBlocks(blockText => blockText.replace(regex, replacement));
    });
  }

  return [textBlocks.rebuild(), mentions, members];
}
