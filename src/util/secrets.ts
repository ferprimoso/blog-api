import logger from './logger'
import dotenv from 'dotenv'

logger.debug('Using .env file to supply config environment variables')
dotenv.config({ path: '.env' })

export const ENVIRONMENT = process.env.NODE_ENV

// export const SESSION_SECRET = process.env.SESSION_SECRET
export const MONGODB_URI = process.env.MONGODB_URI
