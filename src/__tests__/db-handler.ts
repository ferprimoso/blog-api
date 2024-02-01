// tests/db-handler.js
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongod: null | MongoMemoryServer = null

/**
 * Connect to the in-memory database.
 */
export const connect = async (): Promise<void> => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
}

/**
 * Drop database, close the connection and stop mongod.
 */
export const closeDatabase = async (): Promise<void> => {
  if (mongod !== null) {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongod.stop()
  }
}

/**
 * Remove all the data for all db collections.
 */
export const clearDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections

  for (const key in collections) {
    const collection = collections[key]
    if (collection !== undefined) {
      await collection.deleteMany()
    }
  }
}
