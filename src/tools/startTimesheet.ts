// Tool implementation for starting a timesheet

import { getCurrentDate, getCurrentTime } from '../utils/helpers.js';
import { createTimesheet } from '../utils/notion-api.js';
import { describeEpisodeMetrics } from '../utils/episode-properties.js';
import { StartTimesheetInput, StartTimesheetInputSchema } from '../types/schemas.js';

export async function startTimesheetTool(
  timesheetsDatabaseId: string,
  input: StartTimesheetInput
) {
  try {
    // Validate input
    const validatedInput = StartTimesheetInputSchema.parse(input);
    const { description, activityId, topicId, client, date, startTime, ...metrics } = validatedInput;

    // Use current date and time if not provided
    const actualDate = date || getCurrentDate();
    const actualStartTime = startTime || getCurrentTime();

    const result = await createTimesheet(timesheetsDatabaseId, {
      description,
      date: actualDate,
      startTime: actualStartTime,
      activityId,
      topicId,
      client,
      metrics
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully started timesheet:\n- ID: ${result.id}\n- Description: ${description}\n- Date: ${actualDate}\n- Start time: ${actualStartTime}\n- Activity ID: ${activityId || 'None'}\n- Topic ID: ${topicId || 'None'}\n- Client: ${client || 'None'}${describeEpisodeMetrics(metrics)}`
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