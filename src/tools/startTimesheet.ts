// Tool implementation for starting a timesheet

import { getCurrentDate, getCurrentTime } from '../utils/helpers.js';
import { createTimesheet } from '../utils/notion-api.js';
import { StartTimesheetInput, StartTimesheetInputSchema } from '../types/schemas.js';

export async function startTimesheetTool(
  timesheetsDatabaseId: string,
  input: StartTimesheetInput
) {
  try {
    // Validate input
    const validatedInput = StartTimesheetInputSchema.parse(input);
    const { description, activityId, topicId, client, date, startTime } = validatedInput;

    // Use current date and time if not provided
    const actualDate = date || getCurrentDate();
    const actualStartTime = startTime || getCurrentTime();

    const result = await createTimesheet(
      timesheetsDatabaseId,
      description,
      actualDate,
      actualStartTime,
      activityId,
      topicId,
      client
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully started timesheet:\n- ID: ${result.id}\n- Description: ${description}\n- Date: ${actualDate}\n- Start time: ${actualStartTime}\n- Activity ID: ${activityId || 'None'}\n- Topic ID: ${topicId || 'None'}\n- Client: ${client || 'None'}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error starting timesheet: ${error}`
        }
      ]
    };
  }
}