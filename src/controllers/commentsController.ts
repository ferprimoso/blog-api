import { Post } from '../models/Post'
import { Comment } from '../models/Comment'
import asyncHandler from 'express-async-handler'
import { type Request, type Response, type NextFunction } from 'express'

export const commentsController = {
  // Get method for reading all posts
  getAllPostComments: asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params
    const comments = await Comment.find({ postId })
    res.json(comments)
  }),

  // Post method for creating a post
  createPostComment: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params

    const post = await Post.findById(postId)

    if (post === null) {
      // No results.
      const err = new Error('Post not found')
      res.status(404)
      next(err)
      return
    }

    const response = await Comment.create({ ...req.body, postId })
    res.status(201).json(response)
  }),

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
