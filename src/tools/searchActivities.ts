// Tool implementation for searching activities

import { searchActivities, getActivityDetails } from '../utils/notion-api.js';
import { SearchInput, SearchInputSchema } from '../types/schemas.js';

export async function searchActivitiesTool(
  activitiesDatabaseId: string,
  input: SearchInput
) {
  try {
    if (!activitiesDatabaseId) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Activities database ID not configured"
          }
        ]
      };
    }

    // Validate input
    const validatedInput = SearchInputSchema.parse(input);
    const { searchText } = validatedInput;

    const data = await searchActivities(activitiesDatabaseId, searchText);

    const activities = await Promise.all(
      data.results.map((page: any) => getActivityDetails(page.id))
    );

    const resultText = searchText 
      ? `Found ${activities.length} activities matching "${searchText}" in name and description:`
      : `Found ${activities.length} activities:`;

    return {
      content: [
        {
          type: "text" as const,
          text: `${resultText}\n\n${JSON.stringify(activities, null, 2)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error searching activities: ${error}`
        }
      ]
    };
  }
}