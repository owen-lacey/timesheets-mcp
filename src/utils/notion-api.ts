// Function to get and validate the Notion API key
function getNotionApiKey(): string {
  const notionApiKey = process.env.NOTION_API_KEY;
  if (!notionApiKey) {
    throw new Error('NOTION_API_KEY is not set in environment variables.');
  }
  return notionApiKey;
}

// Base Notion API request function
async function notionRequest(url: string, options: RequestInit = {}) {
  const notionApiKey = getNotionApiKey();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${notionApiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Database operations
export async function getDatabaseSchema(databaseId: string) {
  return notionRequest(`https://api.notion.com/v1/databases/${databaseId}`);
}

export async function queryDatabase(databaseId: string, queryBody: any) {
  return notionRequest(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    body: JSON.stringify(queryBody)
  });
}

// Page operations
export async function createPage(pageData: any) {
  return notionRequest('https://api.notion.com/v1/pages', {
    method: 'POST',
    body: JSON.stringify(pageData)
  });
}

export async function updatePage(pageId: string, updateData: any) {
  return notionRequest(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  });
}

// Timesheet-specific API calls
export async function getTodaysTimesheets(timesheetsDatabaseId: string, today: string) {
  const queryBody = {
    filter: {
      property: "Date",
      date: {
        equals: today
      }
    },
    sorts: [
      {
        property: "Start",
        direction: "ascending"
      }
    ]
  };
  
  return queryDatabase(timesheetsDatabaseId, queryBody);
}

export async function getTimesheetsByDateRange(
  timesheetsDatabaseId: string, 
  startDate: string, 
  endDate?: string
) {
  const actualEndDate = endDate || startDate;
  
  let filter;
  if (startDate === actualEndDate) {
    filter = {
      property: "Date",
      date: {
        equals: startDate
      }
    };
  } else {
    filter = {
      and: [
        {
          property: "Date",
          date: {
            on_or_after: startDate
          }
        },
        {
          property: "Date",
          date: {
            on_or_before: actualEndDate
          }
        }
      ]
    };
  }

  const queryBody = {
    filter,
    sorts: [
      {
        property: "Date",
        direction: "ascending"
      },
      {
        property: "Start",
        direction: "ascending"
      }
    ]
  };
  
  return queryDatabase(timesheetsDatabaseId, queryBody);
}

export async function createTimesheet(
  timesheetsDatabaseId: string,
  description: string,
  date: string,
  startTime: string,
  activityId?: string,
  topicId?: string,
  mood?: string
) {
  const properties: any = {
    "Desc": {
      "title": [
        {
          "text": {
            "content": description
          }
        }
      ]
    },
    "Date": {
      "date": {
        "start": date
      }
    },
    "Start": {
      "rich_text": [
        {
          "text": {
            "content": startTime
          }
        }
      ]
    }
  };

  if (activityId) {
    properties["Activities"] = {
      "relation": [
        {
          "id": activityId
        }
      ]
    };
  }

  if (topicId) {
    properties["Topics"] = {
      "relation": [
        {
          "id": topicId
        }
      ]
    };
  }

  if (mood) {
    properties[""] = {
      "select": {
        "name": mood
      }
    };
  }

  const pageData = {
    parent: {
      database_id: timesheetsDatabaseId
    },
    properties
  };

  return createPage(pageData);
}

export async function createTopic(
  topicsDatabaseId: string,
  name: string,
  description?: string
) {
  const properties: any = {
    "Title": {
      "title": [
        {
          "text": {
            "content": name
          }
        }
      ]
    }
  };

  // Add description if provided (using Text field as per schema)
  if (description) {
    properties["Text"] = {
      "rich_text": [
        {
          "text": {
            "content": description
          }
        }
      ]
    };
  }

  const pageData = {
    parent: {
      database_id: topicsDatabaseId
    },
    properties
  };

  return createPage(pageData);
}

