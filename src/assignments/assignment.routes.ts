// src/routes/assignment.routes.ts

import { Router } from 'express'
import { authenticate, requireEmployer } from '../middleware/auth.middleware'
import {
  getAssignments,
  createAssignment,
  deleteAssignment,
} from '../controllers/assignment.controller'

const router = Router()

router.use(authenticate, requireEmployer)

router.get('/assignments', getAssignments)

router.post('/assignments', createAssignment)

router.delete('/assignments/:id', deleteAssignment)

export default router