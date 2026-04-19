import { z } from 'zod'

export const createAssignmentSchema = z.object({
  employeeId: z.number({ error: 'employeeId krävs' }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum måste vara i formatet YYYY-MM-DD'),
  shift: z.enum(['MORNING', 'AFTERNOON', 'NIGHT']),
})

export const deleteAssignmentSchema = z.object({
  id: z.number({ error: 'id krävs' }),
})

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>