import * as userService from './service.js'
import logger from '../../utils/logger.js'
import { body, validationResult } from 'express-validator'
import { config } from '../../config/server.js'

// body('password').isStrongPassword({
//   minLength: 8,
//   minLowercase: 1,
//   minUppercase: 1,
//   minNumbers: 1,
//   minSymbols: 1,
//   returnScore: false,
//   pointsPerUnique: 1,
//   pointsPerRepeat: 0.5,
//   pointsForContainingLower: 10,
//   pointsForContainingUpper: 10,
//   pointsForContainingNumber: 10,
//   pointsForContainingSymbol: 10,
// })

const userValidator = body('username').isString().trim()
const passValidator = body('password').isString()
const nameValidatior = body('name').optional().trim()
const emailValidator = body('email').trim().isEmail()

const checkPostUserPayload = (req, res, next) => {
  try {
    const result = validationResult(req)
    if (!result.isEmpty()) {
      const fields = result.errors.flatMap(e => e.path)

      let msg = ''
      if (fields.length === 1) {
        msg = fields[0]+' invalid'
      } else {
        msg = 'Fields '+fields.join(', ')+' are required'
      }

      res.status(400).json({ detail: msg })
    } else {
      next()
    }
  } catch (err) {
    logger.error('validationResult', result)
    logger.info('User creation payload validation:')
    next(err)
  }
}

export const createUser = async (req, res, next) => {
  try {
    const { username, name, email, password } = req.body

    const existingUser = await userService.getUserByUsername(username)
    if (existingUser) {
      return res.status(409).json({
        detail: 'This username already exists'
      })
    }

    if (!config.users.allowWithSameEmail) {
      // TODO add unique constraint to the table
      const existingUser = await userService.getUserByEmail(email)
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' })
      }
    }

    const newUser = await userService.createUser({ username, name, email, password })
    res.status(201).json(newUser)
  } catch (err) {
    logger.info('Error creating user:')
    next(err)
  }
}

export const postUser = [
  userValidator,
  passValidator,
  nameValidatior,
  emailValidator,
  checkPostUserPayload,
  createUser
]

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers()
    res.json(users)
  } catch (err) {
    logger.error('Error fetching users:')
    next(err)
  }
}

export const getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id)
    if (!user) {
      return res.status(404).json({
        detail: 'User not found'
      })
    }
    res.json(user)
  } catch (err) {
    logger.info('Error fetching user:')
    next(err)
  }
}

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { username, name, email, password } = req.body

    // if (!name || !email || !password) {
    //   return res.status(400).json({
    //     detail: 'Name, email, and password are required'
    //   })
    // }

    // Check if user exists
    const existingUser = await userService.getUserById(id)
    if (!existingUser) {
      return res.status(404).json({
        detail: 'User not found'
      })
    }

    // Check if username is being changed to an existing username
    if (username !== existingUser.username) {
      const userWithUsername = await userService.getUserByUsername(username)
      if (userWithUsername) {
        return res.status(409).json({
          detail: 'This username already exists'
        })
      }
    }

    if (!config.users.allowWithSameEmail) {
      // Check if email is being changed to an existing email
      if (email !== existingUser.email) {
        const userWithNewEmail = await userService.getUserByEmail(email)
        if (userWithNewEmail) {
          return res.status(409).json({
            detail: 'Email already in use by another user'
          })
        }
      }
    }

    const updatedUser = await userService.updateUser(parseInt(id), { username, name, email, password })
    res.json(updatedUser)
    // res.json({sad:""})
  } catch (err) {
    logger.info('Error updating user:')
    next(err)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    // Check if user exists
    const existingUser = await userService.getUserById(id)
    if (!existingUser) {
      return res.status(404).json({
        detail: 'User not found'
      })
    }

    await userService.deleteUser(id)
    res.status(204).end()
  } catch (err) {
    logger.info('Error deleting user:')
    next(err)
  }
}

export const patchUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const updates = req.body

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        detail: 'At least one field to update is required'
      })
    }

    const existingUser = await userService.getUserById(id)
    if (!existingUser) {
      return res.status(404).json({ detail: 'User not found' })
    }

    // Only allow specific fields to be updated
    const allowedFields = userService.ALLOWED_FIELDS
    const receivedFields = Object.keys(updates)
    const invalidFields = receivedFields.filter(f => !allowedFields.includes(f))

    if (invalidFields.length > 0) {
      let invalidFieldsMsg = ''
      if (invalidFields.length === 1) {
        invalidFieldsMsg = 'Invalid field: '+invalidFields[0]
      } else {
        invalidFieldsMsg = 'Invalid fields: '+invalidFields.join(', ')
      }
      return res.status(400).json({ 
        detail: `${invalidFieldsMsg}. Only ${allowedFields.join(', ')} can be updated.`
      })
    }

    // If username is being updated, check if it's already in use
    if (updates.username && updates.username !== existingUser.username) {
      const userWithUsername = await userService.getUserByUsername(updates.username)
      if (userWithUsername) {
        return res.status(409).json({
          detail: 'This username already exists'
        })
      }
    }

    if (!config.users.allowWithSameEmail) {
      // If email is being updated, check if it's already in use
      if (updates.email && updates.email !== existingUser.email) {
        const userWithNewEmail = await userService.getUserByEmail(updates.email)
        if (userWithNewEmail) {
          return res.status(409).json({
            detail: 'Email already in use by another user'
          })
        }
      }
    }

    const updatedUser = await userService.partialUpdateUser(id, updates)
    res.json(updatedUser)
    
  } catch (err) {
    logger.info('Error while patching user:')
    if (err.message === 'User not found') {
      return res.status(404).json({ detail: err.message })
    }
    if (err.message === 'No valid fields to update') {
      return res.status(400).json({ detail: err.message })
    }
    next(err)
  }
}