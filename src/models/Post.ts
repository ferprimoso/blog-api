import mongoose from 'mongoose'
const Schema = mongoose.Schema

const PostSchema = new Schema({
  author: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
})

// Export model
export const Post = mongoose.model('Post', PostSchema)
