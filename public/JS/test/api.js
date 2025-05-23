/**
 * API Service for mentor availability
 * Handles all API calls to the mentor availability endpoints
 */

const API_BASE_URL = "https://tawgeeh-v1-production.up.railway.app"; // Replace with actual API base URL

// API service object
const apiService = {
  // Get auth token from localStorage
  getAuthToken: function () {
    return localStorage.getItem("authToken");
  },

  // Set auth token in localStorage
  setAuthToken: function (token) {
    localStorage.setItem("authToken", token);
  },

  // Helper function to handle API responses
  handleResponse: async function (response) {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "API request failed");
    }
    return response.json();
  },

  // Get all mentor availabilities
  getMentorAvailabilities: async function () {
    showLoading();
    try {
      const response = await fetch(`${API_BASE_URL}/mentor-availability`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });
      hideLoading();
      return this.handleResponse(response);
    } catch (error) {
      hideLoading();
      showNotification(`خطأ: ${error.message}`);
      throw error;
    }
  },

  // Get specific mentor availability by ID
  getMentorAvailabilityById: async function (id) {
    showLoading();
    try {
      const response = await fetch(
        `${API_BASE_URL}/mentor-availability/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
      hideLoading();
      return this.handleResponse(response);
    } catch (error) {
      hideLoading();
      showNotification(`خطأ: ${error.message}`);
      throw error;
    }
  },

  // Create new mentor availability
  createMentorAvailability: async function (availabilityData) {
    showLoading();
    try {
      const response = await fetch(`${API_BASE_URL}/mentor-availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(availabilityData),
      });
      hideLoading();
      return this.handleResponse(response);
    } catch (error) {
      hideLoading();
      showNotification(`خطأ: ${error.message}`);
      throw error;
    }
  },

  // Update mentor availability
  updateMentorAvailability: async function (id, availabilityData) {
    showLoading();
    try {
      const response = await fetch(
        `${API_BASE_URL}/mentor-availability/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
          body: JSON.stringify(availabilityData),
        }
      );
      hideLoading();
      return this.handleResponse(response);
    } catch (error) {
      hideLoading();
      showNotification(`خطأ: ${error.message}`);
      throw error;
    }
  },

  // Delete mentor availability
  deleteMentorAvailability: async function (id) {
    showLoading();
    try {
      const response = await fetch(
        `${API_BASE_URL}/mentor-availability/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );
      hideLoading();
      return this.handleResponse(response);
    } catch (error) {
      hideLoading();
      showNotification(`خطأ: ${error.message}`);
      throw error;
    }
  },
};

// Helper functions for loading and notifications
function showLoading() {
  document.getElementById("loading-overlay").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loading-overlay").style.display = "none";
}

function showNotification(message, duration = 5000) {
  const notificationsContainer = document.getElementById("notifications");
  const notification = document.createElement("div");
  notification.className = "notification";

  notification.innerHTML = `
    <div class="message">${message}</div>
    <span class="close-btn">&times;</span>
  `;

  notificationsContainer.appendChild(notification);

  // Add event listener to close button
  const closeBtn = notification.querySelector(".close-btn");
  closeBtn.addEventListener("click", () => {
    notification.remove();
  });

  // Auto-remove notification after duration
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, duration);
}
