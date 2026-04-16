import { Router } from 'express';
import { authenticate } from "../middleware/auth.middleware.js";
import { requireEmployer } from "../middleware/role.middleware.js";
import {
  getAssignments,
  createAssignment,
  deleteAssignment,
} from './assignment.controller.js'

const router = Router()

router.use(authenticate, requireEmployer)

router.get('/assignments', getAssignments)

router.post('/assignments', createAssignment)

router.delete('/assignments/:id', deleteAssignment)

export default router