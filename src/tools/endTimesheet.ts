// Tool implementation for ending a timesheet

import { getCurrentTime } from '../utils/helpers.js';
import { endTimesheet } from '../utils/notion-api.js';
import { EndTimesheetInput, EndTimesheetInputSchema } from '../types/schemas.js';

export async function endTimesheetTool(input: EndTimesheetInput) {
  try {
    // Validate input
    const validatedInput = EndTimesheetInputSchema.parse(input);
    const { timesheetId, mood, endTime } = validatedInput;

    // Use current time if not provided
    const actualEndTime = endTime || getCurrentTime();

    await endTimesheet(timesheetId, actualEndTime, mood);

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully ended timesheet:\n- ID: ${timesheetId}\n- End time: ${actualEndTime}\n- Mood: ${mood}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error ending timesheet: ${error}`
        }
      ]
    };
  }
}