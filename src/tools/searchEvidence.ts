// Tool implementation for searching evidence

import { searchEvidence, getEvidenceDetails } from '../utils/notion-api.js';
import { SearchEvidenceInput, SearchEvidenceInputSchema } from '../types/schemas.js';

export async function searchEvidenceTool(
  evidenceDatabaseId: string,
  input: SearchEvidenceInput
) {
  try {
    if (!evidenceDatabaseId) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Evidence database ID not configured"
          }
        ]
      };
    }

    // Validate input
    const validatedInput = SearchEvidenceInputSchema.parse(input);
    const { searchText, competencyId, fromDate } = validatedInput;

    const data = await searchEvidence(evidenceDatabaseId, searchText, competencyId, fromDate);

    const evidence = await Promise.all(
      data.results.map((page: any) => getEvidenceDetails(page.id))
    );

    let resultText = `Found ${evidence.length} evidence entries`;
    const filters: string[] = [];
    if (searchText) filters.push(`matching "${searchText}"`);
    if (competencyId) filters.push(`linked to competency ${competencyId}`);
    if (fromDate) filters.push(`from ${fromDate} onwards`);
    if (filters.length > 0) {
      resultText += ` ${filters.join(', ')}`;
    }
    resultText += ":";

    return {
      content: [
        {
          type: "text" as const,
          text: `${resultText}\n\n${JSON.stringify(evidence, null, 2)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error searching evidence: ${error}`
        }
      ]
    };
  }
}
