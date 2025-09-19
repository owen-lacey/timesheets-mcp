import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from 'zod';

import 'dotenv/config';

const notionApiKey = process.env.NOTION_API_KEY;
const timesheetsDatabaseId = process.env.TIMESHEETS_DATABASE_ID;
if (!notionApiKey || !timesheetsDatabaseId) {
  throw new Error('NOTION_API_KEY or DATABASE_ID is not set in environment variables.');
}

// MCP server setup (basic example)
const server = new McpServer({
  name: "timesheets",
  version: "1.0.0"
}); 

server.registerTool('getRandomNumber', {
  title: "getRandomNumber",
  description: "Returns a random number between 0 and 1",
  inputSchema: {},
}, async () => {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(Math.random())
      }
    ]
  };
});

// Tool to fetch Notion database info using NOTION_API_KEY and DATABASE_ID
server.registerTool('getNotionDatabase', {
  title: "Get Notion Database",
  description: "Fetches data from a Notion database using the API key and database ID from environment variables.",
  inputSchema: {},
}, async () => {
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${timesheetsDatabaseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error fetching Notion database: ${error}`
        }
      ]
    };
  }
});

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);