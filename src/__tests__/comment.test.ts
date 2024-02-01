import express from 'express'
import supertest from 'supertest'
import * as dbhandler from './db-handler'
import router from '../router'
import { Post } from '../models/Post'
import { Comment } from '../models/Comment'
import mongoose from 'mongoose'

// Configuration
const app = express()
app.use(express.json())
app.use('/api', router)

// Payload
const postPayload = {
  author: 'John Smith',
  title: 'Test Title',
  text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto sequi adipisci eveniet aliquid? Deserunt ea assumenda dolore cupiditate voluptatem laborum adipisci. Qui, hic. Dolores natus fugit deleniti, quod autem nihil.',
}

const commentPayload = {
  name: 'Arthur Smith',
  text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto sequi adipisci eveniet aliquid? Deserunt ea assumenda dolore cupiditate voluptatem laborum adipisci. Qui, hic. Dolores natus fugit deleniti, quod autem nihil.',
}

// Tests
describe('Comments', () => {
  // Connect to memory Server before running any test.
  beforeAll(async () => {
    await dbhandler.connect()
  })

  // Clear all test data after every test
  afterEach(async () => {
    await dbhandler.clearDatabase()
  })

  // Disconnect from memory Server after Test
  afterAll(async () => {
    await dbhandler.closeDatabase()
  })

  describe('Get all comments - GET /posts/:postId/comments', () => {
    it('Should return an empty array if theres no comments', async () => {
      const post = await Post.create(postPayload)
      const postId = post._id.toString()

      const response = await supertest(app).get('/api/posts/' + postId + '/comments')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(0)
    })
    it('Should return an array of comments if theres comments', async () => {
      const post = await Post.create(postPayload)
      const postId = post._id.toString()

      // Create two comments in the post
      await Comment.create({ ...commentPayload, postId })
      await Comment.create({ ...commentPayload, postId })

      const response = await supertest(app).get('/api/posts/' + postId + '/comments')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(2)
    })
    it('Should return a 400 if postId is not valid', async () => {
      const postId = 'notvalidId'
      const response = await supertest(app).get('/api/posts/' + postId + '/comments')

      expect(response.status).toBe(400)
    })
    it('Should return a 404 if postId is not found', async () => {
      const postId = new mongoose.Types.ObjectId().toString()

      const response = await supertest(app).get('/api/posts/' + postId + '/comments')

      expect(response.status).toBe(404)
    })
  })
})
