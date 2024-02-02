import express from 'express'
import supertest from 'supertest'
import * as dbhandler from './db-handler'
import router from '../router'
import { Post } from '../models/Post'
import mongoose from 'mongoose'
import { Auth } from '../models/Auth'

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

const authPayload = {
  username: 'testuser',
  password: 'testpassword',
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

  describe('Get all posts - GET /posts', () => {
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

  describe('Create new post - POST /posts', () => {
    describe('User not authenticated', () => {
      it('Should return a 401 if theres no valid user token', async () => {
        const response = await supertest(app).post('/api/posts')

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

      it('Should create a post', async () => {
        const response = await supertest(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(postPayload)

        expect(response.status).toBe(201)
        expect(response.body.author).toBe(postPayload.author)
        expect(response.body.title).toBe(postPayload.title)
      })
      it('Should create a post', async () => {
        const response = await supertest(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(postPayload)

        expect(response.status).toBe(201)
        expect(response.body.author).toBe(postPayload.author)
        expect(response.body.title).toBe(postPayload.title)
      })
      it('Should return a 400 if payload is empty', async () => {
        const response = await supertest(app).post('/api/posts').set('Authorization', `Bearer ${authToken}`).send({})

        expect(response.status).toBe(400) // Expecting a Bad Request status code
      })
      it('Should return a 400 if payload data is invalid', async () => {
        const response = await supertest(app).post('/api/posts').set('Authorization', `Bearer ${authToken}`).send({
          author: '',
          title: '',
          text: '',
        }) // all fields empty

        expect(response.status).toBe(400) // Expecting a Bad Request status code
        expect(response.body.errors).toHaveLength(3) // Expect all 3 fields to give error
        expect(response.body.errors[0].msg).toBe('Author is required')
      })
    })
  })

  describe('Delete post by ID - DELETE /posts/:postId', () => {
    describe('User not authenticated', () => {
      // User not Logged
      it('Should return a 401 if theres no valid user token', async () => {
        const post = await Post.create(postPayload)
        const postIdToDelete = post._id.toString()

        const response = await supertest(app).delete('/api/posts/' + postIdToDelete)

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

      it('Should delete a post', async () => {
        const post = await Post.create(postPayload)
        const postIdToDelete = post._id.toString()
        const response = await supertest(app)
          .delete('/api/posts/' + postIdToDelete)
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(200)
      })
      it('Should return a 400 if postId is not valid', async () => {
        const postIdToDelete = 'notvalidId'
        const response = await supertest(app)
          .delete('/api/posts/' + postIdToDelete)
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(400)
      })
      it('Should return a 404 if postId is not found', async () => {
        const postIdToDelete = new mongoose.Types.ObjectId().toString()
        const response = await supertest(app)
          .delete('/api/posts/' + postIdToDelete)
          .set('Authorization', `Bearer ${authToken}`)

        expect(response.status).toBe(404)
      })
    })
  })
})
