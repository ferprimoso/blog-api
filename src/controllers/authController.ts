import { Auth } from '../models/Auth'
import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { JWT_SECRET } from '../util/secrets'
import { type Request } from 'express'

interface RequestWithUser extends Request {
  user?: {
    id: string
    username: string
  }
}

export const authController = {
  login: [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),

    asyncHandler(async (req: RequestWithUser, res) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        res.status(401).json({ errors: errors.array() })
      } else {
        // If validation passes, proceed with authentication
        const username: string = req.body.username
        const password: string = req.body.password

        const auth = await Auth.findOne({ username })

        if (auth === null || !(await auth.isValidPassword(password))) {
          res.status(404).json({ msg: 'Invalid username or password' })
          return
        }

        const user = { username: auth.username }

        // User authenticated, generate a JWT
        const accessToken = jwt.sign(user, JWT_SECRET as jwt.Secret, { expiresIn: '1h' })

        res.status(200).json({ accessToken })
      }
    }),
  ],
}
