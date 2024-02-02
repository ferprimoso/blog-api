import express from 'express'
import supertest from 'supertest'
import * as dbhandler from './db-handler'
import router from '../router'
import { Post } from '../models/Post'
import { Auth } from '../models/Auth'
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

const authPayload = {
  username: 'testuser',
  password: 'testpassword',
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
  describe('Create a comment - POST /posts/:postId/comments', () => {
    it('Should create a comment', async () => {
      const post = await Post.create(postPayload)
      const postId = post._id.toString()

      const response = await supertest(app)
        .post('/api/posts/' + postId + '/comments')
        .send(commentPayload)

      expect(response.status).toBe(201)
      expect(response.body.name).toBe(commentPayload.name)
      expect(response.body.text).toBe(commentPayload.text)
    })
    it('Should return a 400 if payload is empty', async () => {
      const post = await Post.create(postPayload)
      const postId = post._id.toString()

      const response = await supertest(app)
        .post('/api/posts/' + postId + '/comments')
        .send({})

      expect(response.status).toBe(400) // Expecting a Bad Request status code
    })
    it('Should return a 400 if payload data is invalid', async () => {
      const post = await Post.create(postPayload)
      const postId = post._id.toString()

      const response = await supertest(app)
        .post('/api/posts/' + postId + '/comments')
        .send({
          name: null,
          text: null,
        })

      expect(response.status).toBe(400) // Expecting a Bad Request status code
      expect(response.body.errors).toHaveLength(2) // Expect all 2 fields to give error
      expect(response.body.errors[0].msg).toBe('Name is required')
    })
  })

  describe('Delete a comment - DELETE /posts/:postId/comments/:commentId/', () => {
    describe('User not authenticated', () => {
      it('Should return a 401 if theres no valid user token', async () => {
        const post = await Post.create(postPayload)
        const postId = post._id.toString()
        const comment = await Comment.create({ ...commentPayload, postId })
        const commentId = comment._id.toString()

        const response = await supertest(app).delete('/api/posts/' + postId + '/comments/' + commentId)

        expect(response.status).toBe(401)
      })
    })

    describe('User authenticated', () => {
      let authToken: string // Store the authentication token for an authorized user

      // Before all test, perform the login to obtain the authorization token
      beforeAll(async () => {
        await Auth.create(authPayload) // Populate DB with Mock user
        const response = await supertest(app).post('/api/login').send(authPayload)
        authToken = response.body.accessToken
      })

      it('Should delete a comment', async () => {
        // Create a comment to delete afterwards
        const post = await Post.create(postPayload)
        const postId = post._id.toString()
        const comment = await Comment.create({ ...commentPayload, postId })
        const commentId = comment._id.toString()

        const response = await supertest(app)
          .delete('/api/posts/' + postId + '/comments/' + commentId)
          .set('Authorization', `Bearer ${authToken}`)

        const deletedComment = await Comment.findById(commentId)

        expect(response.status).toBe(200)
        expect(deletedComment).toBeNull()
      })
      it('Should return a 400 if commentId is not valid', async () => {
        const postId = 'notvalidId'
        const commentId = 'notvalidId'

        const response = await supertest(app)
          .delete('/api/posts/' + postId + '/comments/' + commentId)
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(400)
      })
      it('Should return a 404 if comment dont exist', async () => {
        const postId = new mongoose.Types.ObjectId().toString()
        const commentId = new mongoose.Types.ObjectId().toString()

        const response = await supertest(app)
          .delete('/api/posts/' + postId + '/comments/' + commentId)
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(404)
      })
    })
  })

  describe('Like a comment - POST /posts/:postId/comments/:commentId/like', () => {
    it('Should increase the likes in a comment by one', async () => {
      const post = await Post.create(postPayload)
      const postId = post._id.toString()

      const comment = await Comment.create({ ...commentPayload, postId })
      const commentId = comment._id.toString()

      const response = await supertest(app).post('/api/posts/' + postId + '/comments/' + commentId + '/like')

      expect(response.status).toBe(200)
      expect(response.body.like).toBe(comment.like + 1)
    })
    it('Should return a 400 if commentId is not valid', async () => {
      const postId = 'notvalidId'
      const commentId = 'notvalidId'

      const response = await supertest(app).post('/api/posts/' + postId + '/comments/' + commentId + '/like')

      expect(response.status).toBe(400)
    })
    it('Should return a 404 if comment dont exist', async () => {
      const postId = new mongoose.Types.ObjectId().toString()
      const commentId = new mongoose.Types.ObjectId().toString()

      const response = await supertest(app).post('/api/posts/' + postId + '/comments/' + commentId + '/like')

      expect(response.status).toBe(404)
    })
  })

  describe('Dislike a comment - POST /posts/:postId/comments/:commentId/dislike', () => {
    it('Should increase the dislikes in a comment by one', async () => {
      const post = await Post.create(postPayload)
      const postId = post._id.toString()

      const comment = await Comment.create({ ...commentPayload, postId })
      const commentId = comment._id.toString()

      const response = await supertest(app).post('/api/posts/' + postId + '/comments/' + commentId + '/dislike')

      expect(response.status).toBe(200)
      expect(response.body.dislike).toBe(comment.dislike + 1)
    })
    it('Should return a 400 if commentId is not valid', async () => {
      const postId = 'notvalidId'
      const commentId = 'notvalidId'

      const response = await supertest(app).post('/api/posts/' + postId + '/comments/' + commentId + '/dislike')

      expect(response.status).toBe(400)
    })
    it('Should return a 404 if comment dont exist', async () => {
      const postId = new mongoose.Types.ObjectId().toString()
      const commentId = new mongoose.Types.ObjectId().toString()

      const response = await supertest(app).post('/api/posts/' + postId + '/comments/' + commentId + '/dislike')

      expect(response.status).toBe(404)
    })
  })
})
