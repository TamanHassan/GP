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
router.get('/', getAssignments)
router.post('/', createAssignment)
router.delete('/:id', deleteAssignment)

export default router