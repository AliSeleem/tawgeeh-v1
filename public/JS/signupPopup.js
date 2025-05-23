window.common = window.common || {};

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

// Validate signup form 1
common.validateForm1 = function (form) {
  const fullName = form.querySelector("#fullName").value.trim();
  const email = form.querySelector("#signupEmail").value.trim();
  const phone = form.querySelector("#phone").value.trim();
  const password = form.querySelector("#signupPassword").value.trim();
  const privacyCheckbox = form.querySelector("#privacyCheckbox1").checked;

  const fullNameError = form.querySelector("#fullNameError");
  const emailError = form.querySelector("#signupEmailError");
  const phoneError = form.querySelector("#phoneError");
  const passwordError = form.querySelector("#signupPasswordError");
  const privacyError = form.querySelector("#privacyError");

  common.clearError(fullNameError);
  common.clearError(emailError);
  common.clearError(phoneError);
  common.clearError(passwordError);
  common.clearError(privacyError);

  let isValid = true;

  if (!fullName || fullName.length < 2) {
    common.showError(
      fullNameError,
      "يرجى إدخال الاسم الكامل (حرفين على الأقل)"
    );
    isValid = false;
  }
  if (!common.validateEmail(email)) {
    common.showError(emailError, "البريد الإلكتروني غير صحيح");
    isValid = false;
  }
  if (!phone || !/^\+?\d{10,}$/.test(phone)) {
    common.showError(phoneError, "رقم الهاتف غير صحيح");
    isValid = false;
  }
  if (!common.validatePassword(password)) {
    common.showError(passwordError, "كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    isValid = false;
  }
  if (!privacyCheckbox) {
    common.showError(privacyError, "يرجى الموافقة على سياسة الخصوصية");
    isValid = false;
  }

  if (!isValid) {
    common.scrollToFirstError(form);
  }
  return isValid;
};

// Validate signup form 2
common.validateForm2 = function (form) {
  const specialization = form.querySelector("#specialization").value.trim();
  const country = form.querySelector("#country").value;
  const experience = form.querySelector("#experience").value;
  const gender = form.querySelector("#gender").value;
  const aboutMe = form.querySelector("#about_me").value.trim();

  const specializationError = form.querySelector("#specializationError");
  const countryError = form.querySelector("#countryError");
  const experienceError = form.querySelector("#experienceError");
  const genderError = form.querySelector("#genderError");
  const aboutMeError = form.querySelector("#aboutMeError");

  common.clearError(specializationError);
  common.clearError(countryError);
  common.clearError(experienceError);
  common.clearError(genderError);
  common.clearError(aboutMeError);

  let isValid = true;

  if (!specialization) {
    common.showError(specializationError, "يرجى اختيار التخصص");
    isValid = false;
  }
  if (!country) {
    common.showError(countryError, "يرجى اختيار الدولة");
    isValid = false;
  }
  if (!experience) {
    common.showError(experienceError, "يرجى اختيار سنوات الخبرة");
    isValid = false;
  }
  if (!gender) {
    common.showError(genderError, "يرجى اختيار الجنس");
    isValid = false;
  }
  if (!aboutMe || aboutMe.length < 20) {
    common.showError(aboutMeError, "يرجى إدخال نبذة عنك (20 حرفًا على الأقل)");
    isValid = false;
  }

  if (!isValid) {
    common.scrollToFirstError(form);
  }
  return isValid;
};

// Validate signup form 3
common.validateForm3 = function (form) {
  const codes = form.querySelectorAll(".code-input");
  const code = Array.from(codes)
    .map((input) => input.value.trim())
    .join("");
  const verificationCodeError = form.querySelector("#verificationCodeError");

  common.clearError(verificationCodeError);

  if (code.length !== 4) {
    common.showError(
      verificationCodeError,
      "يرجى إدخال رمز التحقق المكون من 4 أرقام"
    );
    return false;
  }
  return true;
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

  if (loginBtn2) {
    loginBtn2.addEventListener("click", async () => {
      const form = document.querySelector("#signupForm2");
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

        const loadingSpinner = popupContainer.querySelector(".loading-spinner");
        if (loadingSpinner) loadingSpinner.style.display = "block";
        loginBtn2.disabled = true;

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
          let errorField = "specializationError";

          if (error.fieldErrors) {
            const field = Object.keys(error.fieldErrors)[0];
            errorMessage = error.fieldErrors[field];
            errorField = `${field}Error`;

            if (["fullName", "email", "phone", "password"].includes(field)) {
              document.getElementById("signup2").style.display = "none";
              document.getElementById("signup1").style.display = "block";
              const con2 = popupContainer.querySelector(".con2");
              if (con2) con2.classList.remove("conChecked");
              form = document.querySelector("#signupForm1");
              errorField = `${field}Error`;
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
          common.showError(errorSpan, errorMessage);
          common.scrollToFirstError(form);
          localStorage.removeItem("userId");
          localStorage.removeItem("signupEmail");
          localStorage.removeItem("authToken");
        } finally {
          if (loadingSpinner) loadingSpinner.style.display = "none";
          loginBtn2.disabled = false;
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
        const loadingSpinner = popupContainer.querySelector(".loading-spinner");
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
