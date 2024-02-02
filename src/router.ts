import express from 'express'

// import controller modules
import { postsController } from './controllers/postsController'
import { commentsController } from './controllers/commentsController'
import { authController } from './controllers/authController'

// import authentication middleware
import authenticateToken from './middlewares/autheticateToken'

const router = express.Router()

// Auth Routes
router.post('/login', authController.login)

// Posts Routes
router.get('/posts', postsController.getAllPosts)

router.post('/posts', authenticateToken, postsController.createPost)

router.delete('/posts/:postId/', authenticateToken, postsController.deletePost)

// Comments Routes
router.get('/posts/:postId/comments', commentsController.getAllPostComments)

router.post('/posts/:postId/comments', commentsController.createPostComment)

router.delete('/posts/:postId/comments/:commentId/', authenticateToken, commentsController.deletePostComment)

router.post('/posts/:postId/comments/:commentId/like', commentsController.likePostComment)

router.post('/posts/:postId/comments/:commentId/dislike', commentsController.dislikePostComment)

export default router
