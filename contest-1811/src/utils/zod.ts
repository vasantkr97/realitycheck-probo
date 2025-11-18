import type { create } from 'domain'
import { z } from 'zod'

export const signupSchema = z.object({
    email: z.email("Invlaid email address"),
    password: z.string().min(8, "password must be at least 8 characters"),
    name: z.string().min(2, "Name must be at least 2 characters.")
})

export const signinSchema = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password is required")
})

export const createTodoSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
})

export const updateTodoSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
})

export type signupInput = z.infer<typeof signupSchema>
export type signinInput = z.infer<typeof signinSchema>
export type createTodoInput = z.infer<typeof createTodoSchema>
export type updateTodoInput = z.infer<typeof updateTodoSchema>