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
      .skip(POSTS_PER_PAGE * Number(options.page))
      .exec();
};

let cachedLastNewsPostID = null;
let cachedLastNewsPostDate = null;
let cachedLastNewsPostTitle = null;

schema.statics.lastNewsPostID = async function lastNewsPostID () {
  if (cachedLastNewsPostID === null) {
    const lastPost = (await this.getLastPost());
    if (lastPost) {
      cachedLastNewsPostID = lastPost.id;
      cachedLastNewsPostDate = lastPost.publishDate;
    }
  }
  return cachedLastNewsPostID;
};

schema.statics.lastNewsPostTitle = async function lastNewsPostTitle () {
  if (cachedLastNewsPostTitle === null) {
    const lastPost = (await this.getLastPost());
    if (lastPost) {
      cachedLastNewsPostTitle = lastPost.title;
    }
  }
  return cachedLastNewsPostTitle;
};

schema.statics.updateLastNewsPost = async function updateLastNewsPost (newPost) {
  if (cachedLastNewsPostID !== newPost.id) {
    if (cachedLastNewsPostDate === undefined || cachedLastNewsPostDate < newPost.publishDate) {
      cachedLastNewsPostID = newPost.id;
      cachedLastNewsPostDate = newPost.publishDate;
      cachedLastNewsPostTitle = newPost.title;
    }
  }
};

export const model = mongoose.model('NewsPost', schema);
