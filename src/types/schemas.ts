// MCP Tool input/output schemas using Zod

import { z } from 'zod';

// Schema for date range queries
export const DateRangeInputSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional()
});

// Schema for database metadata queries
export const DatabaseMetadataInputSchema = z.object({
  databaseType: z.enum(["timesheets", "activities", "responsibilities", "topics", "all"]).default("all")
});

// Episode metrics accepted by startTimesheet and endTimesheet
export const episodeMetricsShape = {
  weight: z.number().min(0).max(1).optional()
    .describe("Share (0-1) of the row's wall-clock time that counts; overlapping rows split their overlap"),
  activeMin: z.number().int().min(0).optional()
    .describe("Minutes the work item was actually frontmost"),
  interruptions: z.number().int().min(0).optional()
    .describe("Count of hops away that returned to the work item"),
  switches: z.number().int().min(0).optional()
    .describe("App/context changes inside the episode"),
  evidence: z.string().min(1).optional()
    .describe("Free-text evidence for the episode (top contexts with minutes, per-client split). Plain text, not the Evidence database"),
};

// Schema for starting timesheet
export const StartTimesheetInputSchema = z.object({
  description: z.string().min(1, "Description is required"),
  activityId: z.string().optional(),
  topicId: z.string().optional(),
  client: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format").optional(),
  ...episodeMetricsShape
});

// Schema for ending timesheet
export const EndTimesheetInputSchema = z.object({
  timesheetId: z.string().min(1, "Timesheet ID is required"),
  mood: z.string().min(1).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format").optional(),
  ...episodeMetricsShape
});

// Schema for updating timesheet mood
export const UpdateTimesheetMoodInputSchema = z.object({
  timesheetId: z.string().min(1, "Timesheet ID is required"),
  mood: z.string().min(1, "Mood is required")
});

// Schema for search queries
export const SearchInputSchema = z.object({
  searchText: z.string().optional()
});

// Schema for creating new topic/responsibility
export const CreateTopicInputSchema = z.object({
  name: z.string().min(1, "Topic name is required"),
  description: z.string().optional()
});

// Schema for creating new activity
export const CreateActivityInputSchema = z.object({
  name: z.string().min(1, "Activity name is required"),
  description: z.string().optional(),
  responsibilityId: z.string().optional()
});

// Schema for updating activity
export const UpdateActivityInputSchema = z.object({
  activityId: z.string().min(1, "Activity ID is required"),
  name: z.string().min(1, "Activity name is required").optional(),
  description: z.string().optional(),
  responsibilityId: z.string().optional()
});

// Schema for searching competencies
export const SearchCompetenciesInputSchema = z.object({
  searchText: z.string().optional()
});

// Schema for creating evidence
export const CreateEvidenceInputSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  whatHappened: z.string().min(1, "What happened description is required"),
  competencyIds: z.array(z.string()).optional(),
  topicIds: z.array(z.string()).optional()
});

// Schema for updating evidence
export const UpdateEvidenceInputSchema = z.object({
  evidenceId: z.string().min(1, "Evidence ID is required"),
  summary: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional(),
  whatHappened: z.string().optional(),
  competencyIds: z.array(z.string()).optional(),
  topicIds: z.array(z.string()).optional()
});

// Schema for searching evidence
export const SearchEvidenceInputSchema = z.object({
  searchText: z.string().optional(),
  competencyId: z.string().optional(),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional()
});

// Schema for getting evidence details
export const GetEvidenceInputSchema = z.object({
  evidenceId: z.string().min(1, "Evidence ID is required")
});

export type DateRangeInput = z.infer<typeof DateRangeInputSchema>;
export type DatabaseMetadataInput = z.infer<typeof DatabaseMetadataInputSchema>;
export type StartTimesheetInput = z.infer<typeof StartTimesheetInputSchema>;
export type EndTimesheetInput = z.infer<typeof EndTimesheetInputSchema>;
export type UpdateTimesheetMoodInput = z.infer<typeof UpdateTimesheetMoodInputSchema>;
export type SearchInput = z.infer<typeof SearchInputSchema>;
export type CreateTopicInput = z.infer<typeof CreateTopicInputSchema>;
export type CreateActivityInput = z.infer<typeof CreateActivityInputSchema>;
export type UpdateActivityInput = z.infer<typeof UpdateActivityInputSchema>;
export type SearchCompetenciesInput = z.infer<typeof SearchCompetenciesInputSchema>;
export type CreateEvidenceInput = z.infer<typeof CreateEvidenceInputSchema>;
export type UpdateEvidenceInput = z.infer<typeof UpdateEvidenceInputSchema>;
export type SearchEvidenceInput = z.infer<typeof SearchEvidenceInputSchema>;
export type GetEvidenceInput = z.infer<typeof GetEvidenceInputSchema>;