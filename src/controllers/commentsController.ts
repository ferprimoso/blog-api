import { Post } from '../models/Post'
import { Comment } from '../models/Comment'
import asyncHandler from 'express-async-handler'
import { type Request, type Response, type NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import mongoose from 'mongoose'

export const commentsController = {
  getAllPostComments: asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params

    // Check if postID is valid
    if (!mongoose.isValidObjectId(postId)) {
      res.status(400).json({ msg: 'Invalid request. Invalid postId' })
      return
    }

    const post = await Post.findById(postId)

    // Check if postId exists
    if (post === null) {
      res.status(404).json({ msg: 'Invalid request. Post not found' })
      return
    }

    const comments = await Comment.find({ postId })

    res.status(200).json(comments)
  }),

  createPostComment: [
    // Validate and sanitize fields.
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('text').trim().notEmpty().withMessage('Text is required').escape(),

    // Process request after validation and sanitization.
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
      } else {
        const { postId } = req.params

        const post = await Post.findById(postId)

        if (post === null) {
          // No results.
          res.status(404).json({ msg: 'Post not found' })
          return
        }

        const response = await Comment.create({ ...req.body, postId })
        res.status(201).json(response)
      }
    }),
  ],

  // Post method for creating a post
  likePostComment: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params
    const comment = await Comment.findById(commentId)

    if (comment === null) {
      // No results.
      const err = new Error('Comment not found')
      res.status(404)
      next(err)
      return
    }

    comment.like += 1

    // Save the updated comment
    await comment.save()
    res.json({ like: comment.like, msg: 'Comment disliked with success' })
  }),

  // Post method for disliking a comment
  dislikePostComment: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params
    const comment = await Comment.findById(commentId)

    if (comment === null) {
      // No results.
      const err = new Error('Comment not found')
      res.status(404)
      next(err)
      return
    }

    comment.dislike += 1

    // Save the updated comment
    await comment.save()
    res.json({ dislike: comment.dislike, msg: 'Comment disliked with success' })
  }),

  // Delete method for deleting a post
  deletePostComment: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if (deletedComment === null) {
      // No results.
      const err = new Error('Comment not found')
      res.status(404)
      next(err)
    }

    res.status(201).json({ msg: 'Comment deleted successfully' })
  }),
}
