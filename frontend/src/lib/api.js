// API utility functions for backend communication

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Get user ID from localStorage
function getUserId() {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData._id || userData.id;
    } catch (e) {
      console.error("Failed to parse user data:", e);
    }
  }
  return null;
}

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Get headers with authentication
function getHeaders() {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Fallback to user ID for backward compatibility
  const userId = getUserId();
  if (userId && !token) {
    headers["x-user-id"] = userId;
  }
  return headers;
}

// Journal Entries API
export const journalAPI = {
  // Get all entries; pass archived=true/false to filter, or null/undefined to fetch all
  async getAll(archived = null) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("User not logged in");
    }

    const url =
      archived === null || archived === undefined
        ? `${API_BASE}/api/journal`
        : `${API_BASE}/api/journal?archived=${archived}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch journal entries");
    }

    const data = await response.json();
    // Transform MongoDB entries to match frontend format
    return data.entries.map(transformEntry);
  },

  // Get single entry
  async getById(id) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("User not logged in");
    }

    const response = await fetch(`${API_BASE}/api/journal/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch journal entry");
    }

    const data = await response.json();
    return transformEntry(data.entry);
  },

  // Create entry
  async create(entry) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("User not logged in");
    }

    const response = await fetch(`${API_BASE}/api/journal`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create journal entry");
    }

    const data = await response.json();
    return transformEntry(data.entry);
  },

  // Update entry
  async update(id, updates) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("User not logged in");
    }

    const response = await fetch(`${API_BASE}/api/journal/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update journal entry");
    }

    const data = await response.json();
    return transformEntry(data.entry);
  },

  // Delete entry
  async delete(id) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("User not logged in");
    }

    const response = await fetch(`${API_BASE}/api/journal/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete journal entry");
    }

    return true;
  },

  // Archive/Unarchive entry
  async archive(id, isArchived = true) {
    const token = getAuthToken();
    if (!token) {
      throw new Error("User not logged in");
    }

    const response = await fetch(`${API_BASE}/api/journal/${id}/archive`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({
        isArchived,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to archive journal entry");
    }

    const data = await response.json();
    return transformEntry(data.entry);
  },
};

// Transform MongoDB entry to frontend format
function transformEntry(entry) {
  if (!entry) return null;

  return {
    id: entry._id || entry.id,
    content: entry.content,
    mood: entry.mood,
    emotions: entry.emotions || [],
    tags: entry.tags || [],
    entryType: entry.entryType || "text",
    isArchived: entry.isArchived || false,
    aiInsight: entry.aiInsight,
    recommendation: entry.recommendation,
    recommendedActivities: entry.recommendedActivities || {
      wellness: [],
      natureSounds: [],
      games: [],
    },
    question: entry.question,
    intensity: entry.intensity,
    stressLevel: entry.stressLevel,
    keywords: entry.keywords || [],
    aiSource: entry.aiSource,
    sentiment: entry.sentiment || { score: 0, label: "neutral" },
    createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
    updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
  };
}

// User API
export const userAPI = {
  // Get user profile
  async getProfile() {
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    return await response.json();
  },

  // Update user profile
  async updateProfile(updates) {
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update profile");
    }

    return await response.json();
  },

  // Change email
  async changeEmail(newEmail, password) {
    const response = await fetch(`${API_BASE}/api/user/change-email`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ newEmail, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to change email");
    }

    return await response.json();
  },

  // New: request email change OTP
  async requestEmailChange(newEmail) {
    const response = await fetch(`${API_BASE}/api/user/change-email/request`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ newEmail }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to request email change");
    }

    return await response.json();
  },

  // New: verify OTP and update email
  async verifyEmailChange(newEmail, otp) {
    const response = await fetch(`${API_BASE}/api/user/change-email/verify`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ newEmail, otp }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to verify email change");
    }

    return await response.json();
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    const response = await fetch(`${API_BASE}/api/user/change-password`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to change password");
    }

    return await response.json();
  },

  // Get user settings
  async getSettings() {
    const response = await fetch(`${API_BASE}/api/user/settings`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch settings");
    }

    return await response.json();
  },

  // Update user settings
  async updateSettings(settings) {
    const response = await fetch(`${API_BASE}/api/user/settings`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update settings");
    }

    return await response.json();
  },

  // Set archive password
  async setArchivePassword(password) {
    const response = await fetch(`${API_BASE}/api/user/archive-password`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to set archive password");
    }

    return await response.json();
  },

  // Verify archive password
  async verifyArchivePassword(password) {
    const response = await fetch(
      `${API_BASE}/api/user/archive-password/verify`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ password }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to verify archive password");
    }

    return await response.json();
  },

  // Remove archive password
  async removeArchivePassword() {
    const response = await fetch(`${API_BASE}/api/user/archive-password`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to remove archive password");
    }

    return await response.json();
  },

  // Export user data
  async exportData() {
    const response = await fetch(`${API_BASE}/api/user/export`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to export data");
    }

    const data = await response.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wellness-journal-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return data;
  },

  // Delete account
  async deleteAccount(password) {
    const response = await fetch(`${API_BASE}/api/user/account`, {
      method: "DELETE",
      headers: getHeaders(),
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete account");
    }

    return await response.json();
  },
};

// Notifications API
export const notificationsAPI = {
  // Send scheduled reminder email
  async sendReminder() {
    const response = await fetch(
      `${API_BASE}/api/notifications/send-reminder`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send reminder email");
    }

    return await response.json();
  },

  // Send weekly summary email
  async sendWeeklySummary(data) {
    const response = await fetch(
      `${API_BASE}/api/notifications/send-weekly-summary`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send weekly summary email");
    }

    return await response.json();
  },
};
