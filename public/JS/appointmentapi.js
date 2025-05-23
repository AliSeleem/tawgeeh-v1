/**
 * API Service for mentor availability
 * Handles all API calls to the mentor availability endpoints
 */

const API_BASE_URL = "https://tawgeeh-v1-production.up.railway.app";

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
    const res = await response.json();
    console.log("Response:", res);
    return res;
  },

  // Get all mentor availabilities
  getMentorAvailabilities: async function () {

    try {
      const response = await fetch(`${API_BASE_URL}/mentor-availability`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });

      return this.handleResponse(response);
    } catch (error) {

      showNotification(`خطأ: ${error.message}`);
      throw error;
    }
  },

  // Get specific mentor availability by ID
  getMentorAvailabilityById: async function (id) {

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

      return this.handleResponse(response);
    } catch (error) {

      showNotification(`خطأ: ${error.message}`);
      throw error;
    }
  },

  // Create new mentor availability
  createMentorAvailability: async function (availabilityData) {
    console.log("started")
    
    console.log("ddddd")
    try {
      console.log("ppppppppppppppp")
      const response = await fetch(`${API_BASE_URL}/mentor-availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(availabilityData),
      });
      
      if (!response.ok) {
        console.log("false")
        const errorData = await response.json();
        console.log("Error data:", errorData);
        throw new Error(errorData.message || "API request failed");        
      }
      console.log("Response1:", response);
      return this.handleResponse(response);
    } catch (error) {
      console.log(error)

      showNotification(`خطأ: ${error.message}`);
      throw error;
    }
  },

  // Update mentor availability
  updateMentorAvailability: async function (id, availabilityData) {

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

      return this.handleResponse(response);
    } catch (error) {

      showNotification(`خطأ: ${error.message}`);
      throw error;
    }
  },

  // Delete mentor availability
  deleteMentorAvailability: async function (id) {

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

      return this.handleResponse(response);
    } catch (error) {

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
  if(!notificationsContainer) {
    console.error("Notifications container not found");
    return;
  }
  const notification = document.createElement("div");
  notification.className = "notification";

  notification.innerHTML = `
    <div class="message">${message}</div>
    <span class="close-btn">×</span>
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
// important