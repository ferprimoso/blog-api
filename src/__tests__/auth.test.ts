import express from 'express'
import supertest from 'supertest'
import * as dbhandler from './db-handler'
import router from '../router'
import { Auth } from '../models/Auth'

// Configuration
const app = express()
app.use(express.json())
app.use('/api', router)

// Payload
const authPayload = {
  username: 'testuser',
  password: 'testpassword',
}

// Tests
describe('Auth', () => {
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

  describe('Auth Login - POST /login', () => {
    it('Should return a 401 if username or password fields are empty', async () => {
      const response = await supertest(app).post('/api/login')

      expect(response.status).toBe(401)
    })
    it('Should return a 404 if username doesnt exist', async () => {
      await Auth.create(authPayload) // Populate DB with Mock user

      const response = await supertest(app).post('/api/login').send({
        username: 'un_user',
        password: 'un_pass',
      })
      expect(response.status).toBe(404)
    })
    it('Should return a 404 if password is invalid', async () => {
      await Auth.create(authPayload) // Populate DB with Mock user

      // send mock user with invalid password
      const response = await supertest(app).post('/api/login').send({
        username: authPayload.username,
        password: 'invalid_pass',
      })
      expect(response.status).toBe(404)
    })
    it('Should return a 200 and acessstoken if valid user and password ', async () => {
      await Auth.create(authPayload) // Populate DB with Mock user

      // send mock user with invalid password
      const response = await supertest(app).post('/api/login').send(authPayload)

      expect(response.status).toBe(200)
      expect(response.body.accessToken).toBeDefined()
    })
  })
})