export async function createActivity(
  activitiesDatabaseId: string,
  name: string,
  description?: string,
  responsibilityId?: string
) {
  const properties: any = {
    "Name": {
      "title": [
        {
          "text": {
            "content": name
          }
        }
      ]
    }
  };

  // Add description if provided
  if (description) {
    properties["Description"] = {
      "rich_text": [
        {
          "text": {
            "content": description
          }
        }
      ]
    };
  }

  // Add responsibility relationship if provided
  if (responsibilityId) {
    properties["Responsibilities"] = {
      "relation": [
        {
          "id": responsibilityId
        }
      ]
    };
  }

  const pageData = {
    parent: {
      database_id: activitiesDatabaseId
    },
    properties
  };

  return createPage(pageData);
}

export async function updateActivity(
  activityId: string,
  name?: string,
  description?: string,
  responsibilityId?: string
) {
  const properties: any = {};

  // Update name if provided
  if (name) {
    properties["Name"] = {
      "title": [
        {
          "text": {
            "content": name
          }
        }
      ]
    };
  }

  // Update description if provided
  if (description !== undefined) {
    if (description === "") {
      // Clear the description
      properties["Description"] = {
        "rich_text": []
      };
    } else {
      // Set the description
      properties["Description"] = {
        "rich_text": [
          {
            "text": {
              "content": description
            }
          }
        ]
      };
    }
  }

  // Update responsibility relationship if provided
  if (responsibilityId !== undefined) {
    if (responsibilityId === "") {
      // Clear the relationship
      properties["Responsibilities"] = {
        "relation": []
      };
    } else {
      // Set the relationship
      properties["Responsibilities"] = {
        "relation": [
          {
            "id": responsibilityId
          }
        ]
      };
    }
  }

  const updateData = {
    properties
  };

  return updatePage(activityId, updateData);
}

export async function endTimesheet(timesheetId: string, endTime: string, mood?: string) {
  const properties: any = {
    "End": {
      "rich_text": [
        {
          "text": {
            "content": endTime
          }
        }
      ]
    }
  };

  if (mood) {
    properties[""] = {
      "select": {
        "name": mood
      }
    };
  }

  const updateData = {
    properties
  };

  return updatePage(timesheetId, updateData);
}

export async function updateTimesheetMood(timesheetId: string, mood: string) {
  const updateData = {
    properties: {
      "": {
        "select": {
          "name": mood
        }
      }
    }
  };

  return updatePage(timesheetId, updateData);
}

// Activity cache with expiration
interface CachedActivity {
  data: {
    id: string;
    name: string;
    responsibility: {
      id: string;
      name: string;
    } | null;
  };
  timestamp: number;
}

// Responsibility cache with expiration
interface CachedResponsibility {
  data: {
    id: string;
    name: string;
  };
  timestamp: number;
}

const activityCache = new Map<string, CachedActivity>();
const responsibilityCache = new Map<string, CachedResponsibility>();
const CACHE_EXPIRY_MS = 60 * 1000; // 1 minute

// Function to clean expired cache entries
function cleanExpiredCache() {
  const now = Date.now();
  
  // Clean activity cache
  for (const [key, cached] of activityCache.entries()) {
    if ((now - cached.timestamp) >= CACHE_EXPIRY_MS) {
      activityCache.delete(key);
    }
  }
  
  // Clean responsibility cache
  for (const [key, cached] of responsibilityCache.entries()) {
    if ((now - cached.timestamp) >= CACHE_EXPIRY_MS) {
      responsibilityCache.delete(key);
    }
  }
}

// Clean cache periodically (every 5 minutes)
setInterval(cleanExpiredCache, 5 * 60 * 1000);

// Activity and Responsibility operations
export async function searchActivities(activitiesDatabaseId: string, searchText?: string) {
  const queryBody: any = {};
  if (searchText) {
    // Search in both Name and Description fields
    queryBody.filter = {
      or: [
        {
          property: "Name",
          title: {
            contains: searchText
          }
        },
        {
          property: "Description",
          rich_text: {
            contains: searchText
          }
        }
      ]
    };
  }
  
  return queryDatabase(activitiesDatabaseId, queryBody);
}

export async function searchResponsibilities(responsibilitiesDatabaseId: string, searchText?: string) {
  const queryBody: any = {};
  if (searchText) {
    // Search in both Name and Description fields  
    queryBody.filter = {
      or: [
        {
          property: "Name",
          title: {
            contains: searchText
          }
        },
        {
          property: "Description",
          rich_text: {
            contains: searchText
          }
        }
      ]
    };
  }
  
  return queryDatabase(responsibilitiesDatabaseId, queryBody);
}

