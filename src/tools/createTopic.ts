// Tool implementation for creating a new topic/responsibility

import { createTopic } from '../utils/notion-api.js';
import { CreateTopicInput, CreateTopicInputSchema } from '../types/schemas.js';

export async function createTopicTool(
  topicsDatabaseId: string,
  input: CreateTopicInput
) {
  try {
    // Validate input
    const validatedInput = CreateTopicInputSchema.parse(input);
    const { name, description } = validatedInput;

    const result = await createTopic(
      topicsDatabaseId,
      name,
      description
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Successfully created topic:\n- ID: ${result.id}\n- Name: ${name}\n- Description: ${description || 'None'}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error creating topic: ${error}`
        }
      ]
    };
  }
}