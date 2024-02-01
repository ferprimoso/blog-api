import express from 'express'
import cors from 'cors'
import compression from 'compression'
import mongoose from 'mongoose'
import { MONGODB_URI } from './util/secrets'
import router from './router'

// import cors from 'cors'

// Create Express Server
const app = express()

// Connect to MongoDB
const mongoUrl = MONGODB_URI

main().catch((err) => {
  console.log(err)
})
async function main(): Promise<void> {
  if (mongoUrl === undefined) {
    throw new Error('MongoDB connection URL is undefined')
  }
  await mongoose.connect(mongoUrl)
}

// Express Configuration
app.set('port', process.env.PORT ?? 3000)
app.use(cors())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api', router)

export default app
