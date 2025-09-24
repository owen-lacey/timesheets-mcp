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
import { getCurrentDate, formatTimesheetEntry } from './utils/helpers.js';
import { getTodaysTimesheets } from './utils/notion-api.js';

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

// MCP server setup
const server = new McpServer({
  name: "timesheets",
  version: "1.0.0"
});

// Tool 1: Get today's timesheets
server.registerTool('getTodaysTimesheets', {
  title: "Get Today's Timesheets",
  description: "Retrieves all timesheet entries for today's date",
  inputSchema: {}
}, async () => {
  try {
    const today = getCurrentDate();
    const data = await getTodaysTimesheets(timesheetsDatabaseId, today);

    const timesheets = await Promise.all(
      data.results.map((page: any) => formatTimesheetEntry(page))
    );

    return {
      content: [
        {
          type: "text",
          text: `Found ${timesheets.length} timesheet entries for ${today}:\n\n${JSON.stringify(timesheets, null, 2)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching today's timesheets: ${error}`
        }
      ]
    };
  }
});

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);