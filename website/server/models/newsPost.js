import mongoose from 'mongoose';
import baseModel from '../libs/baseModel';

const Schema = mongoose.Schema;

export let schema = new Schema({
  title: {type: String, required: true},
  credits: {type: String, required: true},
  publishDate: {type: Date, required: true},
  published: {type: Boolean, required: true},
  text: {type: String, required: true},
}, {
  strict: true,
  minimize: false, // So empty objects are returned
});

schema.plugin(baseModel, {
  noSet: ['_id'],
  timestamps: true,
});

schema.statics.getNews = async function getNews (isAdmin) {
  let posts = [];
  if (!isAdmin) {
    posts = this.find({published: true,
                       publishDate: { $lte: Date() }})
      .select('title publishDate credits text');
  } else {
    posts = this.find();
  }
  return posts.sort({publishDate: -1});
};

let cachedLastNewsPostID = null;
let cachedLastNewsPostDate = null;

schema.statics.lastNewsPostID = async function lastNewsPostID () {
  if (cachedLastNewsPostID === null) {
    const lastPost = (await this.getNews(false))[0];
    if (lastPost !== undefined && lastPost !== null) {
      cachedLastNewsPostID = lastPost.id;
      cachedLastNewsPostDate = lastPost.publishDate;
    }
  }
  return cachedLastNewsPostID;
};

schema.statics.updateLastNewsPostID = async function updateLastNewsPostID (newID, newDate) {
  if (cachedLastNewsPostID !== newID) {
    if (cachedLastNewsPostDate === undefined || cachedLastNewsPostDate < newDate) {
      cachedLastNewsPostID = newID;
      cachedLastNewsPostDate = newDate;
    }
  }
};

export let model = mongoose.model('NewsPost', schema);
