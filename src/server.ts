import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from the project root, regardless of where this script is run from
// Suppress dotenv output to avoid interfering with MCP JSON communication
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../..', '.env');

// Temporarily capture stdout to suppress dotenv messages
const originalWrite = process.stdout.write;
process.stdout.write = () => true;
config({ path: envPath });
process.stdout.write = originalWrite;

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Import tool implementations
import { getTodaysTimesheetsTool } from './tools/getTodaysTimesheets.js';
import { getTimesheetsByDateRangeTool } from './tools/getTimesheetsByDateRange.js';
import { getDatabaseMetadataTool } from './tools/getDatabaseMetadata.js';
import { startTimesheetTool } from './tools/startTimesheet.js';
import { endTimesheetTool } from './tools/endTimesheet.js';
import { updateTimesheetMoodTool } from './tools/updateTimesheetMood.js';
import { searchActivitiesTool } from './tools/searchActivities.js';
import { searchResponsibilitiesTool } from './tools/searchResponsibilities.js';
import { createTopicTool } from './tools/createTopic.js';
import { searchTopicsTool } from './tools/searchTopics.js';
import { handleCreateActivity } from './tools/createActivity.js';
import { handleUpdateActivity } from './tools/updateActivity.js';

// We don't need to import the schemas since we're defining them inline

const notionApiKey = process.env.NOTION_API_KEY;
if (typeof notionApiKey !== "string" || notionApiKey.trim() === "") {
  throw new Error('NOTION_API_KEY is not set or is empty in environment variables.');
}

const timesheetsDatabaseId = process.env.TIMESHEETS_DB_ID;
if (typeof timesheetsDatabaseId !== "string" || timesheetsDatabaseId.trim() === "") {
  throw new Error('TIMESHEETS_DB_ID is not set or is empty in environment variables.');
}

const actitiviesDatabaseId = process.env.ACTIVITIES_DB_ID;
if (actitiviesDatabaseId !== undefined && (typeof actitiviesDatabaseId !== "string" || actitiviesDatabaseId.trim() === "")) {
  throw new Error('ACTIVITIES_DB_ID is set but empty in environment variables.');
}

const responsibilitiesDatabaseId = process.env.RESPONSIBILITIES_DB_ID;
if (responsibilitiesDatabaseId !== undefined && (typeof responsibilitiesDatabaseId !== "string" || responsibilitiesDatabaseId.trim() === "")) {
  throw new Error('RESPONSIBILITIES_DB_ID is set but empty in environment variables.');
}

const topicsDatabaseId = process.env.TOPICS_DB_ID;
if (topicsDatabaseId !== undefined && (typeof topicsDatabaseId !== "string" || topicsDatabaseId.trim() === "")) {
  throw new Error('TOPICS_DB_ID is set but empty in environment variables.');
}

// MCP server setup
const server = new McpServer({
  name: "timesheets",
  version: "1.0.0"
});

// Tool 1: Get today's timesheets
server.registerTool('getTodaysTimesheets', {
  description: "Retrieves all timesheet entries for today's date",
  inputSchema: {}
}, async () => {
  return await getTodaysTimesheetsTool(timesheetsDatabaseId);
});

// Tool 2: Get timesheets by date range
server.registerTool('getTimesheetsByDateRange', {
  description: "Retrieves timesheet entries for a specific date or date range",
  inputSchema: {
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional()
  }
}, async (request: any) => {
  // The request object contains the parameters directly, not under request.params
  const inputObject = {
    startDate: request.startDate,
    endDate: request.endDate
  };
  return await getTimesheetsByDateRangeTool(timesheetsDatabaseId, inputObject);
});

// Tool 3: Get database metadata
server.registerTool('getDatabaseMetadata', {
  description: "Retrieves schema information for timesheets, activities, responsibilities, and topics databases",
  inputSchema: {
    databaseType: z.enum(["timesheets", "activities", "responsibilities", "topics", "all"]).default("all")
  }
}, async (request: any) => {
  return await getDatabaseMetadataTool(
    timesheetsDatabaseId,
    actitiviesDatabaseId,
    responsibilitiesDatabaseId,
    topicsDatabaseId,
    request
  );
});

