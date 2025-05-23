window.common = window.common || {};

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

      const specializationError = document.getElementById("specializationError");
      const targetAudienceError = document.getElementById("targetAudienceError");
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