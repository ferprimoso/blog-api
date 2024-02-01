import express from 'express'
import supertest from 'supertest'
import * as dbhandler from './db-handler'
import router from '../router'
import { Post } from '../models/Post'
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

// Tests
describe('Posts', () => {
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

  describe('GET /posts', () => {
    it('Should return an empty array if theres no posts', async () => {
      const response = await supertest(app).get('/api/posts')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(0)
    })
    it('Should return an array of posts if theres posts', async () => {
      await Post.create(postPayload)
      await Post.create(postPayload)

      const response = await supertest(app).get('/api/posts')

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(2)
    })
  })

  describe('POST /posts', () => {
    it('Should create a post', async () => {
      const response = await supertest(app).post('/api/posts').send(postPayload)

      expect(response.status).toBe(201)
      expect(response.body.author).toBe(postPayload.author)
      expect(response.body.title).toBe(postPayload.title)
    })
    xit('Should handle empty post request', async () => {
      const response = await supertest(app).post('/api/posts').send({})

      expect(response.status).toBe(400) // Expecting a Bad Request status code
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Invalid request. Missing required data.')
    })
  })

  describe('DELETE /posts/:postId', () => {
    it('Should delete a post', async () => {
      const post = await Post.create(postPayload)
      const postIdToDelete = post._id.toString()

      const response = await supertest(app).delete('/api/posts/' + postIdToDelete)

      expect(response.status).toBe(200)
    })
    it('Should return a 404 if post doesnt exist', async () => {
      const postIdToDelete = new mongoose.Types.ObjectId().toString()

      console.log(postIdToDelete)

      const response = await supertest(app).delete('/api/posts/' + postIdToDelete)

      expect(response.status).toBe(404)
    })
  })
})
