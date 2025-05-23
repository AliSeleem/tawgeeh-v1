// api.js
const API_BASE_URL = "https://tawgeeh-v1-production.up.railway.app";

async function apiRequest(url, method, data, token, isFormData = false) {
  const headers = isFormData
    ? { Authorization: `Bearer ${token}` }
    : {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

  const config = {
    method,
    headers,
    body: isFormData ? data : data ? JSON.stringify(data) : null,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "API request failed");
    }

    return result.data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Certifications API
async function createCertification(data, token) {
  return apiRequest("/certifications", "POST", data, token);
}

async function getCertifications(userId, token) {
  return apiRequest(`/certifications/${userId}`, "GET", null, token);
}

async function getCertification(userId, id, token) {
  return apiRequest(`/certifications/${userId}/${id}`, "GET", null, token);
}

async function updateCertification(id, data, token) {
  return apiRequest(`/certifications/${id}`, "PATCH", data, token);
}

async function deleteCertification(id, token) {
  return apiRequest(`/certifications/${id}`, "DELETE", null, token);
}

// Experiences API
async function createExperience(data, token, userId) {
  return apiRequest(`/experiences`, "POST", data, token);
}

async function getExperiences(userId, token) {
  return apiRequest(`/experiences/${userId}`, "GET", null, token);
}

async function getExperience(userId, id, token) {
  return apiRequest(`/experiences/${userId}/${id}`, "GET", null, token);
}

async function updateExperience(id, data, token) {
  return apiRequest(`/experiences/${id}`, "PATCH", data, token);
}

async function deleteExperience(id, token) {
  return apiRequest(`/experiences/${id}`, "DELETE", null, token);
}

// Education API
async function createEducation(data, token, userId) {
  return apiRequest(`/education`, "POST", data, token);
}

async function getEducation(userId, token) {
  return apiRequest(`/education/${userId}`, "GET", null, token);
}

async function getEducationItem(userId, id, token) {
  return apiRequest(`/education/${userId}/${id}`, "GET", null, token);
}

async function updateEducation(id, data, token) {
  return apiRequest(`/education/${id}`, "PATCH", data, token);
}

async function deleteEducation(id, token) {
  return apiRequest(`/education/${id}`, "DELETE", null, token);
}

// Ratings API
async function createRating(data, token, userId) {
  return apiRequest(`/ratings`, "POST", { ...data, userId }, token);
}

async function getRatings(userId, token) {
  return apiRequest(`/ratings/${userId}`, "GET", null, token);
}

async function getRating(userId, id, token) {
  return apiRequest(`/ratings/${userId}/${id}`, "GET", null, token);
}

async function updateRating(id, data, token) {
  return apiRequest(`/ratings/${id}`, "PATCH", data, token);
}

async function deleteRating(id, token) {
  return apiRequest(`/ratings/${id}`, "DELETE", null, token);
}

async function likeRating(id, token) {
  return apiRequest(`/ratings/${id}/like`, "POST", null, token);
}

// Achievements API
async function createAchievement(data, token, userId) {
  return apiRequest(`/achievements`, "POST", { ...data, userId }, token);
}

async function getAchievements(userId, token) {
  return apiRequest(`/achievements/${userId}`, "GET", null, token);
}

async function getAchievement(userId, id, token) {
  return apiRequest(`/achievements/${userId}/${id}`, "GET", null, token);
}

async function updateAchievement(id, data, token) {
  return apiRequest(`/achievements/${id}`, "PATCH", data, token);
}

async function deleteAchievement(id, token) {
  return apiRequest(`/achievements/${id}`, "DELETE", null, token);
}

// Services API
async function createService(data, token, userId) {
  return apiRequest(`/services`, "POST", { ...data, userId }, token);
}

async function getServices(userId, token) {
  return apiRequest(`/mentor-service/${userId}`, "GET", null, token);
}

async function getService(userId, id, token) {
  return apiRequest(`/mentor-service/${userId}/${id}`, "GET", null, token);
}

async function updateService(id, data, token) {
  return apiRequest(`/mentor-service/${id}`, "PATCH", data, token);
}

async function deleteService(id, token) {
  return apiRequest(`/mentor-service/${id}`, "DELETE", null, token);
}

export {
  createCertification,
  getCertifications,
  getCertification,
  updateCertification,
  deleteCertification,
  createExperience,
  getExperiences,
  getExperience,
  updateExperience,
  deleteExperience,
  createEducation,
  getEducation,
  getEducationItem,
  updateEducation,
  deleteEducation,
  createRating,
  getRatings,
  getRating,
  updateRating,
  deleteRating,
  likeRating,
  createAchievement,
  getAchievements,
  getAchievement,
  updateAchievement,
  deleteAchievement,
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
};
