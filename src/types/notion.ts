// Notion API types and interfaces

export interface NotionProperty {
  id: string;
  type: string;
}

export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, any>;
}

export interface NotionDatabase {
  id: string;
  title: Array<{
    type: string;
    text: {
      content: string;
    };
  }>;
  properties: Record<string, NotionProperty>;
}

export interface NotionQueryResponse {
  results: NotionPage[];
  next_cursor?: string;
  has_more: boolean;
}

// Timesheet-specific interfaces
export interface TimesheetEntry {
  id: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  activities: ActivityDetails[];
  topics: string[];
  mood: string;
}

export interface ActivityDetails {
  id: string;
  name: string;
  responsibility: ResponsibilityDetails | null;
}

export interface ResponsibilityDetails {
  id: string;
  name: string;
}

export interface DatabaseMetadata {
  id: string;
  title: string;
  properties: Record<string, NotionProperty>;
}