document.addEventListener("DOMContentLoaded", function () {
  window.common = window.common || {};

  // API base URL
  const API_BASE_URL = "https://tawgeeh-v1-production.up.railway.app";

  // Logger utility
  const logger = {
    info: (message, data = {}) => console.log(`[INFO] ${message}`, data),
    error: (message, data = {}) => console.error(`[ERROR] ${message}`, data),
    warn: (message, data = {}) => console.warn(`[WARN] ${message}`, data),
  };

  // Retrieve the authorization token
  // Replace this with your actual token retrieval logic, e.g.:
  // - From localStorage: const token = localStorage.getItem('authToken');
  // - From a global variable: const token = window.authToken;
  // - From a login response: Ensure token is set after login
  const token = localStorage.getItem("authToken") || ""; // Placeholder
  if (!token) {
    logger.warn("Authorization token not found. API calls may fail.");
  }

  // Show mentor application popup
  common.showMentorApplicationPopup = function () {
    const popupContainer = document.querySelector(
      ".mentor-application-popup-container"
    );
    const popupOverlay = document.querySelector(
      ".mentor-application-popup-overlay"
    );

    if (!popupContainer || !popupOverlay) {
      logger.warn("Mentor application popup elements not found", {
        popupContainer: !!popupContainer,
        popupOverlay: !!popupOverlay,
      });
      return;
    }

    popupContainer.classList.add("show");
    popupContainer.style.display = "flex";
    popupContainer.removeAttribute("aria-hidden");
    popupOverlay.classList.add("show");
    popupOverlay.style.display = "block";

    common.resetMentorApplicationPopup();
    common.setCurrentScreen("instructions");

    logger.info("Mentor application popup shown");

    common.hideLoginPopup?.();
    common.hideSignupPopup?.();
    common.hidePasswordResetPopup?.();
  };

  // Hide mentor application popup
  common.hideMentorApplicationPopup = function () {
    const popupContainer = document.querySelector(
      ".mentor-application-popup-container"
    );
    const popupOverlay = document.querySelector(
      ".mentor-application-popup-overlay"
    );

    if (!popupContainer || !popupOverlay) {
      logger.warn("Mentor application popup elements not found", {
        popupContainer: !!popupContainer,
        popupOverlay: !!popupOverlay,
      });
      return;
    }

    popupContainer.classList.remove("show");
    popupContainer.style.display = "none";
    popupContainer.setAttribute("aria-hidden", "true");
    popupOverlay.classList.remove("show");
    popupOverlay.style.display = "none";

    common.resetMentorApplicationPopup();
    logger.info("Mentor application popup hidden");
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
    logger.info("Mentor application popup reset");
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
    logger.info(`Current screen set to: ${screenId}`);
  };

  // Validate LinkedIn URL
  common.isValidLinkedInUrl = function (url) {
    try {
      // Prepend https:// if no protocol is specified
      let normalizedUrl = url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        normalizedUrl = `https://${url}`;
      }

      const urlObj = new URL(normalizedUrl);
      const isValid =
        urlObj.hostname === "www.linkedin.com" &&
        urlObj.pathname.startsWith("/in/");
      logger.info(`LinkedIn URL validation: ${isValid}`, {
        originalUrl: url,
        normalizedUrl,
      });
      return isValid;
    } catch (error) {
      logger.error("Invalid LinkedIn URL format", { originalUrl: url, error });
      return false;
    }
  };

  // Validation functions
  common.validateField = function (input) {
    const id = input.id;
    const value = input.value.trim();
    const errorSpan = document.getElementById(`${id}Error`);

    if (!errorSpan) return;

    common.clearError(errorSpan);

    const validations = {
      specialization: () => (!value ? "يرجى اختيار التخصص" : ""),
      target_audience: () => (!value ? "يرجى اختيار الفئة المستهدفة" : ""),
      experience: () => (!value ? "يرجى اختيار عدد سنوات الخبرة" : ""),
      linkedin_url: () =>
        !value || !common.isValidLinkedInUrl(value)
          ? "يرجى إدخال رابط LinkedIn صالح (مثال: https://www.linkedin.com/in/username)"
          : "",
      about_me: () =>
        !value || value.length < 20 || value.length > 500
          ? "يرجى إدخال نبذة عنك (20-500 حرفًا)"
          : "",
    };

    const errorMessage = validations[id]?.() || "";
    if (errorMessage) {
      common.showError(errorSpan, errorMessage);
      logger.warn(`Validation failed for ${id}`, { value, errorMessage });
    }

    return !errorMessage;
  };

  // API call to submit mentor application
  common.submitMentorApplication = async function (data) {
    try {
      const mappedData = {
        specialization: data.specialization,
        experienceLevel: data.experience,
        TargetMentees: data.targetAudience,
        linkedin: data.linkedinUrl,
        bio: data.aboutMe,
      };

      logger.info("Submitting mentor application", mappedData);

      const response = await fetch(`${API_BASE_URL}/mentor-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mappedData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Invalid or missing token");
        }
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            result.message || "Unknown error"
          }`
        );
      }

      if (!result.success) {
        throw new Error(`API error: ${result.message || "Submission failed"}`);
      }

      logger.info("Mentor application submitted successfully", result);
      return { success: true, data: result.data };
    } catch (error) {
      logger.error("Failed to submit mentor application", { error, data });
      return { success: false, error, message: error.message };
    }
  };

  // Clear error message
  common.clearError = function (errorSpan) {
    errorSpan.textContent = "";
  };

  // Show error message
  common.showError = function (errorSpan, message) {
    errorSpan.textContent = message;
  };

  // Scroll to first error
  common.scrollToFirstError = function (container) {
    const firstError = container.querySelector(".error:not(:empty)");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Check input direction
  common.checkInputDirection = function (input) {
    const value = input.value;
    const isRTL = /[\u0600-\u06FF]/.test(value);
    input.style.direction = isRTL ? "rtl" : "ltr";
  };

  // Initialize mentor application popup
  common.initializeMentorApplicationPopup = function () {
    const popupContainer = document.querySelector(
      ".mentor-application-popup-container"
    );
    if (!popupContainer) {
      logger.warn("Mentor application popup container not found");
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
        common.restrictAccess?.(() => {
          common.showMentorApplicationPopup();
        });
      });
    }

    popupContainer.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        common.hideMentorApplicationPopup();
      }
    });

    const elements = {
      instructions: document.getElementById("instructions"),
      joinAs: document.getElementById("joinAs"),
      pendingScreen: document.getElementById("pendingScreen"),
      successScreen: document.getElementById("successScreen"),
      fieldScreen: document.getElementById("fieldScreen"),
      joinBtn: document.getElementById("joinBtn"),
      submitBtn: document.getElementById("submitBtn"),
      joinBtn_Pendding: document.getElementById("joinBtn_Pendding"),
      joinBtn_Sucsess: document.getElementById("joinBtn_Sucsess"),
      joinBtn_Feild: document.getElementById("joinBtn_Feild"),
    };

    if (Object.values(elements).every((el) => el)) {
      elements.joinBtn.addEventListener("click", () => {
        common.setCurrentScreen("joinAs");
      });

      elements.submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const formData = {
          specialization: document.getElementById("specialization").value,
          targetAudience: document.getElementById("target_audience").value,
          experience: document.getElementById("experience").value,
          linkedinUrl: document.getElementById("linkedin_url").value,
          aboutMe: document.getElementById("about_me").value,
        };

        const errorElements = {
          specializationError: document.getElementById("specializationError"),
          targetAudienceError: document.getElementById("targetAudienceError"),
          experienceError: document.getElementById("experienceError"),
          linkedinError: document.getElementById("linkedinError"),
          aboutMeError: document.getElementById("aboutMeError"),
        };

        // Clear all errors
        Object.values(errorElements).forEach(common.clearError);

        // Validate all fields
        let isValid = true;
        const validations = [
          {
            field: "specialization",
            value: formData.specialization,
            errorElement: errorElements.specializationError,
            message: "يرجى اختيار التخصص",
          },
          {
            field: "targetAudience",
            value: formData.targetAudience,
            errorElement: errorElements.targetAudienceError,
            message: "يرجى اختيار الفئة المستهدفة",
          },
          {
            field: "experience",
            value: formData.experience,
            errorElement: errorElements.experienceError,
            message: "يرجى اختيار عدد سنوات الخبرة",
          },
          {
            field: "linkedinUrl",
            value: formData.linkedinUrl,
            errorElement: errorElements.linkedinError,
            message:
              "يرجى إدخال رابط LinkedIn صالح (مثال: https://www.linkedin.com/in/username)",
            validate: common.isValidLinkedInUrl,
          },
          {
            field: "aboutMe",
            value: formData.aboutMe,
            errorElement: errorElements.aboutMeError,
            message: "يرجى إدخال نبذة عنك (20-500 حرفًا)",
            validate: (val) => val.length >= 20 && val.length <= 500,
          },
        ];

        validations.forEach(
          ({ field, value, errorElement, message, validate }) => {
            const valid = validate ? validate(value) : !!value;
            if (!valid) {
              common.showError(errorElement, message);
              isValid = false;
              logger.warn(`Validation failed for ${field}`, { value });
            }
          }
        );

        if (isValid) {
          common.setCurrentScreen("pendingScreen");
          const response = await common.submitMentorApplication(formData);

          if (response.success) {
            common.setCurrentScreen("pendingScreen");
          } else {
            common.setCurrentScreen("fieldScreen");
            common.showError(
              errorElements.aboutMeError,
              response.message || "فشل إرسال الطلب، حاول مرة أخرى"
            );
          }
        } else {
          common.scrollToFirstError(elements.joinAs);
        }
      });

      elements.joinBtn_Pendding.addEventListener("click", () => {
        common.hideMentorApplicationPopup();
        logger.info("Pending screen closed");
      });

      elements.joinBtn_Sucsess.addEventListener("click", () => {
        common.hideMentorApplicationPopup();
      });

      elements.joinBtn_Feild.addEventListener("click", () => {
        common.setCurrentScreen("joinAs");
      });

      const inputs = elements.joinAs.querySelectorAll(
        "input, select, textarea"
      );
      inputs.forEach((input) => {
        input.addEventListener("input", () => {
          common.validateField(input);
          common.checkInputDirection(input);
        });
      });
    } else {
      logger.error("Required elements not found", {
        missing: Object.keys(elements).filter((k) => !elements[k]),
      });
    }

    logger.info("Mentor application popup initialized");
  };
});
