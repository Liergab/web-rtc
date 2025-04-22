import { z } from 'zod';

// Address schema
const addressSchema = z.object({
  street: z.string().optional(),
  barangay: z.string().optional(),
  city: z.string().optional(),
  municipality: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
});

// Base user schema for creation
export const createUserSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['user', 'admin', 'vendor']).default('user'),
  address: addressSchema.optional(),
});

// Schema for updating user information
export const updateUserSchema = createUserSchema.partial();

// Schema for user login
export const loginUserSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Schema for password reset request
export const passwordResetRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
});

// Schema for password reset
export const passwordResetSchema = z.object({
  token: z.string(),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Schema for email verification
export const verifyEmailSchema = z.object({
  token: z.string(),
});

// Type definitions derived from Zod schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>; 