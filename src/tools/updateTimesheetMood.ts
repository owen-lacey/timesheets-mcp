// Tool implementation for updating timesheet mood

import { updateTimesheetMood } from '../utils/notion-api.js';
import { UpdateTimesheetMoodInput, UpdateTimesheetMoodInputSchema } from '../types/schemas.js';

export async function updateTimesheetMoodTool(input: UpdateTimesheetMoodInput) {
  try {
    // Validate input
    const validatedInput = UpdateTimesheetMoodInputSchema.parse(input);
    const { timesheetId, mood } = validatedInput;

    await updateTimesheetMood(timesheetId, mood);

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated timesheet mood:\n- ID: ${timesheetId}\n- Mood: ${mood}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error updating timesheet mood: ${error}`
        }
      ]
    };
  }
}