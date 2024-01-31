import mongoose from 'mongoose'
const Schema = mongoose.Schema

const CommentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true }, // reference to the associated post
  name: { type: String, required: true },
  text: { type: String, required: true },
  like: { type: Number, required: true, default: 0 },
  dislike: { type: Number, required: true, default: 0 },
  date: { type: Date, default: Date.now },
})

// Export model
export const Comment = mongoose.model('Comment', CommentSchema)
