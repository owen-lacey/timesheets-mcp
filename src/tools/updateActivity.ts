import { UpdateActivityInputSchema, UpdateActivityInput } from "../types/schemas.js";
import { updateActivity } from "../utils/notion-api.js";

export async function handleUpdateActivity(args: any) {
  // Validate input with Zod schema
  const validation = UpdateActivityInputSchema.safeParse(args);
  if (!validation.success) {
    throw new Error(`Invalid input: ${validation.error.issues.map(i => i.message).join(', ')}`);
  }
  
  const { activityId, name, description, responsibilityId }: UpdateActivityInput = validation.data;
  
  // Check that at least one field is being updated
  if (!name && description === undefined && responsibilityId === undefined) {
    throw new Error('At least one field (name, description, or responsibilityId) must be provided for update');
  }

  try {
    await updateActivity(activityId, name, description, responsibilityId);
    
    const updates: string[] = [];
    if (name) {
      updates.push(`name updated to "${name}"`);
    }
    if (description !== undefined) {
      if (description === "") {
        updates.push('description removed');
      } else {
        updates.push(`description updated to "${description}"`);
      }
    }
    if (responsibilityId !== undefined) {
      if (responsibilityId === "") {
        updates.push('responsibility link removed');
      } else {
        updates.push(`linked to responsibility: ${responsibilityId}`);
      }
    }
    
    return {
      content: [
        {
          type: "text" as const,
          text: `Activity ${activityId} updated successfully: ${updates.join(', ')}`
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error updating activity: ${error.message}`
        }
      ]
    };
  }
}