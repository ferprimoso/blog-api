import express from 'express'
import posts from './posts'

const router = express.Router()

// Posts router
const postsRouter = posts

router.use('/posts', postsRouter)

export default router
