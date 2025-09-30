// Tool implementation for searching topics

import { searchTopics, getTopicDetails } from '../utils/notion-api.js';
import { SearchInput, SearchInputSchema } from '../types/schemas.js';

export async function searchTopicsTool(
  topicsDatabaseId: string,
  input: SearchInput
) {
  try {
    if (!topicsDatabaseId) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Topics database ID not configured"
          }
        ]
      };
    }

    // Validate input
    const validatedInput = SearchInputSchema.parse(input);
    const { searchText } = validatedInput;

    const data = await searchTopics(topicsDatabaseId, searchText);

    const topics = await Promise.all(
      data.results.map((page: any) => getTopicDetails(page.id))
    );

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${topics.length} topics matching "${searchText}":\n\n${JSON.stringify(topics, null, 2)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error searching topics: ${error}`
        }
      ]
    };
  }
}