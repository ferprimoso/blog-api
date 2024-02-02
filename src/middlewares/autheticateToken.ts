import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../util/secrets'
import { type Request, type Response, type NextFunction } from 'express'

// Extend the existing Request interface to include the 'user' property
interface RequestWithUser extends Request {
  user?: {
    id: string
    username: string
    // Add other user properties as needed
  }
}

const authenticateToken = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization
  const token: string | undefined = authHeader?.split(' ')[1]

  if (token == null) {
    res.status(401).json({ msg: 'Acess Unauthorized' })
    return
  }

  jwt.verify(token, JWT_SECRET as jwt.Secret, (err: any, user: any) => {
    if (err !== null) {
      res.status(403).json({ msg: 'Access Forbidden' })
      return
    }

    req.user = user
    next()
  })
}

export default authenticateToken
