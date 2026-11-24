import nconf from 'nconf';
import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';
import { registerReloader, reload, invalidate } from '../libs/cacheInvalidation';

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
    .lean()
    .exec();
};

const NEWS_CACHE_TIME = nconf.get('NEWS_CACHE_RELOAD_INTERVAL') || 30 * 60 * 1000;

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

const NEWS_CACHE_TYPE = 'news';

async function reloadLastNewsPost () {
  cachedLastNewsPost = await model.getLastPostFromDatabase();
}

registerReloader(NEWS_CACHE_TYPE, reloadLastNewsPost, { interval: NEWS_CACHE_TIME });

export function reloadLastNewsPostNow () {
  return reload(NEWS_CACHE_TYPE);
}

export function invalidateLastNewsPost () {
  return invalidate(NEWS_CACHE_TYPE);
}

reloadLastNewsPostNow();
