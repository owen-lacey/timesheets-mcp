import { CreateActivityInputSchema, CreateActivityInput } from "../types/schemas.js";
import { createActivity } from "../utils/notion-api.js";

export async function handleCreateActivity(args: any) {
  // Validate input with Zod schema
  const validation = CreateActivityInputSchema.safeParse(args);
  if (!validation.success) {
    throw new Error(`Invalid input: ${validation.error.issues.map(i => i.message).join(', ')}`);
  }
  
  const { name, responsibilityId }: CreateActivityInput = validation.data;
  
  // Get activities database ID from environment variable
  const activitiesDatabaseId = process.env.ACTIVITIES_DB_ID;
  if (!activitiesDatabaseId) {
    throw new Error('ACTIVITIES_DB_ID is not set in environment variables.');
  }

  try {
    const result = await createActivity(activitiesDatabaseId, name, responsibilityId);
    
    const message = `Activity "${name}" created successfully with ID: ${result.id}`;
    const responsibilityMessage = responsibilityId ? `\nLinked to responsibility: ${responsibilityId}` : '';
    
    return {
      content: [
        {
          type: "text" as const,
          text: message + responsibilityMessage
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error creating activity: ${error.message}`
        }
      ]
    };
  }
}