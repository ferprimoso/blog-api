import logger from './logger'
import dotenv from 'dotenv'

logger.debug('Using .env file to supply config environment variables')
dotenv.config({ path: '.env' })

// env
export const ENVIRONMENT = process.env.NODE_ENV
// MongodbURI
export const MONGODB_URI = process.env.MONGODB_URI
// Secret Key
export const JWT_SECRET = process.env.JWT_SECRET

if (JWT_SECRET === null) {
  logger.error('No JWT Secret. Set JWT_SECRET environment ')
  process.exit(1)
}
