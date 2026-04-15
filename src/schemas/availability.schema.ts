import { z } from 'zod'

export const updateAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  dayStatus: z.enum(['AVAILABLE', 'UNAVAILABLE']),
  preferMorning: z.boolean().optional().default(false),
  preferAfternoon: z.boolean().optional().default(false),
  preferNight: z.boolean().optional().default(false),
})

export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>
