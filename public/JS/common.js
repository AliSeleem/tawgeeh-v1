document.addEventListener("DOMContentLoaded", function () {
  window.common = window.common || {};

  // Helper function to decode JWT token
  common.decodeJWT = function (token) {
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
      console.warn("JWT decode error:", error.message);
      return null;
    }
  };

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

  // Show alert with fallback
  common.showAlert = function (title, text, icon) {
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
  };

  // Show signup popup
  common.showSignupPopup = function () {
    const popupContainer = document.querySelector(".signup-popup-container");
    const popupOverlay = document.querySelector(".signup-popup-overlay");
    if (!popupContainer || !popupOverlay) {
      console.warn("Signup popup elements not found");
      return;
    }

    popupContainer.classList.add("show");
    popupContainer.style.display = "flex";
    popupContainer.removeAttribute("aria-hidden");
    popupOverlay.classList.add("show");
    popupOverlay.style.display = "block";

    const signup1 = document.getElementById("signup1");
    const signup2 = document.getElementById("signup2");
    const signup3 = document.getElementById("signup3");
    if (signup1 && signup2 && signup3) {
      signup1.style.display = "block";
      signup2.style.display = "none";
      signup3.style.display = "none";

      const con1 = popupContainer.querySelector(".con1");
      const con2 = popupContainer.querySelector(".con2");
      const con3 = popupContainer.querySelector(".con3");
      if (con1 && con2 && con3) {
        con1.classList.add("conChecked");
        con2.classList.remove("conChecked");
        con3.classList.remove("conChecked");
      }
    }

    const fullNameInput = popupContainer.querySelector("#fullName");
    if (fullNameInput) fullNameInput.focus();

    const form = popupContainer.querySelector("#signupForm1");
    if (form) {
      form.reset();
      const errorSpans = form.querySelectorAll(".error");
      errorSpans.forEach((span) => (span.textContent = ""));
    }

    common.hideLoginPopup();
    common.hideMentorApplicationPopup();
    common.hidePasswordResetPopup();
  };

  // Hide signup popup
  common.hideSignupPopup = function () {
    const popupContainer = document.querySelector(".signup-popup-container");
    const popupOverlay = document.querySelector(".signup-popup-overlay");
    if (!popupContainer || !popupOverlay) return;

    const signup3 = document.getElementById("signup3");
    if (signup3 && signup3.style.display === "block") {
      common.showAlert(
        "التحقق مطلوب",
        "يرجى إدخال رمز التحقق لإكمال التسجيل.",
        "warning"
      );
      return;
    }

    popupContainer.classList.remove("show");
    popupContainer.style.display = "none";
    popupContainer.setAttribute("aria-hidden", "true");
    popupOverlay.classList.remove("show");
    popupOverlay.style.display = "none";

    const signup1 = document.getElementById("signup1");
    const signup2 = document.getElementById("signup2");
    const signup32 = document.getElementById("signup3");
    if (signup1 && signup2 && signup32) {
      signup1.style.display = "block";
      signup2.style.display = "none";
      signup3.style.display = "none";
    }

    const forms = [
      popupContainer.querySelector("#signupForm1"),
      popupContainer.querySelector("#signupForm2"),
      popupContainer.querySelector("#signupForm3"),
    ];
    forms.forEach((form) => {
      if (form) {
        form.reset();
        const errorSpans = form.querySelectorAll(".error");
        errorSpans.forEach((span) => (span.textContent = ""));
      }
    });

    const con1 = popupContainer.querySelector(".con1");
    const con2 = popupContainer.querySelector(".con2");
    const con3 = popupContainer.querySelector(".con3");
    if (con1 && con2 && con3) {
      con1.classList.add("conChecked");
      con2.classList.remove("conChecked");
      con3.classList.remove("conChecked");
    }
  };

  // Initialize signup popup
  common.initializeSignupPopup = function () {
    const popupContainer = document.querySelector(".signup-popup-container");
    if (!popupContainer) {
      console.warn("Signup popup container not found");
      return;
    }

    const signupCloseBtn = popupContainer.querySelector(".signup-popup-close");
    const signupPopupOverlay = document.querySelector(".signup-popup-overlay");
    if (signupCloseBtn) {
      signupCloseBtn.addEventListener("click", common.hideSignupPopup);
    }
    if (signupPopupOverlay) {
      signupPopupOverlay.addEventListener("click", common.hideSignupPopup);
    }

    const signupBtn = document.querySelector("#signupBtn");
    const loginBtn2 = document.querySelector("#loginbtn2");
    const loginBtn3 = document.querySelector("#loginbtn3");
    const arrowRightS1 = document.querySelector("#arrowRightS1");
    const arrowRightS2 = document.querySelector("#arrowRightS2");
    const resendCode = document.querySelector("#resendCode");

    let signupData = {};
    let isPrivacyAccepted = false;

    if (signupBtn) {
      signupBtn.addEventListener("click", () => {
        const form = document.querySelector("#signupForm1");
        if (common.validateForm1(form)) {
          const fullName = form.querySelector("#fullName").value.trim();
          const email = form.querySelector("#signupEmail").value.trim();
          const phone = form.querySelector("#phone").value.trim();
          const password = form.querySelector("#signupPassword").value.trim();
          isPrivacyAccepted = form.querySelector("#privacyCheckbox1").checked;
          signupData = { fullName, email, phone, password };

          document.getElementById("signup1").style.display = "none";
          document.getElementById("signup2").style.display = "block";
          const con2 = popupContainer.querySelector(".con2");
          if (con2) con2.classList.add("conChecked");

          const privacyCheckbox2 = document.querySelector("#privacyCheckbox2");
          if (privacyCheckbox2) {
            privacyCheckbox2.checked = isPrivacyAccepted;
          }

          document.getElementById("specialization").focus();
        }
      });
    }

    // Inside common.initializeSignupPopup
    // Inside common.initializeSignupPopup
    if (loginBtn2) {
      loginBtn2.addEventListener("click", async () => {
        const form = document.querySelector("#signupForm2");
        if (!form) {
          console.error("Signup form 2 not found");
          return;
        }

        // Validate form2 before proceeding
        if (common.validateForm2(form)) {
          const specialization = form
            .querySelector("#specialization")
            .value.trim();
          const country = form.querySelector("#country").value;
          const experience = form.querySelector("#experience").value;
          const gender = form.querySelector("#gender").value;
          const aboutMe = form.querySelector("#about_me").value.trim();

          signupData = {
            ...signupData,
            specialization,
            country,
            experience,
            gender,
            aboutMe,
          };

          const loadingSpinner =
            popupContainer.querySelector(".loading-spinner");
          if (loadingSpinner) loadingSpinner.style.display = "block";
          loginBtn2.disabled = true; // Use let if reassignment is needed, but prefer state management

          try {
            const response = await window.auth.register(signupData);
            localStorage.setItem("signupEmail", signupData.email);
            document.getElementById("signup2").style.display = "none";
            document.getElementById("signup3").style.display = "block";
            const con3 = popupContainer.querySelector(".con3");
            if (con3) con3.classList.add("conChecked");
            document.querySelector(".resetCode")?.focus();

            const signupCloseBtn = popupContainer.querySelector(
              ".signup-popup-close"
            );
            const signupPopupOverlay = document.querySelector(
              ".signup-popup-overlay"
            );
            if (signupCloseBtn) signupCloseBtn.disabled = true;
            if (signupPopupOverlay)
              signupPopupOverlay.style.pointerEvents = "none";
          } catch (error) {
            console.error("Registration error:", error.message);
            let errorMessage = "حدث خطأ أثناء التسجيل";
            let errorField = "specializationError"; // Default to form2 field

            // Handle field-specific errors from API
            if (error.fieldErrors) {
              const field = Object.keys(error.fieldErrors)[0];
              errorMessage = error.fieldErrors[field];
              // Map API field to form field and step
              if (["fullName", "email", "phone", "password"].includes(field)) {
                // Go back to signup1 for form1 fields
                document.getElementById("signup2").style.display = "none";
                document.getElementById("signup1").style.display = "block";
                const con2 = popupContainer.querySelector(".con2");
                if (con2) con2.classList.remove("conChecked");
                form = document.querySelector("#signupForm1"); // Update form reference
                errorField = `${field}Error`; // e.g., "phoneError"
              } else {
                errorField = `${field}Error`; // e.g., "specializationError"
              }
            } else if (error.message.includes("Duplicate entry")) {
              errorMessage = `البريد الإلكتروني مستخدم بالفعل. <a href='javascript:;' onclick='common.hideSignupPopup();common.showLoginPopup();'>تسجيل الدخول؟</a>`;
              document.getElementById("signup2").style.display = "none";
              document.getElementById("signup1").style.display = "block";
              const con2 = popupContainer.querySelector(".con2");
              if (con2) con2.classList.remove("conChecked");
              form = document.querySelector("#signupForm1");
              errorField = "signupEmailError";
            } else if (error.message.includes("Network error")) {
              errorMessage = "فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.";
              await common.showAlert("خطأ في الاتصال", errorMessage, "error");
            } else if (error.message.includes("Invalid token")) {
              errorMessage = "خطأ في استجابة الخادم. حاول مرة أخرى.";
              await common.showAlert("خطأ", errorMessage, "error");
            } else {
              await common.showAlert("خطأ", errorMessage, "error");
            }

            const errorSpan = form.querySelector(`#${errorField}`);
            if (errorSpan) {
              common.showError(errorSpan, errorMessage);
              common.scrollToFirstError(form);
            } else {
              console.error(`Error span #${errorField} not found`);
            }
            localStorage.removeItem("userId");
            localStorage.removeItem("signupEmail");
            localStorage.removeItem("authToken");
          } finally {
            if (loadingSpinner) loadingSpinner.style.display = "none";
            if (loginBtn2) loginBtn2.disabled = false; // Ensure element exists before disabling
          }
        }
      });
    }
    if (loginBtn3) {
      loginBtn3.addEventListener("click", async () => {
        const form = document.querySelector("#signupForm3");
        if (common.validateForm3(form)) {
          const codes = form.querySelectorAll(".code-input");
          const code = Array.from(codes)
            .map((input) => input.value.trim())
            .join("");
          const userId = localStorage.getItem("userId");
          const loadingSpinner =
            popupContainer.querySelector(".loading-spinner");
          if (loadingSpinner) loadingSpinner.style.display = "block";
          loginBtn3.disabled = true;

          try {
            const response = await window.auth.verifyEmail(userId, code);
            if (response.success) {
              const signupCloseBtn = popupContainer.querySelector(
                ".signup-popup-close"
              );
              const signupPopupOverlay = document.querySelector(
                ".signup-popup-overlay"
              );
              if (signupCloseBtn) signupCloseBtn.disabled = false;
              if (signupPopupOverlay)
                signupPopupOverlay.style.pointerEvents = "auto";

              await common.showAlert(
                "تم التحقق بنجاح",
                "تم تفعيل حسابك. يرجى تسجيل الدخول.",
                "success"
              );
              localStorage.removeItem("userId");
              localStorage.removeItem("signupEmail");
              common.hideSignupPopup();
              common.showLoginPopup();
            } else {
              throw new Error("Invalid verification code");
            }
          } catch (error) {
            console.error("Verification error:", error.message);
            let errorMessage = "رمز التحقق غير صحيح";
            if (error.message.includes("Network error")) {
              errorMessage = "فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.";
              await common.showAlert("خطأ في الاتصال", errorMessage, "error");
            }
            const errorSpan = form.querySelector("#verificationCodeError");
            common.showError(errorSpan, errorMessage);
            common.scrollToFirstError(form);
          } finally {
            if (loadingSpinner) loadingSpinner.style.display = "none";
            loginBtn3.disabled = false;
          }
        }
      });
    }

    if (arrowRightS1) {
      arrowRightS1.addEventListener("click", () => {
        document.getElementById("signup2").style.display = "none";
        document.getElementById("signup1").style.display = "block";
        const con2 = popupContainer.querySelector(".con2");
        if (con2) con2.classList.remove("conChecked");
        document.getElementById("fullName").focus();
      });
    }

    if (arrowRightS2) {
      arrowRightS2.addEventListener("click", () => {
        const signup3 = document.getElementById("signup3");
        if (signup3 && signup3.style.display === "block") {
          common.showAlert(
            "التحقق مطلوب",
            "يرجى إدخال رمز التحقق لإكمال التسجيل.",
            "warning"
          );
          return;
        }
        document.getElementById("signup3").style.display = "none";
        document.getElementById("signup2").style.display = "block";
        const con3 = popupContainer.querySelector(".con3");
        if (con3) con3.classList.remove("conChecked");
        document.getElementById("specialization").focus();
      });
    }

    if (resendCode) {
      resendCode.addEventListener("click", async () => {
        const email = localStorage.getItem("signupEmail");
        if (!email) {
          await common.showAlert(
            "خطأ",
            "البريد الإلكتروني غير متوفر. حاول مرة أخرى.",
            "error"
          );
          return;
        }
        try {
          await window.auth.requestVerificationCode(email);
          await common.showAlert(
            "تم",
            "تم إعادة إرسال رمز التحقق إلى بريدك الإلكتروني",
            "success"
          );
        } catch (error) {
          console.error("Resend code error:", error.message);
          await common.showAlert(
            "خطأ",
            "فشل إعادة إرسال رمز التحقق. حاول مرة أخرى.",
            "error"
          );
        }
      });
    }

    const registerBtn1 = popupContainer.querySelector("#registerBtn");
    const registerBtn2 = popupContainer.querySelector("#registerBtn2");
    if (registerBtn1) {
      registerBtn1.addEventListener("click", () => {
        common.hideSignupPopup();
        common.showLoginPopup();
      });
    }
    if (registerBtn2) {
      registerBtn2.addEventListener("click", () => {
        common.hideSignupPopup();
        common.showLoginPopup();
      });
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

  // Sanitize HTML input
  common.sanitizeHTML = function (str) {
    if (typeof str !== "string") return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  };

  // Show login popup
  common.showLoginPopup = function () {
    const popupContainer = document.querySelector(".login-popup-container");
    const popupOverlay = document.querySelector(".login-popup-overlay");
    if (!popupContainer || !popupOverlay) {
      console.warn("Login popup elements not found");
      return;
    }

    popupContainer.classList.add("show");
    popupContainer.style.display = "flex";
    popupContainer.removeAttribute("aria-hidden");
    popupOverlay.classList.add("show");
    popupOverlay.style.display = "block";

    const emailInput = popupContainer.querySelector("#email");
    if (emailInput) emailInput.focus();

    const form = popupContainer.querySelector("#loginForm");
    if (form) {
      form.reset();
      const errorSpans = form.querySelectorAll(".error");
      errorSpans.forEach((span) => (span.textContent = ""));
    }

    common.hideSignupPopup();
    common.hideMentorApplicationPopup();
    common.hidePasswordResetPopup();
  };

  // Hide login popup
  common.hideLoginPopup = function () {
    const popupContainer = document.querySelector(".login-popup-container");
    const popupOverlay = document.querySelector(".login-popup-overlay");
    if (!popupContainer || !popupOverlay) return;

    popupContainer.classList.remove("show");
    popupContainer.style.display = "none";
    popupContainer.setAttribute("aria-hidden", "true");
    popupOverlay.classList.remove("show");
    popupOverlay.style.display = "none";

    const form = popupContainer.querySelector("#loginForm");
    if (form) {
      form.reset();
      const emailError = form.querySelector("#emailError");
      const passwordError = form.querySelector("#passwordError");
      if (emailError) common.clearError(emailError);
      if (passwordError) common.clearError(passwordError);
    }

    const loadingSpinner = popupContainer.querySelector(".loading-spinner");
    if (loadingSpinner) loadingSpinner.style.display = "none";
  };

  // Initialize login popup
  common.initializeLoginPopup = function (showSignupPopup) {
    const popupContainer = document.querySelector(".login-popup-container");
    if (!popupContainer) {
      console.warn("Login popup container not found");
      return;
    }

    const closeBtn = popupContainer.querySelector(".login-popup-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", common.hideLoginPopup);
    }

    const popupOverlay = document.querySelector(".login-popup-overlay");
    if (popupOverlay) {
      popupOverlay.addEventListener("click", common.hideLoginPopup);
    }

    const signupBtn = popupContainer.querySelector("#signupBtn1");
    if (signupBtn) {
      signupBtn.addEventListener("click", () => {
        common.hideLoginPopup();
        showSignupPopup();
      });
    }

    const forgetBtn = popupContainer.querySelector("#forgetBtn");
    if (forgetBtn) {
      forgetBtn.addEventListener("click", () => {
        common.hideLoginPopup();
        common.showPasswordResetPopup("passwordScreen1");
      });
    }

    const loginButton = document.querySelector("#loginButton");
    if (loginButton) {
      loginButton.addEventListener("click", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const emailError = document.getElementById("emailError");
        const passwordError = document.getElementById("passwordError");
        const loadingSpinner = popupContainer.querySelector(".loading-spinner");

        common.clearError(emailError);
        common.clearError(passwordError);

        let isValid = true;

        if (!common.validateEmail(email)) {
          common.showError(emailError, "البريد الإلكتروني غير صحيح");
          isValid = false;
        }

        if (!common.validatePassword(password)) {
          common.showError(
            passwordError,
            "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
          );
          isValid = false;
        }

        if (isValid) {
          try {
            if (loadingSpinner) loadingSpinner.style.display = "block";
            loginButton.disabled = true;

            const response = await window.auth.login(email, password);
            if (!response.access_token) {
              throw new Error("استجابة الخادم غير صالحة: الرمز مفقود");
            }

            const authSection = document.querySelector(".auth-section");
            if (authSection) {
              authSection.innerHTML = `
                <a class="titel" href="#">
                  <img src="${common.sanitizeHTML(
                    response.user.image_url || "./default-avatar.png"
                  )}" alt="صورة المرشد" style="width: 60px; height: 60px; border-radius: 50%" />
                  <p class="mentor_name">${common.sanitizeHTML(
                    response.user.name || "مستخدم"
                  )}</p>
                  <img class="arrow-down" width="24px" height="24px" src="./images/arrow-down.svg" alt="Arrow Down" />
                </a>
                <div class="buttonsNav">
                  <button class="messageBtn" aria-label="الرسائل">
                    <img src="../mentor-images/messages-2.svg" alt="رسائل" />
                  </button>
                  <button class="notBtn" aria-label="الإشعارات">
                    <img src="../mentor-images/notification.svg" alt="إشعارات" />
                    <span class="notification-count">0</span>
                  </button>
                </div>
              `;

              common.initializeSidebar(response.user);
              const notBtn = authSection.querySelector(".notBtn");
              const messageBtn = authSection.querySelector(".messageBtn");
              if (notBtn) {
                notBtn.addEventListener("click", common.toggleNotifications);
              }
              if (messageBtn) {
                messageBtn.addEventListener("click", common.showChat);
              }
            }

            common.hideLoginPopup();
            await common.showAlert("تم تسجيل الدخول بنجاح", "", "success");

            if (response.user.isMentor) {
              console.log(
                "User is a mentor; consider redirecting to mentor dashboard"
              );
            }
          } catch (error) {
            console.error("Login failed:", error.message);
            let errorMessage = "حدث خطأ أثناء تسجيل الدخول";
            if (error.message.includes("Unauthorized")) {
              errorMessage = `البريد الإلكتروني أو كلمة المرور غير صحيحة. <a href='javascript:;' onclick='common.showPasswordResetPopup("passwordScreen1")'>نسيت كلمة المرور؟</a>`;
            } else if (error.message.includes("verify your phone number")) {
              errorMessage = "يرجى التحقق من رقم الهاتف";
            } else if (error.message.includes("Network error")) {
              errorMessage = "فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.";
              await common.showAlert("خطأ في الاتصال", errorMessage, "error");
            } else if (error.message.includes("Invalid user data")) {
              errorMessage = "تعذر تحميل بيانات المستخدم. حاول مرة أخرى.";
              await common.showAlert("خطأ في البيانات", errorMessage, "error");
            } else {
              await common.showAlert("خطأ", errorMessage, "error");
            }
            common.showError(passwordError, errorMessage);
            common.scrollToFirstError(document.getElementById("loginForm"));
          } finally {
            if (loadingSpinner) loadingSpinner.style.display = "none";
            loginButton.disabled = false;
          }
        } else {
          common.scrollToFirstError(document.getElementById("loginForm"));
        }
      });
    }
  };

  // Show mentor application popup
  common.showMentorApplicationPopup = function () {
    const popupContainer = document.querySelector(
      ".mentor-application-popup-container"
    );
    const popupOverlay = document.querySelector(
      ".mentor-application-popup-overlay"
    );
    if (!popupContainer || !popupOverlay) {
      console.warn("Mentor application popup elements not found");
      return;
    }

    popupContainer.classList.add("show");
    popupContainer.style.display = "flex";
    popupContainer.removeAttribute("aria-hidden");
    popupOverlay.classList.add("show");
    popupOverlay.style.display = "block";

    common.resetMentorApplicationPopup();
    common.setCurrentScreen("instructions");

    common.hideLoginPopup();
    common.hideSignupPopup();
    common.hidePasswordResetPopup();
  };

  // Hide mentor application popup
  common.hideMentorApplicationPopup = function () {
    const popupContainer = document.querySelector(
      ".mentor-application-popup-container"
    );
    const popupOverlay = document.querySelector(
      ".mentor-application-popup-overlay"
    );
    if (!popupContainer || !popupOverlay) return;

    popupContainer.classList.remove("show");
    popupContainer.style.display = "none";
    popupContainer.setAttribute("aria-hidden", "true");
    popupOverlay.classList.remove("show");
    popupOverlay.style.display = "none";

    common.resetMentorApplicationPopup();
  };

  // Reset mentor application popup
  common.resetMentorApplicationPopup = function () {
    const form = document.querySelector(".content_joinAs");
    if (form) {
      form.reset();
      const errorSpans = form.querySelectorAll(".error");
      errorSpans.forEach((span) => (span.textContent = ""));
      const inputs = form.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => input.blur());
    }
    common.setCurrentScreen("instructions");
  };

  // Set current screen for mentor application
  common.setCurrentScreen = function (screenId) {
    const screens = [
      "instructions",
      "joinAs",
      "pendingScreen",
      "successScreen",
      "fieldScreen",
    ];
    screens.forEach((id) => {
      const screen = document.getElementById(id);
      if (screen) {
        screen.style.display = id === screenId ? "block" : "none";
      }
    });
  };

  // Initialize mentor application popup
  common.initializeMentorApplicationPopup = function () {
    const popupContainer = document.querySelector(
      ".mentor-application-popup-container"
    );
    if (!popupContainer) {
      console.warn("Mentor application popup container not found");
      return;
    }

    const closeBtn = popupContainer.querySelector(
      ".mentor-application-popup-close"
    );
    if (closeBtn) {
      closeBtn.addEventListener("click", common.hideMentorApplicationPopup);
    }

    const popupOverlay = document.querySelector(
      ".mentor-application-popup-overlay"
    );
    if (popupOverlay) {
      popupOverlay.addEventListener("click", common.hideMentorApplicationPopup);
    }

    const joinAsMentorLink = document.getElementById("joinAsMentorLink");
    if (joinAsMentorLink) {
      joinAsMentorLink.addEventListener("click", (e) => {
        e.preventDefault();
        common.restrictAccess(() => {
          common.showMentorApplicationPopup();
        });
      });
    }

    popupContainer.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        common.hideMentorApplicationPopup();
      }
    });

    const instructions = document.getElementById("instructions");
    const joinAs = document.getElementById("joinAs");
    const pendingScreen = document.getElementById("pendingScreen");
    const successScreen = document.getElementById("successScreen");
    const fieldScreen = document.getElementById("fieldScreen");
    const joinBtn = document.getElementById("joinBtn");
    const submitBtn = document.getElementById("submitBtn");
    const joinBtn_Pendding = document.getElementById("joinBtn_Pendding");
    const joinBtn_Sucsess = document.getElementById("joinBtn_Sucsess");
    const joinBtn_Feild = document.getElementById("joinBtn_Feild");

    if (
      instructions &&
      joinAs &&
      pendingScreen &&
      successScreen &&
      fieldScreen &&
      joinBtn &&
      submitBtn &&
      joinBtn_Pendding &&
      joinBtn_Sucsess &&
      joinBtn_Feild
    ) {
      joinBtn.addEventListener("click", () => {
        common.setCurrentScreen("joinAs");
      });

      submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const specialization = document.getElementById("specialization").value;
        const targetAudience = document.getElementById("target_audience").value;
        const experience = document.getElementById("experience").value;
        const linkedinUrl = document.getElementById("linkedin_url").value;
        const aboutMe = document.getElementById("about_me").value;

        const specializationError = document.getElementById(
          "specializationError"
        );
        const targetAudienceError = document.getElementById(
          "targetAudienceError"
        );
        const experienceError = document.getElementById("experienceError");
        const linkedinError = document.getElementById("linkedinError");
        const aboutMeError = document.getElementById("aboutMeError");

        let isValid = true;

        common.clearError(specializationError);
        common.clearError(targetAudienceError);
        common.clearError(experienceError);
        common.clearError(linkedinError);
        common.clearError(aboutMeError);

        if (!specialization) {
          common.showError(specializationError, "يرجى اختيار التخصص");
          isValid = false;
        }
        if (!targetAudience) {
          common.showError(targetAudienceError, "يرجى اختيار الفئة المستهدفة");
          isValid = false;
        }
        if (!experience) {
          common.showError(experienceError, "يرجى اختيار عدد سنوات الخبرة");
          isValid = false;
        }
        if (!linkedinUrl || !common.isValidLinkedInUrl(linkedinUrl)) {
          common.showError(linkedinError, "يرجى إدخال رابط LinkedIn صالح");
          isValid = false;
        }
        if (!aboutMe || aboutMe.length < 20) {
          common.showError(
            aboutMeError,
            "يرجى إدخال نبذة عنك (20 حرفًا على الأقل)"
          );
          isValid = false;
        }

        if (isValid) {
          common.setCurrentScreen("pendingScreen");
          const response = await common.simulateMentorApplicationSubmission({
            specialization,
            targetAudience,
            experience,
            linkedinUrl,
            aboutMe,
          });
          if (response.success) {
            common.setCurrentScreen("successScreen");
          } else {
            common.setCurrentScreen("fieldScreen");
          }
        }
      });

      joinBtn_Pendding.addEventListener("click", () => {
        common.setCurrentScreen("successScreen");
      });

      joinBtn_Sucsess.addEventListener("click", () => {
        common.hideMentorApplicationPopup();
      });

      joinBtn_Feild.addEventListener("click", () => {
        common.setCurrentScreen("joinAs");
      });

      const inputs = joinAs.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        input.addEventListener("input", () => {
          common.validateField(input);
          common.checkInputDirection(input);
        });
      });
    }
  };

  // Validate mentor application fields
  common.validateField = function (input) {
    const id = input.id;
    const value = input.value.trim();
    const errorSpan = document.getElementById(`${id}Error`);

    if (errorSpan) {
      common.clearError(errorSpan);
      if (id === "specialization" && !value) {
        common.showError(errorSpan, "يرجى اختيار التخصص");
      } else if (id === "target_audience" && !value) {
        common.showError(errorSpan, "يرجى اختيار الفئة المستهدفة");
      } else if (id === "experience" && !value) {
        common.showError(errorSpan, "يرجى اختيار عدد سنوات الخبرة");
      } else if (
        id === "linkedin_url" &&
        (!value || !common.isValidLinkedInUrl(value))
      ) {
        common.showError(errorSpan, "يرجى إدخال رابط LinkedIn صالح");
      } else if (
        id === "about_me" &&
        (!value || value.length < 20 || value.length > 500)
      ) {
        common.showError(errorSpan, "يرجى إدخال نبذة عنك (20-500 حرفًا)");
      }
    }
  };

  // Validate LinkedIn URL
  common.isValidLinkedInUrl = function (url) {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname === "www.linkedin.com" &&
        urlObj.pathname.startsWith("/in/")
      );
    } catch {
      return false;
    }
  };

  // Simulate mentor application submission
  common.simulateMentorApplicationSubmission = async function (data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (
          data.experience === "zero-one" ||
          !common.isValidLinkedInUrl(data.linkedinUrl)
        ) {
          resolve({ success: false });
        } else {
          resolve({ success: true });
        }
      }, 1000);
    });
  };

  // Show password reset popup
  common.showPasswordResetPopup = function (screenId) {
    const popupContainers = document.querySelectorAll(
      ".password-reset-popup-container"
    );
    const popupOverlays = document.querySelectorAll(
      ".password-reset-popup-overlay"
    );
    if (!popupContainers.length || !popupOverlays.length) {
      console.warn("Password reset popup elements not found");
      return;
    }

    popupContainers.forEach((container) => {
      const screen = container.querySelector(`#${screenId}`);
      if (screen) {
        container.classList.add("show");
        container.style.display = "flex";
        container.removeAttribute("aria-hidden");
        container.querySelector(".main_contaner").style.display = "block";
      } else {
        container.classList.remove("show");
        container.style.display = "none";
        container.setAttribute("aria-hidden", "true");
      }
    });
    popupOverlays.forEach((overlay) => {
      overlay.style.display = popupContainers.some((c) =>
        c.classList.contains("show")
      )
        ? "block"
        : "none";
    });
    common.hideLoginPopup();
    common.hideSignupPopup();
    common.hideMentorApplicationPopup();
    document.getElementById("resetEmail")?.focus();
  };

  // Hide password reset popup
  common.hidePasswordResetPopup = function () {
    const popupContainers = document.querySelectorAll(
      ".password-reset-popup-container"
    );
    const popupOverlays = document.querySelectorAll(
      ".password-reset-popup-overlay"
    );
    popupContainers.forEach((container) => {
      container.classList.remove("show");
      container.style.display = "none";
      container.setAttribute("aria-hidden", "true");
      const form = container.querySelector("form");
      if (form) {
        form.reset();
        const errorSpans = form.querySelectorAll(".error");
        errorSpans.forEach((span) => common.clearError(span));
      }
    });
    popupOverlays.forEach((overlay) => {
      overlay.classList.remove("show");
      overlay.style.display = "none";
    });
  };

  // Initialize password reset popup
  common.initializePasswordResetPopup = function (showSignupPopup) {
    const popupContainers = document.querySelectorAll(
      ".password-reset-popup-container"
    );
    if (!popupContainers.length) {
      console.warn("Password reset popup containers not found");
      return;
    }

    popupContainers.forEach((popupContainer) => {
      const closeBtn = popupContainer.querySelector(
        ".password-reset-popup-close"
      );
      if (closeBtn) {
        closeBtn.addEventListener("click", common.hidePasswordResetPopup);
      }
    });

    const popupOverlays = document.querySelectorAll(
      ".password-reset-popup-overlay"
    );
    popupOverlays.forEach((overlay) => {
      overlay.addEventListener("click", common.hidePasswordResetPopup);
    });

    const repasswordBtn = document.querySelector("#repassword");
    if (repasswordBtn) {
      repasswordBtn.addEventListener("click", async () => {
        const email = document.getElementById("resetEmail").value.trim();
        const resetEmailError = document.getElementById("resetEmailError");
        common.clearError(resetEmailError);
        if (!email) {
          common.showError(resetEmailError, "يرجى إدخال البريد الإلكتروني");
          return;
        }
        if (!common.validateEmail(email)) {
          common.showError(resetEmailError, "البريد الإلكتروني غير صحيح");
          return;
        }
        try {
          const response = await window.auth.requestPasswordReset(email);
          if (response.success) {
            localStorage.setItem("resetEmail", email);
            common.showPasswordResetPopup("passwordScreen2");
          } else {
            throw new Error("Failed to send reset code");
          }
        } catch (error) {
          console.error("Password reset error:", error.message);
          common.showError(
            resetEmailError,
            error.message.includes("not found")
              ? "البريد الإلكتروني غير مسجل"
              : "حدث خطأ. حاول مرة أخرى."
          );
        }
      });
    }

    const arrowRightP1 = document.querySelector("#arrowRightP1");
    if (arrowRightP1) {
      arrowRightP1.addEventListener("click", () => {
        common.hidePasswordResetPopup();
        common.showLoginPopup();
      });
    }

    const signupBtnP1 = document.querySelector("#signupBtnP1");
    if (signupBtnP1) {
      signupBtnP1.addEventListener("click", () => {
        common.hidePasswordResetPopup();
        showSignupPopup();
      });
    }

    const donePassBtn = document.querySelector("#donePass");
    if (donePassBtn) {
      donePassBtn.addEventListener("click", async () => {
        const codeInputs = document.querySelectorAll(".resetCodePass1");
        const resetCodeError = document.getElementById("resetCodeError");
        common.clearError(resetCodeError);
        const code = Array.from(codeInputs)
          .map((input) => input.value.trim())
          .join("");
        if (code.length !== 4) {
          common.showError(
            resetCodeError,
            "يرجى إدخال رمز التحقق المكون من 4 أرقام"
          );
          return;
        }
        common.showPasswordResetPopup("passwordScreen3");
      });
    }

    const arrowRightP2 = document.querySelector("#arrowRightP2");
    if (arrowRightP2) {
      arrowRightP2.addEventListener("click", () => {
        common.showPasswordResetPopup("passwordScreen1");
      });
    }

    const resendCodeP2 = document.querySelector("#resendCodeP2");
    if (resendCodeP2) {
      resendCodeP2.addEventListener("click", async () => {
        const email = localStorage.getItem("resetEmail");
        if (email) {
          try {
            const response = await window.auth.requestPasswordReset(email);
            if (response.success) {
              await common.showAlert(
                "تم",
                "تم إعادة إرسال الكود إلى بريدك الإلكتروني",
                "success"
              );
            } else {
              throw new Error("Failed to resend code");
            }
          } catch (error) {
            console.error("Resend code error:", error.message);
            common.showError(
              document.getElementById("resetCodeError"),
              error.message.includes("not found")
                ? "البريد الإلكتروني غير مسجل"
                : "حدث خطأ. حاول مرة أخرى."
            );
          }
        }
      });
    }

    const changePasswordBtn = document.querySelector("#changePasswordBtn");
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener("click", async () => {
        const newPassword = document.getElementById("newPassword").value.trim();
        const confirmNewPassword = document
          .getElementById("confirmNewPassword")
          .value.trim();
        const newPasswordError = document.getElementById("newPasswordError");
        const confirmNewPasswordError = document.getElementById(
          "confirmNewPasswordError"
        );
        common.clearError(newPasswordError);
        common.clearError(confirmNewPasswordError);
        let isValid = true;
        if (!common.validatePassword(newPassword)) {
          common.showError(
            newPasswordError,
            "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
          );
          isValid = false;
        }
        if (newPassword !== confirmNewPassword) {
          common.showError(confirmNewPasswordError, "كلمة المرور غير متطابقة");
          isValid = false;
        }
        if (isValid) {
          const email = localStorage.getItem("resetEmail");
          const code = localStorage.getItem("resetCode");
          try {
            await window.auth.resetPassword(email, newPassword, code);
            await common.showAlert(
              "تم",
              "تم تغيير كلمة المرور بنجاح",
              "success"
            );
            common.hidePasswordResetPopup();
            common.showLoginPopup();
          } catch (error) {
            console.error("Change password error:", error.message);
            common.showError(
              newPasswordError,
              "فشل تغيير كلمة المرور. حاول مرة أخرى."
            );
          }
        } else {
          common.scrollToFirstError(document.getElementById("passwordForm3"));
        }
      });
    }

    const signupBtnP3 = document.querySelector("#signupBtnP3");
    if (signupBtnP3) {
      signupBtnP3.addEventListener("click", () => {
        common.hidePasswordResetPopup();
        showSignupPopup();
      });
    }
  };

  // Render notifications with flexibility
  common.renderNotifications = function (
    currentNotifications,
    updateNotificationCount
  ) {
    const notificationsContainer = document.querySelector(
      ".notifications-container"
    );
    if (!notificationsContainer) {
      console.warn("Notifications container not found");
      return;
    }
    notificationsContainer.innerHTML = "";

    currentNotifications.forEach((notification, index) => {
      const notificationEl = document.createElement("div");
      notificationEl.className = `notification ${
        notification.compact ? "compact" : ""
      } ${notification.variant || ""}`;
      notificationEl.innerHTML = `
        <div class="notification-left">
          <button class="close-button">×</button>
          ${
            notification.actions && notification.actions.length === 1
              ? `<button class="action-button">${
                  notification.actions[0].label || "عمل"
                }</button>`
              : ""
          }
        </div>
        <div class="notification-content">
          <h3 class="notification-title">${
            common.sanitizeHTML(notification.subject) || "إشعار"
          }</h3>
          ${
            notification.content
              ? `<p class="notification-text">${common.sanitizeHTML(
                  notification.content
                )}</p>`
              : ""
          }
          ${
            notification.actions && notification.actions.length > 1
              ? `<div class="notification-actions">
                  ${notification.actions
                    .map(
                      (action) =>
                        `<button class="action-button ${
                          action.primary ? "" : "secondary"
                        }">${
                          common.sanitizeHTML(action.label) || "عمل"
                        }</button>`
                    )
                    .join("")}
                </div>`
              : ""
          }
        </div>
        ${
          notification.avatar
            ? `<div class="notification-right">
                <div class="avatar">
                  <img src="${common.sanitizeHTML(
                    notification.avatar
                  )}" alt="Avatar" class="avatar-image" />
                </div>
              </div>`
            : ""
        }
      `;

      const closeBtn = notificationEl.querySelector(".close-button");
      closeBtn.addEventListener("click", () => {
        currentNotifications.splice(index, 1);
        common.renderNotifications(
          currentNotifications,
          updateNotificationCount
        );
        updateNotificationCount();
      });

      const actionButtons = notificationEl.querySelectorAll(".action-button");
      actionButtons.forEach((btn, btnIndex) => {
        btn.addEventListener("click", () => {
          console.log(
            `Action clicked: ${
              notification.actions[btnIndex]?.label || "Unknown"
            }`
          );
        });
      });

      notificationsContainer.appendChild(notificationEl);
    });

    const showMoreLink = document.createElement("a");
    showMoreLink.className = "show-more-link arabic";
    showMoreLink.textContent = "عرض المزيد";
    showMoreLink.href = "#";
    notificationsContainer.appendChild(showMoreLink);
  };

  // Update notification count
  common.updateNotificationCount = function (currentNotifications) {
    const notificationCountEl = document.querySelector(".notification-count");
    if (notificationCountEl) {
      notificationCountEl.textContent = currentNotifications.length;
      notificationCountEl.style.display =
        currentNotifications.length > 0 ? "block" : "none";
    }
  };

  // Toggle notifications
  common.toggleNotifications = function () {
    common.restrictAccess(() => {
      const notificationsContainer = document.querySelector(
        ".notifications-container"
      );
      if (!notificationsContainer) return;
      const isVisible = notificationsContainer.style.display === "block";
      notificationsContainer.style.display = isVisible ? "none" : "block";
    });
  };

  // Show chat interface
  common.showChat = function () {
    common.restrictAccess(() => {
      window.location.href = "/pages/chat.html";
    });
  };

  // Check input direction (RTL/LTR)
  common.checkInputDirection = function (input) {
    const arabicRegex = /[\u0600-\u06FF]/;
    const value = input.value;
    if (value) {
      input.style.direction = arabicRegex.test(value) ? "rtl" : "ltr";
    } else {
      input.style.direction = "ltr";
    }
  };
});
