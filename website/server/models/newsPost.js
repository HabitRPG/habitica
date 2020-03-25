import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';

const { Schema } = mongoose;
const POSTS_PER_PAGE = 10;

export const schema = new Schema({
  title: { $type: String },
  author: { $type: String },
  credits: { $type: String },
  publishDate: { $type: Date },
  published: { $type: Boolean },
  text: { $type: String },
}, {
  strict: true,
  minimize: false, // So empty objects are returned
  typeKey: '$type', // So that we can use fields named `type`
});

schema.plugin(baseModel, {
  noSet: ['_id'],
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
    })
      .select('title publishDate credits text');
  } else {
    query = this.find();
  }
  let page = 0;
  if (typeof options.page !== 'undefined') {
    page = options.page;
  }

  return query.sort({ publishDate: -1 })
    .limit(POSTS_PER_PAGE)
    .skip(POSTS_PER_PAGE * Number(page))
    .exec();
};

const NEWS_CACHE_TIME = 5 * 60 * 1000;

let cachedLastNewsPost = null;
let timeStampCachedLastNews = null;

schema.statics.lastNewsPost = async function lastNewsPost () {
  if (!cachedLastNewsPost || (new Date() - timeStampCachedLastNews) > NEWS_CACHE_TIME) {
    const lastPost = await this.getLastPost();
    if (lastPost) {
      await this.updateLastNewsPost(lastPost);
    }
  }
  return cachedLastNewsPost;
};

schema.statics.updateLastNewsPost = async function updateLastNewsPost (newPost) {
  if (!cachedLastNewsPost || cachedLastNewsPost.id !== newPost.id) {
    if (!cachedLastNewsPost || cachedLastNewsPost.publishDate < newPost.publishDate) {
      cachedLastNewsPost = newPost;
      timeStampCachedLastNews = new Date();
    }
  }
};

export const model = mongoose.model('NewsPost', schema);
