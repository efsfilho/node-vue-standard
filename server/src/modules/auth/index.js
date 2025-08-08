import { Router } from 'express'
import { ensureLoggedIn } from 'connect-ensure-login'
import {
  getLogin,
  postLogin,
  postLogOut,
  getSignUp,
  postSignUp,
  getIsAutheticated
} from './controller.js'

const router = Router()

router.get('/login', getLogin)
router.post('/login', postLogin)
router.post('/logout', postLogOut)
router.get('/signup', getSignUp)
router.post('/signup', postSignUp)
router.get('/is-authenticated', ensureLoggedIn(), getIsAutheticated)

export default router
