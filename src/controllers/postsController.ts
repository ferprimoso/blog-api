import { type Request, type Response, type NextFunction } from 'express'
import asyncHandler from 'express-async-handler'
import { body, validationResult } from 'express-validator'
import mongoose from 'mongoose'
import { Post } from '../models/Post'
import { Comment } from '../models/Comment'

export const postsController = {
  getAllPosts: asyncHandler(async (req: Request, res: Response) => {
    const posts = await Post.find()
    res.json(posts)
  }),

  createPost: [
    // Validate and sanitize fields.
    body('author').trim().notEmpty().withMessage('Author is required').escape(),
    body('title').trim().notEmpty().withMessage('Title is required').escape(),
    body('text').trim().notEmpty().withMessage('Text is required').escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req: Request, res: Response) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
      } else {
        const response = await Post.create(req.body)

        res.status(201).json(response)
      }
    }),
  ],

  deletePost: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params

    if (!mongoose.isValidObjectId(postId)) {
      // No valid results
      res.status(400).json({ msg: 'Invalid request. Invalid postId' })
      return
    }

    const deletedPost = await Post.findByIdAndDelete(postId)

    if (deletedPost === null) {
      // No results.
      res.status(404).json({ msg: 'Invalid request. Post not found' })
      return
    }

    await Comment.deleteMany({ postId })

    res.status(200).json({ msg: 'Post and associated comments deleted successfully' })
  }),
}
