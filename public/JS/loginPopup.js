window.common = window.common || {};

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