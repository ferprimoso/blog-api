import express from 'express'

// import controller modules
import { postsController } from './controllers/postsController'
import { commentsController } from './controllers/commentsController'

const router = express.Router()

// Posts Routes
router.get('/posts', postsController.getAllPosts)

router.post('/posts', postsController.createPost)

router.delete('/posts/:postId/', postsController.deletePost)

// Comments Routes
router.get('/posts/:postId/comments', commentsController.getAllPostComments)

router.post('/posts/:postId/comments', commentsController.createPostComment)

router.delete('/posts/:postId/comments/:commentId/', commentsController.deletePostComment)

router.post('/posts/:postId/comments/:commentId/like', commentsController.likePostComment)

router.post('/posts/:postId/comments/:commentId/dislike', commentsController.dislikePostComment)

export default router
