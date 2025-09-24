// Tool implementation for getting database metadata

import { getDatabaseSchema } from '../utils/notion-api.js';
import { DatabaseMetadataInput, DatabaseMetadataInputSchema } from '../types/schemas.js';

export async function getDatabaseMetadataTool(
  timesheetsDatabaseId: string,
  activitiesDatabaseId?: string,
  responsibilitiesDatabaseId?: string,
  input?: DatabaseMetadataInput
) {
  try {
    // Default input if none provided
    const defaultInput: DatabaseMetadataInput = { databaseType: "all" };
    const validatedInput = input ? DatabaseMetadataInputSchema.parse(input) : defaultInput;
    const { databaseType } = validatedInput;

    const results: any = {};

    if (databaseType === "all" || databaseType === "timesheets") {
      try {
        const timesheetsSchema = await getDatabaseSchema(timesheetsDatabaseId);
        results.timesheets = {
          id: timesheetsSchema.id,
          title: timesheetsSchema.title?.[0]?.text?.content || "Timesheets",
          properties: timesheetsSchema.properties
        };
      } catch (error) {
        results.timesheets = { error: `Failed to fetch timesheets schema: ${error}` };
      }
    }

    if ((databaseType === "all" || databaseType === "activities") && activitiesDatabaseId) {
      try {
        const activitiesSchema = await getDatabaseSchema(activitiesDatabaseId);
        results.activities = {
          id: activitiesSchema.id,
          title: activitiesSchema.title?.[0]?.text?.content || "Activities",
          properties: activitiesSchema.properties
        };
      } catch (error) {
        results.activities = { error: `Failed to fetch activities schema: ${error}` };
      }
    }

    if ((databaseType === "all" || databaseType === "responsibilities") && responsibilitiesDatabaseId) {
      try {
        const responsibilitiesSchema = await getDatabaseSchema(responsibilitiesDatabaseId);
        results.responsibilities = {
          id: responsibilitiesSchema.id,
          title: responsibilitiesSchema.title?.[0]?.text?.content || "Responsibilities",
          properties: responsibilitiesSchema.properties
        };
      } catch (error) {
        results.responsibilities = { error: `Failed to fetch responsibilities schema: ${error}` };
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Database metadata:\n\n${JSON.stringify(results, null, 2)}`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error fetching database metadata: ${error}`
        }
      ]
    };
  }
}