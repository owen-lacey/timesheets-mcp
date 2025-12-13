# Timesheets MCP Server

A Model Context Protocol (MCP) server that provides a comprehensive interface to manage timesheets using Notion databases. This server offers tools for querying, creating, and updating timesheet entries, activities, responsibilities, competencies, and evidence.

## Features

- 📊 **Timesheet Management**: Start, end, and query timesheet entries
- 🎯 **Activity Tracking**: Search and manage work activities
- 📋 **Responsibility Management**: Organize work by responsibility categories  
- 🔍 **Advanced Queries**: Date range filtering and metadata retrieval
- 😊 **Mood Tracking**: Track mood for timesheet entries
- 🔧 **Type-Safe**: Full TypeScript support with Zod validation

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file in the project root:
   ```env
   NOTION_API_KEY=your_notion_api_key_here
   TIMESHEETS_DB_ID=your_timesheets_database_id
   ACTIVITIES_DB_ID=your_activities_database_id_optional
   RESPONSIBILITIES_DB_ID=your_responsibilities_database_id_optional
   TOPICS_DB_ID=your_topics_database_id_optional
   COMPETENCIES_DB_ID=your_competencies_database_id_optional
   EVIDENCE_DB_ID=your_evidence_database_id_optional
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Development mode**
   ```bash
   npm run dev
   ```

## Available Tools

### Core Timesheet Operations
- `getTodaysTimesheets` - Get all timesheet entries for today
- `getTimesheetsByDateRange` - Query timesheets by date range
- `startTimesheet` - Create a new timesheet entry
- `endTimesheet` - Complete a timesheet with end time and mood
- `updateTimesheetMood` - Update mood for existing timesheet

### Search & Management
- `searchActivities` - Search activities by name
- `searchResponsibilities` - Search responsibilities by name
- `searchTopics` - Search topics by name
- `createTopic` - Create a new topic/responsibility entry
- `createActivity` - Create a new activity entry
- `updateActivity` - Update an existing activity entry
- `getDatabaseMetadata` - Get schema information for databases

### Competencies & Evidence
- `searchCompetencies` - Search competencies by name and PE Content with evidence counts
- `addEvidence` - Create a new evidence entry with competencies and topics
- `updateEvidence` - Update existing evidence (appends relations)

## Project Structure

```
timesheets-mcp/
├── src/
│   ├── server.ts              # Main MCP server setup and tool registration
│   ├── tools/                 # Individual tool implementations
│   │   ├── startTimesheet.ts
│   │   ├── endTimesheet.ts
│   │   ├── getTodaysTimesheets.ts
│   │   ├── getTimesheetsByDateRange.ts
│   │   ├── updateTimesheetMood.ts
│   │   ├── searchActivities.ts
│   │   ├── searchResponsibilities.ts
│   │   ├── searchTopics.ts
│   │   ├── createTopic.ts
│   │   ├── createActivity.ts
│   │   ├── updateActivity.ts
│   │   ├── searchCompetencies.ts
│   │   ├── addEvidence.ts
│   │   ├── updateEvidence.ts
│   │   └── getDatabaseMetadata.ts
│   ├── types/
│   │   ├── schemas.ts         # Zod input/output validation schemas
│   │   └── notion.ts          # Notion API type definitions
│   └── utils/
│       ├── notion-api.ts      # Notion API wrapper functions
│       └── helpers.ts         # Utility functions (date/time helpers)
├── build/                     # Compiled JavaScript output
├── docs/                      # Documentation
├── postman/                   # Postman collections for API testing
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema

This server works with six interconnected Notion databases:

### Timesheets Database (Required)
- `Desc` (title): Description of work performed
- `Date` (date): Date of the timesheet entry
- `Start` (rich_text): Start time in HH:MM format
- `End` (rich_text): End time in HH:MM format  
- `Activities` (relation): Links to Activities database
- `Topics` (relation): Links to Topics/Responsibilities database
- `""` (select): Mood emoji (property name is empty string)

### Activities Database (Optional)
- `Name` (title): Activity name
- `Description` (rich_text): Activity description
- `Responsibilities` (relation): Links to Responsibilities database

### Responsibilities Database (Optional)  
- `Title` (title): Responsibility name
- `Description` (rich_text): Responsibility description

