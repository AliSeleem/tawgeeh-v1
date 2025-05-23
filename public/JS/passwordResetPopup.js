window.common = window.common || {};

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