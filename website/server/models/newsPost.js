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

schema.statics.getLastPost = async function getLastPost () {
  const post = await this.findOne({
    published: true,
    publishDate: { $lte: new Date() },
  }).sort({ publishDate: -1 }).exec();

  return post;
};

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

schema.statics.lastNewsPost = function lastNewsPost () {
  return cachedLastNewsPost;
};

schema.statics.updateLastNewsPost = function updateLastNewsPost (newPost) {
  if (
    (!cachedLastNewsPost || cachedLastNewsPost._id !== newPost._id)
    && (!cachedLastNewsPost || cachedLastNewsPost.publishDate < newPost.publishDate)
  ) {
    cachedLastNewsPost = newPost;
  }
};

export const model = mongoose.model('NewsPost', schema);

function getAndUpdateLastNewsPost () {
  model.getLastPost().then(lastPost => {
    if (lastPost) {
      model.updateLastNewsPost(lastPost);
    }
  }).catch(err => logger.error(err));
}

setInterval(() => getAndUpdateLastNewsPost(), NEWS_CACHE_TIME);
getAndUpdateLastNewsPost();
