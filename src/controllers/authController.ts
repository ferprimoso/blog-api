import { Auth } from '../models/Auth'
import asyncHandler from 'express-async-handler'
import { type Request, type Response, type NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import mongoose from 'mongoose'

export const authController = {
  login: [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),

    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        res.status(401).json({ errors: errors.array() })
      } else {
        // If validation passes, proceed with authentication
      }
    }),
  ],
}
