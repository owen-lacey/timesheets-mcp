# Notion Timesheets MCP Server Plan

## Overview
This MCP server provides a wrapper around the Notion API to manage timesheets, activities, and responsibilities. The server will offer tools to query, create, and update timesheet entries.

## Database Structure
Based on the Postman collection, we have three interconnected databases:
- **Timesheets**: Main timesheet entries with date, start/end times, description, activities, topics, and mood
- **Activities**: Work activities linked to responsibilities
- **Responsibilities**: High-level responsibility categories

### Notion Property Mappings
**Timesheets Database Properties:**
- `Desc` (title): Description of the timesheet entry
- `Date` (date): Date of the timesheet entry
- `Start` (rich_text): Start time in HH:MM format
- `End` (rich_text): End time in HH:MM format
- `Activities` (relation): Related activities from Activities database
- `Topics` (relation): Related topics/responsibilities from Responsibilities database
- `""` (select): Mood emoji (property name is empty string)

**Activities Database Properties:**
- `Name` (title): Name of the activity
- `Responsibilities` (relation): Related responsibilities

**Responsibilities Database Properties:**
- `Name` (title): Name of the responsibility
- `Description` (rich_text): Description of the responsibility

## Tools to Implement

### 1. Get Today's Timesheets
- **Tool Name**: `getTodaysTimesheets`
- **Description**: Retrieves all timesheet entries for today's date
- **Input**: None (uses current date)
- **Output**: List of timesheet entries for today
- **API Call**: 
  - `POST /v1/databases/{TIMESHEETS_DB_ID}/query`
  - Filter by Date property equals today
  - Sort by Start time ascending

### 2. Get Timesheets for Date Period
- **Tool Name**: `getTimesheetsByDateRange`
- **Description**: Retrieves timesheet entries for a specific date or date range
- **Input**: 
  - `startDate` (required): Start date in YYYY-MM-DD format
  - `endDate` (optional): End date in YYYY-MM-DD format (defaults to startDate)
- **Output**: List of timesheet entries within the specified range
- **API Call**: 
  - `POST /v1/databases/{TIMESHEETS_DB_ID}/query`
  - Filter by Date property on_or_after startDate AND on_or_before endDate
  - Sort by Date ascending, then Start time ascending

### 3. Get Database Metadata
- **Tool Name**: `getDatabaseMetadata`
- **Description**: Retrieves schema information for timesheets, activities, and responsibilities databases
- **Input**: 
  - `databaseType` (optional): "timesheets", "activities", "responsibilities", or "all" (default)
- **Output**: Database schema and property information
- **API Calls**: 
  - `GET /v1/databases/{TIMESHEETS_DB_ID}` (for timesheets schema)
  - `GET /v1/databases/{ACTIVITIES_DB_ID}` (for activities schema)
  - `GET /v1/databases/{RESPONSIBILITIES_DB_ID}` (for responsibilities schema)

### 4. Start Timesheet
- **Tool Name**: `startTimesheet`
- **Description**: Creates a new timesheet entry with current timestamp as start time
- **Input**:
  - `description` (required): Description of the work being done
  - `activityId` (optional): ID of the related activity
  - `topicId` (optional): ID of the related topic/responsibility
  - `startTime` (optional): Start time in HH:MM format (defaults to current time)
- **Output**: Created timesheet entry with ID
- **API Call**: 
  - `POST /v1/pages`
  - Parent: TIMESHEETS_DB_ID
  - Properties: Desc (title), Date (date), Start (rich_text), Activities (relation), Topics (relation), mood (select)

### 5. End Timesheet
- **Tool Name**: `endTimesheet`
- **Description**: Updates an existing timesheet entry with end time
- **Input**:
  - `timesheetId` (required): ID of the timesheet to update
  - `mood` (required): Mood emoji
  - `endTime` (optional): End time in HH:MM format (defaults to current time)
- **Output**: Updated timesheet entry
- **API Call**: 
  - `PATCH /v1/pages/{timesheetId}`
  - Update End property (rich_text) with end time


## Implementation Details


### Error Handling
- Validate date formats
- Handle missing timesheet IDs
- Graceful error messages for API failures
- Validate required environment variables

### Data Validation
- Use Zod schemas for input validation
- Ensure proper date formats
- Validate timesheet IDs exist before updating

## File Structure
```
src/
├── server.ts         # Main MCP server implementation
├── types/            # TypeScript type definitions
├── notion/api.ts     # notion API endpoints
└── tools/            # file per tool
```