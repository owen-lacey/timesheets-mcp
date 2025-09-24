// Tool implementation for searching responsibilities

import { searchResponsibilities, getResponsibilityDetails } from '../utils/notion-api.js';
import { SearchInput, SearchInputSchema } from '../types/schemas.js';

export async function searchResponsibilitiesTool(
  responsibilitiesDatabaseId: string,
  input: SearchInput
) {
  try {
    if (!responsibilitiesDatabaseId) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Responsibilities database ID not configured"
          }
        ]
      };
    }

    // Validate input
    const validatedInput = SearchInputSchema.parse(input);
    const { searchText } = validatedInput;

    const data = await searchResponsibilities(responsibilitiesDatabaseId, searchText);

    const responsibilities = await Promise.all(
      data.results.map((page: any) => getResponsibilityDetails(page.id))
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${responsibilities.length} responsibilities matching "${searchText}":\n\n${JSON.stringify(responsibilities, null, 2)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error searching responsibilities: ${error}`
        }
      ]
    };
  }
}