// Helper function to get activity details by ID with caching
export async function getActivityDetails(activityId: string) {
  // Check cache first
  const cached = activityCache.get(activityId);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_EXPIRY_MS) {
    return cached.data;
  }
  
  try {
    const response = await notionRequest(`https://api.notion.com/v1/pages/${activityId}`);
    const properties = response.properties;
    
    const responsibilityId = properties.Responsibilities?.relation?.[0]?.id || null;
    let responsibility = null;
    
    // Fetch responsibility details if available
    if (responsibilityId) {
      responsibility = await getResponsibilityDetails(responsibilityId);
    }
    
    const activityData = {
      id: activityId,
      name: properties.Name?.title?.[0]?.text?.content || '',
      responsibility,
      participation: properties.Participation?.select?.name || '',
      description: properties.Description?.rich_text[0]?.plain_text || '',
    };
    
    // Cache the result
    activityCache.set(activityId, {
      data: activityData,
      timestamp: now
    });
    
    return activityData;
  } catch (error) {
    console.error(`Error fetching activity ${activityId}:`, error);
    const fallbackData = {
      id: activityId,
      name: `Unknown Activity (${activityId})`,
      responsibility: null,
    };
    
    // Cache the fallback data as well to avoid repeated failed requests
    activityCache.set(activityId, {
      data: fallbackData,
      timestamp: now
    });
    
    return fallbackData;
  }
}

// Helper function to get responsibility details by ID with caching
export async function getResponsibilityDetails(responsibilityId: string) {
  // Check cache first
  const cached = responsibilityCache.get(responsibilityId);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_EXPIRY_MS) {
    return cached.data;
  }
  
  try {
    const response = await notionRequest(`https://api.notion.com/v1/pages/${responsibilityId}`);
    const properties = response.properties;
    
    const responsibilityData = {
      id: responsibilityId,
      name: properties.Name?.title?.[0]?.text?.content || '',
      description: properties.Description?.rich_text[0]?.plain_text || '',
    };
    
    // Cache the result
    responsibilityCache.set(responsibilityId, {
      data: responsibilityData,
      timestamp: now
    });
    
    return responsibilityData;
  } catch (error) {
    console.error(`Error fetching responsibility ${responsibilityId}:`, error);
    const fallbackData = {
      id: responsibilityId,
      name: `Unknown Responsibility (${responsibilityId})`,
    };
    
    // Cache the fallback data as well to avoid repeated failed requests
    responsibilityCache.set(responsibilityId, {
      data: fallbackData,
      timestamp: now
    });
    
    return fallbackData;
  }
}

// Topics-specific functions (using correct property names)
export async function searchTopics(topicsDatabaseId: string, searchText?: string) {
  const queryBody: any = {};
  if (searchText) {
    // Search in both Title and Text (description) fields
    queryBody.filter = {
      or: [
        {
          property: "Title",
          title: {
            contains: searchText
          }
        },
        {
          property: "Text",
          rich_text: {
            contains: searchText
          }
        }
      ]
    };
  }
  
  return queryDatabase(topicsDatabaseId, queryBody);
}

// Helper function to get topic details by ID with caching
export async function getTopicDetails(topicId: string) {
  // Check cache first  
  const cached = responsibilityCache.get(topicId);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_EXPIRY_MS) {
    return cached.data;
  }
  
  try {
    const response = await notionRequest(`https://api.notion.com/v1/pages/${topicId}`);
    const properties = response.properties;
    
    const topicData = {
      id: topicId,
      name: properties.Title?.title?.[0]?.text?.content || '',
      description: properties.Description?.rich_text[0]?.plain_text || '',
    };
    
    // Cache the result (reusing responsibility cache for topics)
    responsibilityCache.set(topicId, {
      data: topicData,
      timestamp: now
    });
    
    return topicData;
  } catch (error) {
    console.error(`Error fetching topic ${topicId}:`, error);
    const fallbackData = {
      id: topicId,
      name: `Unknown Topic (${topicId})`,
    };
    
    // Cache the fallback data as well to avoid repeated failed requests
    responsibilityCache.set(topicId, {
      data: fallbackData,
      timestamp: now
    });
    
    return fallbackData;
  }
}