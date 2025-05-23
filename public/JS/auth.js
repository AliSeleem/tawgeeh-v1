window.common = window.common || {};

// Check if user is authenticated
common.isAuthenticated = function () {
  return !!localStorage.getItem("authToken");
};

// Restrict access to authenticated users
common.restrictAccess = function (callback) {
  if (common.isAuthenticated()) {
    callback();
  } else {
    common.showSignupPopup();
  }
};

// Fetch user data with retry logic
common.fetchUserData = async function (token) {
  const API_BASE_URL = "https://tawgeeh-v1-production.up.railway.app";
  const retries = 3;
  const delay = 1000;

  for (let i = 0; i < retries; i++) {
    try {
      const decodedToken = common.decodeJWT(token);
      if (!decodedToken || (!decodedToken.sub && !decodedToken.id)) {
        throw new Error("Invalid token: User ID not found");
      }
      const userId = decodedToken.sub || decodedToken.id;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }
        const errorMessage =
          errorData.message || `HTTP error! status: ${response.status}`;
        switch (response.status) {
          case 401:
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            localStorage.removeItem("userId");
            window.location.href = "../index.html";
            throw new Error(`Unauthorized: ${errorMessage}`);
          case 403:
            throw new Error(`Forbidden: ${errorMessage}`);
          case 404:
            throw new Error(`User not found: ${errorMessage}`);
          case 429:
            throw new Error(`Too many requests: Please try again later`);
          case 500:
            throw new Error(`Server error: ${errorMessage}`);
          default:
            throw new Error(`Unexpected error: ${errorMessage}`);
        }
      }

      const responseData = await response.json();
      const rawData = responseData.data || responseData || {};
      return {
        id: rawData.id || null,
        name: rawData.name || null,
        email: rawData.email || null,
        image_url: rawData.image_url || "./default-avatar.png",
        isMentor: rawData.isMentor || false,
        phoneVerified: rawData.phoneVerified !== false,
        specialization: rawData.specialization || "",
        bio: rawData.bio || "",
      };
    } catch (error) {
      if (i === retries - 1) {
        console.error("Fetch user data failed after retries:", error.message);
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }
};

// Initialize sidebar with mentor-specific link
common.initializeSidebar = function (userData) {
  const authSection = document.querySelector(".auth-section");
  if (!authSection) {
    console.warn("Auth section not found");
    return;
  }

  const dropdown = document.createElement("div");
  dropdown.className = "profile-dropdown";
  dropdown.innerHTML = `
    <ul class="dropdown-menu">
      <li>
        <a href="../pages/mentor-veiw.html" class="profile-link">
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </span>
          <span>حسابي</span>
        </a>
      </li>
      ${
        userData && userData.isMentor
          ? `
      <li>
        <a href="../pages/mentor-dashboard.html" class="dashboard-link">
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
          </span>
          <span>لوحة تحكم المرشد</span>
        </a>
      </li>
      `
          : ""
      }
      <li>
        <a href="../pages/settings.html" class="Settings-link">
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </span>
          <span>الإعدادات</span>
        </a>
      </li>
      <li>
        <a href="#" id="logoutBtn">
          <span class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </span>
          <span>تسجيل الخروج</span>
        </a>
      </li>
    </ul>
  `;

  authSection.appendChild(dropdown);

  const arrow = authSection.querySelector(".arrow-down");
  if (arrow) {
    arrow.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdown.classList.toggle("show");
    });
  }

  document.addEventListener("click", (e) => {
    if (
      !authSection.contains(e.target) &&
      !dropdown.contains(e.target) &&
      dropdown.classList.contains("show")
    ) {
      dropdown.classList.remove("show");
    }
  });

  const logoutBtn = dropdown.querySelector("#logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await window.auth.logout();
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("userId");
        window.location.href = "../index.html";
      } catch (error) {
        console.error("Logout failed:", error.message);
        await common.showAlert(
          "خطأ",
          "فشل تسجيل الخروج. حاول مرة أخرى.",
          "error"
        );
      }
    });
  }
};

// Initialize authentication
common.initializeAuth = async function (
  authSection,
  currentNotifications,
  showLoginPopup,
  showSignupPopup,
  toggleNotifications,
  updateNotificationCount
) {
  if (!authSection) {
    console.warn("Auth section not found");
    return;
  }

  const accessToken = localStorage.getItem("authToken");

  if (accessToken) {
    try {
      const userData = await common.fetchUserData(accessToken);
      if (userData) {
        authSection.innerHTML = `
          <a class="titel" href="#">
            <img src="${common.sanitizeHTML(
              userData.image_url
            )}" alt="صورة المرشد" style="width: 60px; height: 60px; border-radius: 50%" />
            <p class="mentor_name">${common.sanitizeHTML(
              userData.name || "مستخدم"
            )}</p>
            <img class="arrow-down" width="24px" height="24px" src="./images/arrow-down.svg" alt="Arrow Down" />
          </a>
          <div class="buttonsNav">
            <button class="messageBtn" aria-label="الرسائل">
              <img src="../mentor-images/messages-2.svg" alt="رسائل" />
            </button>
            <button class="notBtn" aria-label="الإشعارات">
              <img src="../mentor-images/notification.svg" alt="إشعارات" />
              <span class="notification-count">${
                currentNotifications.length
              }</span>
            </button>
          </div>
        `;

        common.initializeSidebar(userData);
        const notBtn = authSection.querySelector(".notBtn");
        const messageBtn = authSection.querySelector(".messageBtn");
        if (notBtn) {
          notBtn.addEventListener("click", toggleNotifications);
        }
        if (messageBtn) {
          messageBtn.addEventListener("click", common.showChat);
        }
        updateNotificationCount();
      }
    } catch (error) {
      console.error("Auth initialization error:", error.message);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("userId");
      common.initializeAuth(
        authSection,
        currentNotifications,
        showLoginPopup,
        showSignupPopup,
        toggleNotifications,
        updateNotificationCount
      );
    }
  } else {
    authSection.innerHTML = `
      <div class="auth-group">
        <button class="signup-btn">انشاء حساب جديد</button>
        <button class="login-btn">تسجيل الدخول</button>
      </div>
    `;
    const signupBtn = authSection.querySelector(".signup-btn");
    const loginBtn = authSection.querySelector(".login-btn");
    if (signupBtn) {
      signupBtn.addEventListener("click", showSignupPopup);
    }
    if (loginBtn) {
      loginBtn.addEventListener("click", showLoginPopup);
    }
    currentNotifications.length = 0;
    updateNotificationCount();
  }
};

// Show chat interface
common.showChat = function () {
  common.restrictAccess(() => {
    window.location.href = "/pages/chat.html";
  });
};