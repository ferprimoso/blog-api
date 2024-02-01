import express from 'express'
import cors from 'cors'
import compression from 'compression'
import mongoose from 'mongoose'
import { MONGODB_URI } from './util/secrets'
import logger from './util/logger'
import router from './router'
import helmet from 'helmet'

// Create Express Server
const app = express()

// Connect to MongoDB
if (MONGODB_URI !== undefined) {
  mongoose
    .connect(MONGODB_URI, { retryWrites: true, w: 'majority' })
    .then(() => {
      logger.info('Connected to mongoDB')
    })
    .catch((error) => {
      logger.error('Unable to connect: ')
      logger.error(error)
    })
} else {
  logger.error('MongoDB connection URL is undefined')
}

// Express Configuration
app.set('port', process.env.PORT ?? 3000)
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(cors())

// Routes
app.use('/api', router)

// Error handler
app.use((req, res, next) => {
  const error = new Error(' not found')
  logger.error(error)

  return res.status(404).json({ message: error.message })
})

export default app
