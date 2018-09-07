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

export let model = mongoose.model('NewsPost', schema);
