import mongoose from 'mongoose'
import { Post } from '../models/Post'
import { Comment } from '../models/Comment'
import asyncHandler from 'express-async-handler'
import { type Request, type Response, type NextFunction } from 'express'

export const postsController = {
  // Get method for reading all posts
  getAllPosts: asyncHandler(async (req: Request, res: Response) => {
    const posts = await Post.find()
    res.json(posts)
  }),

  // Post method for creating a post
  createPost: asyncHandler(async (req: Request, res: Response) => {
    const response = await Post.create(req.body)
    res.status(201).json(response)
  }),

  // Delete method for deleting a post
  deletePost: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params

    if (!mongoose.isValidObjectId(postId)) {
      // No valid results
      const err = new Error('Invalid request. Invalid postId')
      res.status(400).json({ err })
    }

    const deletedPost = await Post.findByIdAndDelete(postId)

    if (deletedPost === null) {
      // No results.
      const error = new Error('Invalid request. Post not found')
      res.status(404) // using response here
      next(error)
      return // Use return to exit the function after sending the response
    }

    await Comment.deleteMany({ postId })

    res.status(200).json({ msg: 'Post and associated comments deleted successfully' })
  }),
}
