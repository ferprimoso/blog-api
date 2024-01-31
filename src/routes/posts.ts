import express from 'express'

// import controller modules
import { postsController } from '../controllers/postsController'
const router = express.Router()

// API routes

// Posts Routes
router.get('/', postsController.getAllPosts)

router.post('/', postsController.createPost)

router.delete('/:postId/', postsController.deletePost)

// Comments Routes
router.get('/:postId/comments', postsController.getAllPostComments)

router.post('/:postId/comments', postsController.createPostComment)

router.delete('/:postId/comments/:commentId/', postsController.deletePostComment)

router.post('/:postId/comments/:commentId/like', postsController.likePostComment)

router.post('/:postId/comments/:commentId/dislike', postsController.dislikePostComment)

export default router
