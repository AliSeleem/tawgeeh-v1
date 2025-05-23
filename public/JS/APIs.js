document.addEventListener("DOMContentLoaded", function () {
  // API Configuration
  const API_BASE_URL = "https://tawgeeh-v1-production.up.railway.app";

  // Helper function to get headers
  function getHeaders(includeAuth = false) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (includeAuth) {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  // Decode JWT token
  function decodeJWT(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("JWT decode error:", error);
      return null;
    }
  }

  // Retry logic with exponential backoff
  async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        options.signal = controller.signal;

        const response = await fetch(url, options);
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        if (i === retries - 1) {
          throw new Error(
            `فشل الاتصال بعد ${retries} محاولات: ${error.message}`
          );
        }
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, i))
        );
      }
    }
  }

  // Enhanced error handling
  async function handleApiError(response) {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      const errorMessage = errorData.message || "حدث خطأ غير متوقع";
      const validationErrors = errorData.error || [];
      console.log("API error response:", JSON.stringify(errorData, null, 2)); // Log full error response

      // Handle specific validation errors
      if (response.status === 400 && validationErrors.length > 0) {
        const fieldErrors = {};

        // Process each validation error
        validationErrors.forEach((error) => {
          if (error.field && error.errors && error.errors.length > 0) {
            fieldErrors[error.field] = error.errors[0];
          }
        });

        // If we have field-specific errors, throw a structured error
        if (Object.keys(fieldErrors).length > 0) {
          const error = new Error(`فشل التحقق: ${errorMessage}`);
          error.fieldErrors = fieldErrors;
          throw error;
        }
      }

      // General error handling by status code
      switch (response.status) {
        case 400:
          throw new Error(`طلب غير صالح: ${errorMessage}`);
        case 401:
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          localStorage.removeItem("userId");
          window.location.href = "../index.html";
          throw new Error(`غير مصرح: ${errorMessage}`);
        case 403:
          throw new Error(`ممنوع: ${errorMessage}`);
        case 404:
          throw new Error(`المورد غير موجود: ${errorMessage}`);
        case 409:
          throw new Error(`إدخال مكرر: ${errorMessage}`);
        case 429:
          throw new Error(`طلبات كثيرة جدًا: حاول مرة أخرى لاحقًا`);
        case 500:
          throw new Error(`خطأ في الخادم: ${errorMessage}`);
        default:
          throw new Error(`خطأ غير متوقع: ${errorMessage}`);
      }
    }
    return response;
  }

  // Show alert with fallback
  function showAlert(title, text, icon) {
    if (window.Swal) {
      return window.Swal.fire({
        title,
        text,
        icon,
        confirmButtonText: "موافق",
      });
    } else {
      alert(`${title}: ${text}`);
      return Promise.resolve();
    }
  }

  // Map experience level to API format
  function mapExperience(experience) {
    switch (experience) {
      case "zero-one":
        return "JUNIOR";
      case "one-three":
        return "INTERMEDIATE";
      case "three-five":
        return "SENIOR";
      case "PlusFive":
        return "EXPERT";
      default:
        return "INTERMEDIATE";
    }
  }

  // Authentication Functions
  window.auth = {
    login: async function (email, password) {
      try {
        console.log("Sending login request:", { email });
        const response = await fetchWithRetry(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ email, password }),
        });

        console.log("Login response status:", response.status);
        await handleApiError(response);

        const data = await response.json();
        console.log("Login response data:", data);

        if (!data.access_token) {
          throw new Error("استجابة الخادم غير صالحة: الرمز مفقود");
        }

        // Validate token and get user ID
        const decodedToken = decodeJWT(data.access_token);
        if (!decodedToken || (!decodedToken.sub && !decodedToken.id)) {
          localStorage.removeItem("authToken");
          throw new Error("رمز غير صالح: معرف المستخدم مفقود");
        }
        const userId = decodedToken.sub || decodedToken.id;

        localStorage.setItem("authToken", data.access_token);

        // Fetch user data from /users/{id}
        let userData;
        try {
          const userResponse = await fetchWithRetry(
            `${API_BASE_URL}/users/${userId}`,
            {
              method: "GET",
              headers: getHeaders(true),
            }
          );
          await handleApiError(userResponse);
          const userResponseData = await userResponse.json();
          console.log("User data response:", userResponseData);

          if (!userResponseData.success || !userResponseData.data) {
            throw new Error("فشل جلب بيانات المستخدم");
          }

          userData = userResponseData.data;
        } catch (error) {
          console.warn(
            "Failed to fetch user data from /users/{id}, falling back to common.fetchUserData:",
            error.message
          );
          // Fallback to existing fetchUserData
          userData = await window.common.fetchUserData(data.access_token);
        }

        // Structure user data for storage
        const storedUserData = {
          id: userData.id || userId,
          name: userData.name || email.split("@")[0],
          email: userData.email || email,
          image_url: userData.image_url || "./default-avatar.png",
          isMentor: userData.isMentor || false,
          role: userData.role || "USER",
          phone: userData.phone || "",
          gender: userData.gender || "",
          country: userData.country || "",
          specialization: userData.specialization || "",
          experienceLevel: userData.experienceLevel || "",
          bio: userData.bio || "",
          emailVerified: userData.emailVerified !== false,
          phoneVerified: userData.phoneVerified !== false,
          signup_method: userData.signup_method || "MANUAL",
          linkedin: userData.linkedin || "",
          behance: userData.behance || "",
          github: userData.github || "",
          instagram: userData.instagram || "",
          totalSessions: userData.totalSessions || 0,
          totalMinutes: userData.totalMinutes || 0,
          createdAt: userData.createdAt || "",
          updatedAt: userData.updatedAt || "",
        };

        if (!storedUserData.id) {
          console.warn(
            "User ID missing in user data, proceeding with limited functionality"
          );
        }

        localStorage.setItem("userData", JSON.stringify(storedUserData));
        return { access_token: data.access_token, user: storedUserData };
      } catch (error) {
        console.error("Login error:", error.message);
        throw error;
      }
    },

    register: async function (userData) {
      try {
        console.log("Incoming userData:", JSON.stringify(userData, null, 2));

        if (
          !userData.fullName?.trim() ||
          !userData.email?.trim() ||
          !userData.password?.trim() ||
          !userData.phone?.trim() ||
          !userData.gender ||
          !userData.country ||
          !userData.specialization?.trim() ||
          !userData.experience ||
          !userData.aboutMe?.trim()
        ) {
          throw new Error("الحقول المطلوبة مفقودة أو غير صالحة");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email.trim())) {
          throw new Error("البريد الإلكتروني غير صالح");
        }

        let phone = userData.phone.trim();
        const digitsOnly = phone.replace(/\D/g, "");
        const egyptianMobileRegex = /^(010|011|012|015)\d{8}$/;

        if (!egyptianMobileRegex.test(digitsOnly)) {
          const error = new Error(
            "رقم الهاتف غير صالح: يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقمًا"
          );
          error.fieldErrors = {
            phone:
              "يرجى إدخال رقم هاتف مصري صالح يبدأ بـ 010 أو 011 أو 012 أو 015",
          };
          throw error;
        }

        const requestBody = {
          name: userData.fullName.trim(),
          email: userData.email.trim(),
          password: userData.password.trim(),
          phone: phone,
          gender: userData.gender,
          country: userData.country,
          specialization: userData.specialization.trim(),
          experienceLevel: mapExperience(userData.experience),
          bio: userData.aboutMe.trim(),
        };

        console.log(
          "Registration request body:",
          JSON.stringify(requestBody, null, 2)
        );
        const response = await fetchWithRetry(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(requestBody),
        });

        console.log("Registration response status:", response.status);
        await handleApiError(response);
        const data = await response.json();
        console.log("Registration response:", JSON.stringify(data, null, 2));

        if (!data.access_token) {
          throw new Error("استجابة الخادم غير صالحة: الرمز مفقود");
        }

        const decodedToken = decodeJWT(data.access_token);
        if (!decodedToken || (!decodedToken.sub && !decodedToken.id)) {
          localStorage.removeItem("authToken");
          throw new Error("رمز غير صالح: معرف المستخدم مفقود");
        }

        const userId = decodedToken.sub || decodedToken.id;
        localStorage.setItem("userId", userId);
        localStorage.setItem("authToken", data.access_token);

        let user = await window.common.fetchUserData(data.access_token);
        user = {
          id: user.id || userId,
          name: user.name || requestBody.name,
          email: user.email || requestBody.email,
          image_url: user.image_url || "./default-avatar.png",
          isMentor: user.isMentor || false,
          phoneVerified: user.phoneVerified !== false,
          emailVerified: user.emailVerified !== false,
          specialization: user.specialization || requestBody.specialization,
          bio: user.bio || requestBody.bio,
        };

        localStorage.setItem("userData", JSON.stringify(user));
        return { access_token: data.access_token, userId, user };
      } catch (error) {
        console.error("Registration error:", {
          message: error.message,
          stack: error.stack,
        });
        throw error;
      }
    },

    verifyEmail: async function (userId, code) {
      try {
        console.log("Sending email verification request:", { userId, code });
        const response = await fetchWithRetry(
          `${API_BASE_URL}/auth/verify-email`,
          {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({ userId, code }),
          }
        );
        await handleApiError(response);
        const data = await response.json();
        console.log("Email verification response:", data);
        if (data.success) {
          localStorage.removeItem("userId");
          localStorage.removeItem("signupEmail");
        }
        return data;
      } catch (error) {
        console.error("Email verification error:", error.message);
        throw error;
      }
    },

    requestVerificationCode: async function (email) {
      try {
        console.log("Sending verification code request:", { email });
        const response = await fetchWithRetry(
          `${API_BASE_URL}/auth/resend-verification`,
          {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ email }),
          }
        );
        await handleApiError(response);
        const data = await response.json();
        console.log("Verification code resend response:", data);
        return data;
      } catch (error) {
        console.error("Verification code resend error:", error.message);
        throw error;
      }
    },

    requestPasswordReset: async function (email) {
      try {
        console.log("Sending password reset request:", { email });
        const response = await fetchWithRetry(
          `${API_BASE_URL}/auth/forget-password`,
          {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ email }),
          }
        );
        await handleApiError(response);
        const data = await response.json();
        console.log("Password reset response:", data);
        localStorage.setItem("resetEmail", email);
        return data;
      } catch (error) {
        console.error("Password reset request error:", error.message);
        throw error;
      }
    },

    resetPassword: async function (email, newPassword, code) {
      try {
        console.log("Sending reset password request:", { email, code });
        const response = await fetchWithRetry(
          `${API_BASE_URL}/auth/reset-password`,
          {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({ email, newPassword, code }),
          }
        );
        await handleApiError(response);
        const data = await response.json();
        console.log("Reset password response:", data);
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetCode");
        return data;
      } catch (error) {
        console.error("Password reset error:", error.message);
        throw error;
      }
    },

    logout: async function () {
      try {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("userId");
        localStorage.removeItem("signupEmail");
        localStorage.removeItem("resetEmail");
        return { success: true };
      } catch (error) {
        console.error("Logout error:", error.message);
        throw error;
      }
    },

    fetchNotifications: function () {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("غير مصرح: يجب تسجيل الدخول");
          return [];
        }

        const decodedToken = decodeJWT(token);
        if (!decodedToken || (!decodedToken.sub && !decodedToken.id)) {
          throw new Error("رمز غير صالح: معرف المستخدم مفقود");
        }

        const userId = decodedToken.sub || decodedToken.id;

        // This will be updated live
        const notificationsData = JSON.parse(
          localStorage.getItem("notifications") || "[]"
        );

        // Render immediately
        common.renderNotifications(notificationsData, () =>
          common.updateNotificationCount(notificationsData)
        );

        const source = new EventSource(
          `${API_BASE_URL}/notifications/stream?userId=${userId}`
        );

        source.onopen = () => {
          console.log("SSE connection opened");
        };

        source.addEventListener("notification", (event) => {
          const data = JSON.parse(event.data);
          notificationsData.push(data);
          localStorage.setItem(
            "notifications",
            JSON.stringify(notificationsData)
          );

          // Re-render after update
          common.renderNotifications(notificationsData, () =>
            common.updateNotificationCount(notificationsData)
          );
        });

        source.onerror = (error) => {
          console.error("SSE error:", error);
          console.log("EventSource state:", source.readyState);
        };

        // Return both the array (by reference) and a stop method
        return notificationsData;
      } catch (error) {
        console.error("Notification listener error:", error.message);
        throw error;
      }
    },

    handleOAuthCallback: async function () {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        if (!token) {
          throw new Error("لم يتم العثور على رمز OAuth");
        }

        const decodedToken = decodeJWT(token);
        if (!decodedToken || (!decodedToken.sub && !decodedToken.id)) {
          throw new Error("رمز OAuth غير صالح: معرف المستخدم مفقود");
        }

        localStorage.setItem("authToken", token);
        const userData = await window.common.fetchUserData(token);

        const user = {
          id: userData.id || decodedToken.sub || decodedToken.id || null,
          name: userData.name || "مستخدم OAuth",
          email: userData.email || "",
          image_url: userData.image_url || "./default-avatar.png",
          isMentor: userData.isMentor || false,
          phoneVerified: userData.phoneVerified !== false,
          emailVerified: userData.emailVerified !== false,
          specialization: userData.specialization || "",
          bio: userData.bio || "",
        };

        localStorage.setItem("userData", JSON.stringify(user));
        window.location.href = window.location.pathname;
        return { success: true, user };
      } catch (error) {
        console.error("OAuth callback error:", error.message);
        throw error;
      }
    },
  };
});
