// Tool implementation for getting evidence details

import { getEvidenceDetails } from '../utils/notion-api.js';
import { GetEvidenceInput, GetEvidenceInputSchema } from '../types/schemas.js';

export async function getEvidenceTool(
  input: GetEvidenceInput
) {
  try {
    // Validate input
    const validatedInput = GetEvidenceInputSchema.parse(input);
    const { evidenceId } = validatedInput;

    const evidence = await getEvidenceDetails(evidenceId);

    return {
      content: [
        {
          type: "text" as const,
          text: `Evidence details:\n\n${JSON.stringify(evidence, null, 2)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error getting evidence: ${error}`
        }
      ]
    };
  }
}
