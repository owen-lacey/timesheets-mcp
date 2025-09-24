// Tool implementation for getting today's timesheets

import { formatTimesheetEntry, getCurrentDate } from '../utils/helpers.js';
import { getTodaysTimesheets } from '../utils/notion-api.js';

export async function getTodaysTimesheetsTool(timesheetsDatabaseId: string) {
  try {
    const today = getCurrentDate();
    const data = await getTodaysTimesheets(timesheetsDatabaseId, today);

    const timesheets = await Promise.all(
      data.results.map((page: any) => formatTimesheetEntry(page))
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${timesheets.length} timesheet entries for ${today}:\n\n${JSON.stringify(timesheets, null, 2)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error fetching today's timesheets: ${error}`
        }
      ]
    };
  }
}