### Topics Database (Optional)
- `Title` (title): Topic name
- `Text` (rich_text): Topic description
- Can be associated with timesheet entries and evidence

### Competencies Database (Optional)
- `Name` (rich_text): Competency name
- `PE Content` (rich_text): Professional Experience content description
- `Evidence` (relation): Links to Evidence database (used for counting)

### Evidence Database (Optional)
- `Summary` (title): Title/summary of the evidence entry
- `Date` (date): When the evidence occurred
- `What happened` (rich_text): Detailed description of the evidence
- `Competencies` (relation): Links to one or more competencies
- `Topics` (relation): Links to one or more topics

## Adding New Tools

To add a new MCP tool to this server, follow these steps:

### 1. Create the Tool Implementation

Create a new file in `src/tools/yourToolName.ts`:

```typescript
// Tool implementation for your new feature
import { YourInputSchema } from '../types/schemas.js';
import { someUtilityFunction } from '../utils/notion-api.js';

export async function yourToolNameTool(
  databaseId: string,
  input: YourInputType
) {
  try {
    // Validate input
    const validatedInput = YourInputSchema.parse(input);
    
    // Implement your logic here
    const result = await someUtilityFunction(databaseId, validatedInput);

    return {
      content: [
        {
          type: "text" as const,
          text: `Success: ${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${error}`
        }
      ]
    };
  }
}
```

### 2. Define Input/Output Schemas

Add your schemas to `src/types/schemas.ts`:

```typescript
// Add to existing schemas
export const YourInputSchema = z.object({
  requiredField: z.string().min(1, "Field is required"),
  optionalField: z.string().optional(),
  // Add validation as needed
});

export type YourInputType = z.infer<typeof YourInputSchema>;
```

### 3. Register the Tool

Add your tool to `src/server.ts`:

```typescript
// Import your tool
import { yourToolNameTool } from './tools/yourToolName.js';

// Register the tool (add this with other tool registrations)
server.registerTool('yourToolName', {
  description: "Clear description of what your tool does",
  inputSchema: {
    requiredField: z.string().min(1, "Field is required"),
    optionalField: z.string().optional()
  }
}, async (request: any) => {
  return await yourToolNameTool(timesheetsDatabaseId, request);
});
```

### 4. Add Utility Functions (if needed)

If you need new Notion API interactions, add them to `src/utils/notion-api.ts`:

```typescript
export async function yourNewNotionFunction(databaseId: string, data: any) {
  return notionRequest(`https://api.notion.com/v1/databases/${databaseId}/your-endpoint`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}
```

### 5. Update Types (if needed)

Add any new Notion-specific types to `src/types/notion.ts`.

## Development Guidelines

### Code Patterns
- **Error Handling**: All tools should use try/catch and return standardized error responses
- **Input Validation**: Use Zod schemas for all inputs
- **Type Safety**: Leverage TypeScript throughout
- **Consistent Response Format**: Return `{ content: [{ type: "text", text: string }] }`

### Environment Variables
- Always validate required environment variables at startup
- Use optional database IDs for features that may not be configured
- Check for empty strings, not just undefined values

### Testing
- Use the Postman collection in `postman/collections/` for manual testing
- Use `npm run inspect` to debug tools with the MCP inspector
- Test both success and error scenarios

## Configuration

### Required Environment Variables
- `NOTION_API_KEY`: Your Notion integration API key
- `TIMESHEETS_DB_ID`: ID of your timesheets Notion database

### Optional Environment Variables
- `ACTIVITIES_DB_ID`: ID of your activities database
- `RESPONSIBILITIES_DB_ID`: ID of your responsibilities database
- `TOPICS_DB_ID`: ID of your topics database
- `COMPETENCIES_DB_ID`: ID of your competencies database
- `EVIDENCE_DB_ID`: ID of your evidence database

### MCP Client Integration
Add this server to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "timesheets": {
      "command": "node",
      "args": ["/path/to/timesheets-mcp/build/src/server.js"]
    }
  }
}
```

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the compiled server
- `npm run dev` - Run in development mode with ts-node
- `npm run inspect` - Debug with MCP inspector
- `npm test` - Run tests (not yet implemented)

## License

MIT - see [LICENSE](LICENSE) file for details.