// Tool 4: Start timesheet
server.registerTool('startTimesheet', {
  description: "Creates a new timesheet entry with current timestamp as start time",
  inputSchema: {
    description: z.string().min(1, "Description is required"),
    activityId: z.string().optional(),
    topicId: z.string().optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be in HH:MM format").optional()
  }
}, async (request: any) => {
  return await startTimesheetTool(timesheetsDatabaseId, request);
});

// Tool 5: End timesheet
server.registerTool('endTimesheet', {
  description: "Updates an existing timesheet entry with end time and mood",
  inputSchema: {
    timesheetId: z.string().min(1, "Timesheet ID is required"),
    mood: z.string().min(1, "Mood is required"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be in HH:MM format").optional()
  }
}, async (request: any) => {
  return await endTimesheetTool(request);
});

// Tool 6: Update timesheet mood
server.registerTool('updateTimesheetMood', {
  description: "Updates the mood of an existing timesheet entry",
  inputSchema: {
    timesheetId: z.string().min(1, "Timesheet ID is required"),
    mood: z.string().min(1, "Mood is required")
  }
}, async (request: any) => {
  return await updateTimesheetMoodTool(request);
});

// Tool 7: Search activities
server.registerTool('searchActivities', {
  description: "Search for activities by name",
  inputSchema: {
    searchText: z.string().min(1, "Search text is required")
  }
}, async (request: any) => {
  if (!actitiviesDatabaseId) {
    return {
      content: [
        {
          type: "text" as const,
          text: "Activities database ID not configured"
        }
      ]
    };
  }
  return await searchActivitiesTool(actitiviesDatabaseId, request);
});

// Tool 8: Search responsibilities
server.registerTool('searchResponsibilities', {
  description: "Search for responsibilities by name",
  inputSchema: {
    searchText: z.string().min(1, "Search text is required")
  }
}, async (request: any) => {
  if (!responsibilitiesDatabaseId) {
    return {
      content: [
        {
          type: "text" as const,
          text: "Responsibilities database ID not configured"
        }
      ]
    };
  }
  return await searchResponsibilitiesTool(responsibilitiesDatabaseId, request);
});

// Tool 9: Create new topic/responsibility
server.registerTool('createTopic', {
  description: "Create a new topic/responsibility entry",
  inputSchema: {
    name: z.string().min(1, "Topic name is required"),
    description: z.string().optional()
  }
}, async (request: any) => {
  if (!topicsDatabaseId) {
    return {
      content: [
        {
          type: "text" as const,
          text: "Topics database ID not configured"
        }
      ]
    };
  }
  return await createTopicTool(topicsDatabaseId, request);
});

// Tool 10: Search topics
server.registerTool('searchTopics', {
  description: "Search for topics by name",
  inputSchema: {
    searchText: z.string().min(1, "Search text is required")
  }
}, async (request: any) => {
  if (!topicsDatabaseId) {
    return {
      content: [
        {
          type: "text" as const,
          text: "Topics database ID not configured"
        }
      ]
    };
  }
  return await searchTopicsTool(topicsDatabaseId, request);
});

// Tool 11: Create new activity
server.registerTool('createActivity', {
  description: "Create a new activity entry",
  inputSchema: {
    name: z.string().min(1, "Activity name is required"),
    responsibilityId: z.string().optional()
  }
}, async (request: any) => {
  if (!actitiviesDatabaseId) {
    return {
      content: [
        {
          type: "text" as const,
          text: "Activities database ID not configured (ACTIVITIES_DB_ID)"
        }
      ]
    };
  }
  return await handleCreateActivity(request);
});

// Tool 12: Update activity
server.registerTool('updateActivity', {
  description: "Update an existing activity entry",
  inputSchema: {
    activityId: z.string().min(1, "Activity ID is required"),
    name: z.string().min(1, "Activity name is required").optional(),
    responsibilityId: z.string().optional()
  }
}, async (request: any) => {
  if (!actitiviesDatabaseId) {
    return {
      content: [
        {
          type: "text" as const,
          text: "Activities database ID not configured (ACTIVITIES_DB_ID)"
        }
      ]
    };
  }
  return await handleUpdateActivity(request);
});

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);