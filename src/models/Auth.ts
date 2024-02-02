import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

export interface AuthDocument extends mongoose.Document {
  username: string
  password: string
  isValidPassword: (candidatePassword: string) => Promise<boolean>
}

const AuthSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})

AuthSchema.pre('save', async function (next) {
  const auth = this as AuthDocument

  if (!auth.isModified('password')) {
    next()
    return
  }
  try {
    auth.password = await bcrypt.hash(auth.password, 10)
    next()
  } catch (error) {
    console.error('Error: ', error)
  }
})

AuthSchema.methods.isValidPassword = async function (candidatePassword: string): Promise<boolean> {
  const auth = this as AuthDocument

  return await bcrypt.compare(candidatePassword, auth.password)
}

// Export model
export const Auth = mongoose.model<AuthDocument>('Auth', AuthSchema)
