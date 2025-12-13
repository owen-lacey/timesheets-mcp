// Tool implementation for creating evidence (addEvidence)
import { CreateEvidenceInputSchema, CreateEvidenceInput } from '../types/schemas.js';
import { createEvidence } from '../utils/notion-api.js';

export async function addEvidenceTool(
  evidenceDatabaseId: string,
  input: CreateEvidenceInput
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

    const validatedInput = CreateEvidenceInputSchema.parse(input);
    const { summary, date, whatHappened, competencyIds, topicIds } = validatedInput;

    const result = await createEvidence(
      evidenceDatabaseId,
      summary,
      date,
      whatHappened,
      competencyIds,
      topicIds
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully created evidence entry:\n\n${JSON.stringify({
            id: result.id,
            summary,
            date,
            whatHappened,
            competencyIds: competencyIds || [],
            topicIds: topicIds || []
          }, null, 2)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error creating evidence: ${error}`
        }
      ]
    };
  }
}
