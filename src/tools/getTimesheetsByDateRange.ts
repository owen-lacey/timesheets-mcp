// Tool implementation for getting timesheets by date range

import { formatTimesheetEntry } from '../utils/helpers.js';
import { getTimesheetsByDateRange } from '../utils/notion-api.js';
import { DateRangeInput, DateRangeInputSchema } from '../types/schemas.js';

export async function getTimesheetsByDateRangeTool(
  timesheetsDatabaseId: string, 
  input: DateRangeInput
) {
  try {
    // Validate input
    const validatedInput = DateRangeInputSchema.parse(input);
    const { startDate, endDate } = validatedInput;

    const data = await getTimesheetsByDateRange(timesheetsDatabaseId, startDate, endDate);

    const timesheets = await Promise.all(
      data.results.map((page: any) => formatTimesheetEntry(page))
    );

    const dateRange = endDate && endDate !== startDate 
      ? `${startDate} to ${endDate}` 
      : startDate;

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${timesheets.length} timesheet entries for ${dateRange}:\n\n${JSON.stringify(timesheets, null, 2)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error fetching timesheets: ${error}`
        }
      ]
    };
  }
}