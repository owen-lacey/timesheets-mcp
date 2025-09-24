import { getActivityDetails } from './notion-api.js';

// Helper functions for date and time
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// Helper function to format Notion timesheet data
export async function formatTimesheetEntry(page: any) {
  const properties = page.properties;
  const activityIds = properties.Activities?.relation?.map((rel: any) => rel.id) || [];
  
  // Fetch activity details in parallel
  const activityDetails = await Promise.all(
    activityIds.map((id: string) => getActivityDetails(id))
  );

  return {
    id: page.id,
    description: properties.Desc?.title?.[0]?.text?.content || '',
    date: properties.Date?.date?.start || '',
    startTime: properties.Start?.rich_text?.[0]?.text?.content || '',
    endTime: properties.End?.rich_text?.[0]?.text?.content || '',
    duration: properties.Duration?.formula?.number || 0,
    activities: activityDetails,
    topics: properties.Topics?.relation?.map((rel: any) => rel.id) || [],
    mood: properties['']?.select?.name || '',
  };
}