import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const Schema = mongoose.Schema

const AuthSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})

AuthSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
    return
  }
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    console.error('Error: ', error)
  }
})

// Export model
export const Auth = mongoose.model('Auth', AuthSchema)
