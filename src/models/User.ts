import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
  } catch (error) {
    return next(error)
  }
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Export model
export const User = mongoose.model('User', UserSchema)
