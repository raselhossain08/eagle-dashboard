import { z } from 'zod'

export const DateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine(data => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return end > start
}, {
  message: "End date must be after start date"
})

export const EventTrendsParamsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  event: z.string().optional(),
  groupBy: z.enum(['hour', 'day', 'week', 'month']),
})

export const CreateFunnelSchema = z.object({
  name: z.string().min(1).max(100),
  steps: z.array(z.string().min(1)).min(2),
  description: z.string().max(500).optional(),
})

export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  try {
    return { success: true, data: schema.parse(data) } as const
  } catch (error) {
    return { success: false, error: error as z.ZodError } as const
  }
}