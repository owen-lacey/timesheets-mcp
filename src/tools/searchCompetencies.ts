// Tool implementation for searching competencies
import { SearchCompetenciesInputSchema, SearchCompetenciesInput } from '../types/schemas.js';
import { searchCompetencies, getCompetencyDetails } from '../utils/notion-api.js';

export async function searchCompetenciesTool(
  competenciesDatabaseId: string,
  input: SearchCompetenciesInput
) {
  try {
    if (!competenciesDatabaseId) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Competencies database ID not configured"
          }
        ]
      };
    }

    const validatedInput = SearchCompetenciesInputSchema.parse(input);
    const { searchText } = validatedInput;

    const data = await searchCompetencies(competenciesDatabaseId, searchText);

    // Get detailed information for each competency including evidence counts
    const competencies = await Promise.all(
      data.results.map((page: any) => getCompetencyDetails(page.id))
    );

    const resultText = searchText 
      ? `Found ${competencies.length} competencies matching "${searchText}"`
      : `Found ${competencies.length} competencies:`;

    return {
      content: [
        {
          type: "text" as const,
          text: `${resultText}\n\n${JSON.stringify(competencies, null, 2)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error searching competencies: ${error}`
        }
      ]
    };
  }
}
