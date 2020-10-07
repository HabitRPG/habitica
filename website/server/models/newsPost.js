import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';
import logger from '../libs/logger';

const { Schema } = mongoose;
const POSTS_PER_PAGE = 10;

export const schema = new Schema({
  title: { $type: String, required: true },
  text: { $type: String, required: true },
  credits: { $type: String, required: true },
  author: { $type: String, ref: 'User', required: true },
  publishDate: { $type: Date, required: true, default: Date.now },
  published: { $type: Boolean, required: true, default: false },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  noSet: ['_id', 'author'],
  timestamps: true,
});

schema.statics.getNews = async function getNews (isAdmin, options = { page: 0 }) {
  let query;
  if (!isAdmin) {
    query = this.find({
      published: true,
      publishDate: { $lte: new Date() },
    });
  } else {
    query = this.find();
  }

  let page = 0;
  if (typeof options.page !== 'undefined') {
    page = options.page;
  }

  return query
    .sort({ publishDate: -1 })
    .limit(POSTS_PER_PAGE)
    .skip(POSTS_PER_PAGE * Number(page))
    .exec();
};

const NEWS_CACHE_TIME = 5 * 60 * 1000;

let cachedLastNewsPost = null;

schema.statics.getLastPostFromDatabase = async function getLastPostFromDatabase () {
  const post = await this.findOne({
    published: true,
    publishDate: { $lte: new Date() },
  }).sort({ publishDate: -1 }).exec();

  return post;
};

schema.statics.lastNewsPost = function lastNewsPost () {
  return cachedLastNewsPost;
};

schema.statics.updateLastNewsPost = function updateLastNewsPost (newPost) {
  const isSame = !cachedLastNewsPost ? false : cachedLastNewsPost._id === newPost._id;
  const isPublished = newPost.published;
  const isNewer = !cachedLastNewsPost ? true : cachedLastNewsPost.publishDate < newPost.publishDate;
  const isInFuture = newPost.publishDate > (new Date());
  if (
    isSame // if the same post it could have been updated
    || (isPublished && isNewer && !isInFuture)
  ) {
    cachedLastNewsPost = newPost;
  }
};

export const model = mongoose.model('NewsPost', schema);

function getAndUpdateLastNewsPost () {
  model.getLastPostFromDatabase().then(lastPost => {
    if (lastPost) {
      model.updateLastNewsPost(lastPost);
    }
  }).catch(err => logger.error(err));
}

export function refreshNewsPost (interval) {
  return setInterval(() => getAndUpdateLastNewsPost(), interval);
}

// Fetches the last news post and refresh it every 5 minutes
getAndUpdateLastNewsPost();
refreshNewsPost(NEWS_CACHE_TIME);
