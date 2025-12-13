// Tool implementation for updating evidence
import { UpdateEvidenceInputSchema, UpdateEvidenceInput } from '../types/schemas.js';
import { updateEvidence } from '../utils/notion-api.js';

export async function updateEvidenceTool(input: UpdateEvidenceInput) {
  try {
    const validatedInput = UpdateEvidenceInputSchema.parse(input);
    const { evidenceId, summary, date, whatHappened, competencyIds, topicIds } = validatedInput;

    const result = await updateEvidence(
      evidenceId,
      summary,
      date,
      whatHappened,
      competencyIds,
      topicIds
    );

    // Build response message showing what was updated
    const updates: string[] = [];
    if (summary !== undefined) updates.push(`summary: "${summary}"`);
    if (date !== undefined) updates.push(`date: ${date}`);
    if (whatHappened !== undefined) updates.push(`what happened: "${whatHappened}"`);
    if (competencyIds && competencyIds.length > 0) {
      updates.push(`added ${competencyIds.length} competency link(s)`);
    }
    if (topicIds && topicIds.length > 0) {
      updates.push(`added ${topicIds.length} topic link(s)`);
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully updated evidence entry (${evidenceId}):\n\nUpdates:\n- ${updates.join('\n- ')}\n\n${JSON.stringify(result, null, 2)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error updating evidence: ${error}`
        }
      ]
    };
  }
}
