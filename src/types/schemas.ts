// MCP Tool input/output schemas using Zod

import { z } from 'zod';

// Schema for date range queries
export const DateRangeInputSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional()
});

// Schema for database metadata queries
export const DatabaseMetadataInputSchema = z.object({
  databaseType: z.enum(["timesheets", "activities", "responsibilities", "all"]).default("all")
});

// Schema for starting timesheet
export const StartTimesheetInputSchema = z.object({
  description: z.string().min(1, "Description is required"),
  activityId: z.string().optional(),
  topicId: z.string().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format").optional()
});

// Schema for ending timesheet
export const EndTimesheetInputSchema = z.object({
  timesheetId: z.string().min(1, "Timesheet ID is required"),
  mood: z.string().min(1, "Mood is required"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format").optional()
});

// Schema for updating timesheet mood
export const UpdateTimesheetMoodInputSchema = z.object({
  timesheetId: z.string().min(1, "Timesheet ID is required"),
  mood: z.string().min(1, "Mood is required")
});

// Schema for search queries
export const SearchInputSchema = z.object({
  searchText: z.string().min(1, "Search text is required")
});

export type DateRangeInput = z.infer<typeof DateRangeInputSchema>;
export type DatabaseMetadataInput = z.infer<typeof DatabaseMetadataInputSchema>;
export type StartTimesheetInput = z.infer<typeof StartTimesheetInputSchema>;
export type EndTimesheetInput = z.infer<typeof EndTimesheetInputSchema>;
export type UpdateTimesheetMoodInput = z.infer<typeof UpdateTimesheetMoodInputSchema>;
export type SearchInput = z.infer<typeof SearchInputSchema>;