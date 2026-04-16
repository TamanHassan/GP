import express from 'express'
import { getMyAvailability, updateMyAvailability, getAllEmployeesAvailability } from './availability.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireEmployer } from '../middleware/role.middleware.js'

const router = express.Router()

router.get('/me', authenticate, getMyAvailability)
router.put('/me', authenticate, updateMyAvailability)
router.get('/all', authenticate, requireEmployer, getAllEmployeesAvailability)

export default router
