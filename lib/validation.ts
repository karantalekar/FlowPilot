import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').refine(
    email => email.split('@')[0].toLowerCase().includes('admin'),
    'Not authorized to sign up',
  ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const leadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']),
  value: z.number().optional(),
})

export const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'on-hold', 'completed']),
  startDate: z.string(),
  endDate: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type LeadInput = z.infer<typeof leadSchema>
export type ProjectInput = z.infer<typeof projectSchema>
