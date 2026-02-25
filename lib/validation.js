import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(1, "Description is required").max(2000, "Description cannot exceed 2000 characters"),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)),
  registrationDeadline: z.string().or(z.date()).transform((val) => new Date(val)),
  location: z.string().default("Virtual"),
  minTeamSize: z.number().min(1).default(2),
  maxTeamSize: z.number().min(1).default(4),
  tracks: z.array(z.string()).default([]),
  rules: z.array(z.string()).default([]),
  judges: z.array(z.string()).default([]), // IDs as strings
  mentors: z.array(z.string()).default([]), // IDs as strings
  isPublic: z.boolean().default(true),
});

export const participantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().optional(),
});
