import { Router } from 'express'
import { ensureLoggedIn } from 'connect-ensure-login'
import {
  postUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  patchUser
} from './controller.js'

const router = Router()

// router.post('/', postUser)
router.post('/', postUser)
router.get('/', getUsers)
router.get('/:id', getUser)
router.put('/:id', updateUser)
router.patch('/:id', patchUser)
router.delete('/:id', deleteUser)

export default router