import logger from './logger'
import dotenv from 'dotenv'

logger.debug('Using .env file to supply config environment variables')
dotenv.config({ path: '.env' })

export const ENVIRONMENT = process.env.NODE_ENV
export const JWT_SECRET = process.env.JWT_SECRET
export const MONGODB_URI = process.env.MONGODB_URI
