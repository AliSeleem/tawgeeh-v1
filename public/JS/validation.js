// // Input Direction Handling
// function checkInputDirection(input) {
//   const text = input.value;
//   const isArabic =
//     /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
//       text
//     ) || /[0-9]/.test(text);

//   if (isArabic) {
//     input.style.direction = "rtl";
//     input.style.textAlign = "right";
//   } else {
//     input.style.direction = "ltr";
//     input.style.textAlign = "left";
//   }
// }

// // Validation Functions
// function validateEmail(email) {
//   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return re.test(String(email).toLowerCase());
// }

// function validatePassword(password) {
//   return password.length >= 8;
// }

// function validatePhone(phone) {
//   const re = /^[0-9]{10,15}$/;
//   return re.test(phone);
// }

// function validateNotEmpty(value) {
//   return value.trim() !== "";
// }

// function validateCode(code) {
//   return /^\d{4}$/.test(code);
// }

// function validatePasswordsMatch(password, confirmPassword) {
//   return password === confirmPassword;
// }

// // Error Handling
// function showError(element, message) {
//   if (element) {
//     element.textContent = message;
//     element.style.display = "block";
//     element.style.color = "#ff3333";
//     element.style.fontSize = "0.8rem";
//     element.style.marginTop = "5px";
//   }
// }

// function clearError(element) {
//   if (element) {
//     element.textContent = "";
//     element.style.display = "none";
//   }
// }

// // Form Validation Handlers
// document.addEventListener("DOMContentLoaded", function () {
//   // Login Form
//   if (document.getElementById("loginButton")) {
//     document
//       .getElementById("loginButton")
//       .addEventListener("click", async function (e) {
//         e.preventDefault();

//         const email = document.getElementById("email").value.trim();
//         const password = document.getElementById("password").value.trim();
//         const emailError = document.getElementById("emailError");
//         const passwordError = document.getElementById("passwordError");

//         clearError(emailError);
//         clearError(passwordError);

//         let isValid = true;

//         if (!validateEmail(email)) {
//           showError(emailError, "البريد الإلكتروني غير صحيح");
//           isValid = false;
//         }

//         if (!validatePassword(password)) {
//           showError(passwordError, "كلمة المرور يجب أن تكون 8 أحرف على الأقل");
//           isValid = false;
//         }

//         if (isValid) {
//           try {
//             await window.auth.login(email, password);
//             window.location.href = "dashboard.html";
//           } catch (error) {
//             showError(passwordError, error.message);
//           }
//         }
//       });
//   }

//   // Signup Step 1
//   if (document.getElementById("signupBtn")) {
//     document
//       .getElementById("signupBtn")
//       .addEventListener("click", function (e) {
//         e.preventDefault();

//         const fullName = document.getElementById("fullName").value.trim();
//         const email = document.getElementById("signupEmail").value.trim();
//         const phone = document.getElementById("phone").value.trim();
//         const password = document.getElementById("signupPassword").value.trim();
//         const confirmPassword = document
//           .getElementById("confirmPassword")
//           .value.trim();
//         const privacyCheckbox =
//           document.getElementById("privacyCheckbox1").checked;

//         const fullNameError = document.getElementById("fullNameError");
//         const emailError = document.getElementById("signupEmailError");
//         const phoneError = document.getElementById("phoneError");
//         const passwordError = document.getElementById("signupPasswordError");
//         const confirmPasswordError = document.getElementById(
//           "confirmPasswordError"
//         );
//         const privacyError = document.getElementById("privacyError");

//         clearError(fullNameError);
//         clearError(emailError);
//         clearError(phoneError);
//         clearError(passwordError);
//         clearError(confirmPasswordError);
//         clearError(privacyError);

//         let isValid = true;

//         if (!validateNotEmpty(fullName)) {
//           showError(fullNameError, "الرجاء إدخال الاسم الكامل");
//           isValid = false;
//         }

//         if (!validateEmail(email)) {
//           showError(emailError, "البريد الإلكتروني غير صحيح");
//           isValid = false;
//         }

//         if (!validatePhone(phone)) {
//           showError(phoneError, "رقم الهاتف غير صحيح (10-15 رقم)");
//           isValid = false;
//         }

//         if (!validatePassword(password)) {
//           showError(passwordError, "كلمة المرور يجب أن تكون 8 أحرف على الأقل");
//           isValid = false;
//         }

//         if (!validatePasswordsMatch(password, confirmPassword)) {
//           showError(confirmPasswordError, "كلمات المرور غير متطابقة");
//           isValid = false;
//         }

//         if (!privacyCheckbox) {
//           showError(privacyError, "يجب الموافقة على سياسة الخصوصية");
//           isValid = false;
//         }

//         if (isValid) {
//           localStorage.setItem(
//             "signupDataStep1",
//             JSON.stringify({
//               fullName,
//               email,
//               phone,
//               password,
//             })
//           );
//           window.location.href = "signup2.html";
//         }
//       });
//   }

//   // Signup Step 2
//   if (document.getElementById("loginbtn2")) {
//     document
//       .getElementById("loginbtn2")
//       .addEventListener("click", async function (e) {
//         e.preventDefault();

//         const specialization = document
//           .getElementById("specialization")
//           .value.trim();
//         const country = document.getElementById("country").value;
//         const experience = document.getElementById("experience").value;
//         const gender = document.getElementById("gender").value;
//         const aboutMe = document.getElementById("about_me").value.trim();
//         const privacyCheckbox =
//           document.getElementById("privacyCheckbox2").checked;

//         const specializationError = document.getElementById(
//           "specializationError"
//         );
//         const countryError = document.getElementById("countryError");
//         const experienceError = document.getElementById("experienceError");
//         const genderError = document.getElementById("genderError");
//         const aboutMeError = document.getElementById("aboutMeError");
//         const privacyError = document.getElementById("privacyError2");

//         clearError(specializationError);
//         clearError(countryError);
//         clearError(experienceError);
//         clearError(genderError);
//         clearError(aboutMeError);
//         clearError(privacyError);

//         let isValid = true;

//         if (!validateNotEmpty(specialization)) {
//           showError(specializationError, "الرجاء إدخال التخصص");
//           isValid = false;
//         }

//         if (!country) {
//           showError(countryError, "الرجاء اختيار البلد");
//           isValid = false;
//         }

//         if (!experience) {
//           showError(experienceError, "الرجاء اختيار سنوات الخبرة");
//           isValid = false;
//         }

//         if (!gender) {
//           showError(genderError, "الرجاء اختيار الجنس");
//           isValid = false;
//         }

//         if (!validateNotEmpty(aboutMe)) {
//           showError(aboutMeError, "الرجاء إدخال نبذة عنك");
//           isValid = false;
//         }

//         if (!privacyCheckbox) {
//           showError(privacyError, "يجب الموافقة على سياسة الخصوصية");
//           isValid = false;
//         }

//         if (isValid) {
//           const step1Data = JSON.parse(localStorage.getItem("signupDataStep1"));
//           const userData = {
//             fullName: step1Data.fullName,
//             email: step1Data.email,
//             phone: step1Data.phone,
//             password: step1Data.password,
//             specialization: document
//               .getElementById("specialization")
//               .value.trim(),
//             country: document.getElementById("country").value,
//             experience: document.getElementById("experience").value,
//             gender: document.getElementById("gender").value,
//             aboutMe: document.getElementById("about_me").value.trim(),
//           };

//           try {
//             const response = await window.auth.register(userData);
//             localStorage.setItem(
//               "tempUserId",
//               response.userId || response.tempId
//             );
//             localStorage.removeItem("signupDataStep1");
//             window.location.href = "signup3.html";
//           } catch (error) {
//             // Show specific validation errors if available
//             if (error.message.includes("Validation failed")) {
//               const errors = JSON.parse(
//                 error.message.replace("طلب غير صحيح: Validation failed: ", "")
//               );
//               Object.keys(errors).forEach((field) => {
//                 const errorElement = document.getElementById(`${field}Error`);
//                 if (errorElement) {
//                   showError(errorElement, errors[field]);
//                 }
//               });
//             } else {
//               alert(error.message);
//             }
//           }
//         }
//       });
//   }

//   // Signup Step 3 (Phone Verification)
//   if (document.getElementById("loginbtn3")) {
//     document
//       .getElementById("loginbtn3")
//       .addEventListener("click", async function (e) {
//         e.preventDefault();

//         const codeInputs = document.querySelectorAll(".resetCode");
//         const code = Array.from(codeInputs)
//           .map((input) => input.value)
//           .join("");

//         if (!validateCode(code)) {
//           alert("الرجاء إدخال الكود المكون من 4 أرقام");
//           return;
//         }

//         const userId = localStorage.getItem("tempUserId");

//         try {
//           const response = await window.auth.verifyPhone(userId, code);
//           localStorage.removeItem("tempUserId");
//           localStorage.setItem("authToken", response.token);
//           window.location.href = "dashboard.html";
//         } catch (error) {
//           alert(error.message);
//         }
//       });
//   }

//   // Password Reset
//   if (document.getElementById("repassword")) {
//     document
//       .getElementById("repassword")
//       .addEventListener("click", async function (e) {
//         e.preventDefault();

//         const email = document.getElementById("resetEmail").value.trim();
//         const resetEmailError = document.getElementById("resetEmailError");

//         clearError(resetEmailError);

//         if (!validateEmail(email)) {
//           showError(resetEmailError, "البريد الإلكتروني غير صحيح");
//           return;
//         }

//         try {
//           await window.auth.requestPasswordReset(email);
//           localStorage.setItem("resetEmail", email);
//           window.location.href = "passwordScreen2.html";
//         } catch (error) {
//           showError(resetEmailError, error.message);
//         }
//       });
//   }

//   // Complete Password Reset
//   if (document.getElementById("changePasswordBtn")) {
//     document
//       .getElementById("changePasswordBtn")
//       .addEventListener("click", async function (e) {
//         e.preventDefault();

//         const newPassword = document.getElementById("newPassword").value.trim();
//         const confirmPassword = document
//           .getElementById("confirmNewPassword")
//           .value.trim();
//         const newPasswordError = document.getElementById("newPasswordError");
//         const confirmPasswordError = document.getElementById(
//           "confirmNewPasswordError"
//         );

//         clearError(newPasswordError);
//         clearError(confirmPasswordError);

//         let isValid = true;

//         if (!validatePassword(newPassword)) {
//           showError(
//             newPasswordError,
//             "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
//           );
//           isValid = false;
//         }

//         if (!validatePasswordsMatch(newPassword, confirmPassword)) {
//           showError(confirmPasswordError, "كلمات المرور غير متطابقة");
//           isValid = false;
//         }

//         if (isValid) {
//           const email = localStorage.getItem("resetEmail");
//           const codeInputs = document.querySelectorAll(".resetCodePass1");
//           const code = Array.from(codeInputs)
//             .map((input) => input.value)
//             .join("");

//           try {
//             await window.auth.resetPassword(email, newPassword, code);
//             localStorage.removeItem("resetEmail");
//             alert("تم تغيير كلمة المرور بنجاح");
//             window.location.href = "index.html";
//           } catch (error) {
//             alert(error.message);
//           }
//         }
//       });
//   }

//   // Navigation Handlers
//   if (document.getElementById("arrowRightS1")) {
//     document
//       .getElementById("arrowRightS1")
//       .addEventListener("click", function () {
//         window.location.href = "signup1.html";
//       });
//   }

//   if (document.getElementById("arrowRightS2")) {
//     document
//       .getElementById("arrowRightS2")
//       .addEventListener("click", function () {
//         window.location.href = "signup2.html";
//       });
//   }

//   if (document.getElementById("registerBtn")) {
//     document
//       .getElementById("registerBtn")
//       .addEventListener("click", function () {
//         window.location.href = "index.html";
//       });
//   }

//   if (document.getElementById("forgetBtn")) {
//     document.getElementById("forgetBtn").addEventListener("click", function () {
//       window.location.href = "passwordScreen1.html";
//     });
//   }

//   if (document.getElementById("signupBtn1")) {
//     document
//       .getElementById("signupBtn1")
//       .addEventListener("click", function () {
//         window.location.href = "signup1.html";
//       });
//   }
// });
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Input Direction Handling
// function checkInputDirection(input) {
//   const text = input.value;
//   const isArabic =
//     /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
//       text
//     ) || /[0-9]/.test(text);

//   input.style.direction = isArabic ? "rtl" : "ltr";
//   input.style.textAlign = isArabic ? "right" : "left";
// }

// // Validation Functions
// function validateEmail(email) {
//   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return re.test(String(email).toLowerCase());
// }

// function validatePassword(password) {
//   return password.length >= 8;
// }

// function validatePhone(phone) {
//   const re = /^[0-9]{10,15}$/;
//   return re.test(phone);
// }

// function validateNotEmpty(value) {
//   return value.trim() !== "";
// }

// function validateCode(code) {
//   return /^\d{4}$/.test(code);
// }

// function validatePasswordsMatch(password, confirmPassword) {
//   return password === confirmPassword;
// }

// function validateAboutMe(text) {
//   return text.length >= 20;
// }

// // Error Handling
// function showError(element, message) {
//   if (element) {
//     element.textContent = message;
//     element.style.display = "block";
//     element.style.color = "#ff3333";
//     element.style.fontSize = "0.8rem";
//     element.style.marginTop = "5px";
//     element.style.textAlign = "right"; // Ensure right alignment for Arabic
//   }
// }

// function clearError(element) {
//   if (element) {
//     element.textContent = "";
//     element.style.display = "none";
//   }
// }

// // Scroll to first error
// function scrollToFirstError(form) {
//   const firstError = form.querySelector(".error:not(:empty)");
//   if (firstError) {
//     const input = firstError
//       .closest(".form_group")
//       .querySelector("input, select, textarea");
//     input.scrollIntoView({ behavior: "smooth", block: "center" });
//   }
// }

// // Form Validation Handlers
// document.addEventListener("DOMContentLoaded", function () {
//   // Login Form (unchanged)
//   if (document.getElementById("loginButton")) {
//     document
//       .getElementById("loginButton")
//       .addEventListener("click", async function (e) {
//         e.preventDefault();

//         const email = document.getElementById("email").value.trim();
//         const password = document.getElementById("password").value.trim();
//         const emailError = document.getElementById("emailError");
//         const passwordError = document.getElementById("passwordError");

//         clearError(emailError);
//         clearError(passwordError);

//         let isValid = true;

//         if (!validateEmail(email)) {
//           showError(emailError, "البريد الإلكتروني غير صحيح");
//           isValid = false;
//         }

//         if (!validatePassword(password)) {
//           showError(passwordError, "كلمة المرور يجب أن تكون 8 أحرف على الأقل");
//           isValid = false;
//         }

//         if (isValid) {
//           try {
//             await window.auth.login(email, password);
//             window.location.href = "explore2.html";
//           } catch (error) {
//             showError(passwordError, error.message);
//           }
//         } else {
//           scrollToFirstError(document.getElementById("loginForm"));
//         }
//       });
//   }

//   // Signup Step 1
//   if (document.getElementById("signupBtn")) {
//     document
//       .getElementById("signupBtn")
//       .addEventListener("click", function (e) {
//         e.preventDefault();

//         const form = document.getElementById("signupForm1");
//         const fullName = document.getElementById("fullName").value.trim();
//         const email = document.getElementById("signupEmail").value.trim();
//         const phone = document.getElementById("phone").value.trim();
//         const password = document.getElementById("signupPassword").value.trim();
//         const confirmPassword = document
//           .getElementById("confirmPassword")
//           .value.trim();
//         const privacyCheckbox =
//           document.getElementById("privacyCheckbox1").checked;

//         const fullNameError = document.getElementById("fullNameError");
//         const emailError = document.getElementById("signupEmailError");
//         const phoneError = document.getElementById("phoneError");
//         const passwordError = document.getElementById("signupPasswordError");
//         const confirmPasswordError = document.getElementById(
//           "confirmPasswordError"
//         );
//         const privacyError = document.getElementById("privacyError");

//         clearError(fullNameError);
//         clearError(emailError);
//         clearError(phoneError);
//         clearError(passwordError);
//         clearError(confirmPasswordError);
//         clearError(privacyError);

//         let isValid = true;

//         if (!validateNotEmpty(fullName)) {
//           showError(fullNameError, "الرجاء إدخال الاسم الكامل");
//           isValid = false;
//         }

//         if (!validateEmail(email)) {
//           showError(emailError, "البريد الإلكتروني غير صحيح");
//           isValid = false;
//         }

//         if (!validatePhone(phone)) {
//           showError(phoneError, "رقم الهاتف غير صحيح (10-15 رقم)");
//           isValid = false;
//         }

//         if (!validatePassword(password)) {
//           showError(passwordError, "كلمة المرور يجب أن تكون 8 أحرف على الأقل");
//           isValid = false;
//         }

//         if (!validatePasswordsMatch(password, confirmPassword)) {
//           showError(confirmPasswordError, "كلمات المرور غير متطابقة");
//           isValid = false;
//         }

//         if (!privacyCheckbox) {
//           showError(privacyError, "يجب الموافقة على سياسة الخصوصية");
//           isValid = false;
//         }

//         if (isValid) {
//           localStorage.setItem(
//             "signupDataStep1",
//             JSON.stringify({
//               fullName,
//               email,
//               phone,
//               password,
//             })
//           );
//           window.location.href = "signup2.html";
//         } else {
//           scrollToFirstError(form);
//         }
//       });
//   }

//   // Signup Step 2
//   if (document.getElementById("loginbtn2")) {
//     document
//       .getElementById("loginbtn2")
//       .addEventListener("click", async function (e) {
//         e.preventDefault();

//         const form = document.getElementById("signupForm2");
//         const specialization = document
//           .getElementById("specialization")
//           .value.trim();
//         const country = document.getElementById("country").value;
//         const experience = document.getElementById("experience").value;
//         const gender = document.getElementById("gender").value;
//         const aboutMe = document.getElementById("about_me").value.trim();
//         const privacyCheckbox =
//           document.getElementById("privacyCheckbox2").checked;

//         const specializationError = document.getElementById(
//           "specializationError"
//         );
//         const countryError = document.getElementById("countryError");
//         const experienceError = document.getElementById("experienceError");
//         const genderError = document.getElementById("genderError");
//         const aboutMeError = document.getElementById("aboutMeError");
//         const privacyError = document.getElementById("privacyError2");

//         clearError(specializationError);
//         clearError(countryError);
//         clearError(experienceError);
//         clearError(genderError);
//         clearError(aboutMeError);
//         clearError(privacyError);

//         let isValid = true;

//         if (!validateNotEmpty(specialization)) {
//           showError(specializationError, "الرجاء إدخال التخصص");
//           isValid = false;
//         }

//         if (!country) {
//           showError(countryError, "الرجاء اختيار البلد");
//           isValid = false;
//         }

//         if (!experience) {
//           showError(experienceError, "الرجاء اختيار سنوات الخبرة");
//           isValid = false;
//         }

//         if (!gender) {
//           showError(genderError, "الرجاء اختيار الجنس");
//           isValid = false;
//         }

//         if (!validateNotEmpty(aboutMe)) {
//           showError(aboutMeError, "الرجاء إدخال نبذة عنك");
//           isValid = false;
//         } else if (!validateAboutMe(aboutMe)) {
//           showError(aboutMeError, "النبذة يجب أن تحتوي على 20 حرفًا على الأقل");
//           isValid = false;
//         }

//         if (!privacyCheckbox) {
//           showError(privacyError, "يجب الموافقة على سياسة الخصوصية");
//           isValid = false;
//         }

//         if (isValid) {
//           const step1Data = JSON.parse(localStorage.getItem("signupDataStep1"));
//           if (!step1Data) {
//             alert(
//               "بيانات الخطوة الأولى غير موجودة، يرجى العودة إلى الخطوة الأولى"
//             );
//             window.location.href = "signup1.html";
//             return;
//           }

//           const userData = {
//             fullName: step1Data.fullName,
//             email: step1Data.email,
//             phone: step1Data.phone,
//             password: step1Data.password,
//             specialization,
//             country,
//             experience,
//             gender,
//             aboutMe,
//           };

//           try {
//             const response = await window.auth.register(userData);
//             localStorage.setItem(
//               "tempUserId",
//               response.userId || response.tempId
//             );
//             localStorage.removeItem("signupDataStep1");
//             window.location.href = "signup3.html";
//           } catch (error) {
//             if (error.message.includes("Validation failed")) {
//               const errors = JSON.parse(
//                 error.message.replace("طلب غير صحيح: Validation failed: ", "")
//               );
//               Object.keys(errors).forEach((field) => {
//                 const errorElement = document.getElementById(`${field}Error`);
//                 if (errorElement) {
//                   showError(errorElement, errors[field]);
//                 }
//               });
//               scrollToFirstError(form);
//             } else {
//               alert(error.message);
//             }
//           }
//         } else {
//           scrollToFirstError(form);
//         }
//       });
//   }

//   // Signup Step 3 (Phone Verification)
//   if (document.getElementById("loginbtn3")) {
//     document
//       .getElementById("loginbtn3")
//       .addEventListener("click", async function (e) {
//         e.preventDefault();

//         const codeInputs = document.querySelectorAll(".resetCode");
//         const code = Array.from(codeInputs)
//           .map((input) => input.value)
//           .join("");

//         if (!validateCode(code)) {
//           alert("الرجاء إدخال الكود المكون من 4 أرقام");
//           return;
//         }

//         const userId = localStorage.getItem("tempUserId");

//         try {
//           const response = await window.auth.verifyPhone(userId, code);
//           localStorage.removeItem("tempUserId");
//           localStorage.setItem("authToken", response.token);
//           window.location.href = "dashboard.html";
//         } catch (error) {
//           alert(error.message);
//         }
//       });
//   }

//   // Password Reset
//   if (document.getElementById("repassword")) {
//     document
//       .getElementById("repassword")
//       .addEventListener("click", async function (e) {
//         e.preventDefault();

//         const email = document.getElementById("resetEmail").value.trim();
//         const resetEmailError = document.getElementById("resetEmailError");

//         clearError(resetEmailError);

//         if (!validateEmail(email)) {
//           showError(resetEmailError, "البريد الإلكتروني غير صحيح");
//           return;
//         }

//         try {
//           await window.auth.requestPasswordReset(email);
//           localStorage.setItem("resetEmail", email);
//           window.location.href = "passwordScreen2.html";
//         } catch (error) {
//           showError(resetEmailError, error.message);
//         }
//       });
//   }

//   // Complete Password Reset
//   if (document.getElementById("changePasswordBtn")) {
//     document
//       .getElementById("changePasswordBtn")
//       .addEventListener("click", async function (e) {
//         e.preventDefault();

//         const newPassword = document.getElementById("newPassword").value.trim();
//         const confirmPassword = document
//           .getElementById("confirmNewPassword")
//           .value.trim();
//         const newPasswordError = document.getElementById("newPasswordError");
//         const confirmPasswordError = document.getElementById(
//           "confirmNewPasswordError"
//         );

//         clearError(newPasswordError);
//         clearError(confirmPasswordError);

//         let isValid = true;

//         if (!validatePassword(newPassword)) {
//           showError(
//             newPasswordError,
//             "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
//           );
//           isValid = false;
//         }

//         if (!validatePasswordsMatch(newPassword, confirmPassword)) {
//           showError(confirmPasswordError, "كلمات المرور غير متطابقة");
//           isValid = false;
//         }

//         if (isValid) {
//           const email = localStorage.getItem("resetEmail");
//           const codeInputs = document.querySelectorAll(".resetCodePass1");
//           const code = Array.from(codeInputs)
//             .map((input) => input.value)
//             .join("");

//           try {
//             await window.auth.resetPassword(email, newPassword, code);
//             localStorage.removeItem("resetEmail");
//             alert("تم تغيير كلمة المرور بنجاح");
//             window.location.href = "index.html";
//           } catch (error) {
//             alert(error.message);
//           }
//         } else {
//           scrollToFirstError(document.getElementById("resetPasswordForm"));
//         }
//       });
//   }

//   // Navigation Handlers
//   if (document.getElementById("arrowRightS1")) {
//     document
//       .getElementById("arrowRightS1")
//       .addEventListener("click", function () {
//         window.location.href = "signup1.html";
//       });
//   }

//   if (document.getElementById("arrowRightS2")) {
//     document
//       .getElementById("arrowRightS2")
//       .addEventListener("click", function () {
//         window.location.href = "signup2.html";
//       });
//   }

//   if (document.getElementById("registerBtn")) {
//     document
//       .getElementById("registerBtn")
//       .addEventListener("click", function () {
//         window.location.href = "index.html";
//       });
//   }

//   if (document.getElementById("forgetBtn")) {
//     document.getElementById("forgetBtn").addEventListener("click", function () {
//       window.location.href = "passwordScreen1.html";
//     });
//   }

//   if (document.getElementById("signupBtn1")) {
//     document
//       .getElementById("signupBtn1")
//       .addEventListener("click", function () {
//         window.location.href = "signup1.html";
//       });
//   }
// });
//////////////////////////////////////////////////////////////////////////////////////////////////////
// Input Direction Handling
function checkInputDirection(input) {
  const text = input.value;
  const isArabic =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
      text
    ) || /[0-9]/.test(text);

  input.style.direction = isArabic ? "rtl" : "ltr";
  input.style.textAlign = isArabic ? "right" : "left";
}

// Validation Functions
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
  return password.length >= 8;
}

function validatePhone(phone) {
  const re = /^[0-9]{10,15}$/;
  return re.test(phone);
}

function validateNotEmpty(value) {
  return value.trim() !== "";
}

function validateCode(code) {
  return /^\d{4}$/.test(code);
}

function validatePasswordsMatch(password, confirmPassword) {
  return password === confirmPassword;
}

function validateAboutMe(text) {
  return text.length >= 20;
}

// Error Handling
function showError(element, message) {
  if (element) {
    element.innerHTML = message; // Use innerHTML to support HTML content (e.g., links)
    element.style.display = "block";
    element.style.color = "#ff3333";
    element.style.fontSize = "0.8rem";
    element.style.marginTop = "5px";
    element.style.textAlign = "right"; // Ensure right alignment for Arabic
  }
}

function clearError(element) {
  if (element) {
    element.textContent = "";
    element.style.display = "none";
  }
}

// Scroll to first error
function scrollToFirstError(form) {
  const firstError = form.querySelector(".error:not(:empty)");
  if (firstError) {
    const input = firstError
      .closest(".form_group")
      .querySelector("input, select, textarea");
    input.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Form Validation Handlers
document.addEventListener("DOMContentLoaded", function () {
  // Login Form
  if (document.getElementById("loginButton")) {
    document
      .getElementById("loginButton")
      .addEventListener("click", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const emailError = document.getElementById("emailError");
        const passwordError = document.getElementById("passwordError");

        clearError(emailError);
        clearError(passwordError);

        let isValid = true;

        if (!validateEmail(email)) {
          showError(emailError, "البريد الإلكتروني غير صحيح");
          isValid = false;
        }

        if (!validatePassword(password)) {
          showError(passwordError, "كلمة المرور يجب أن تكون 8 أحرف على الأقل");
          isValid = false;
        }

        if (isValid) {
          console.log("Attempting login with:", { email, password });
          try {
            await window.auth.login(email, password);
            window.location.href = "explore.html";
          } catch (error) {
            console.error("Login failed:", error.message);
            if (error.message.includes("Invalid credentials")) {
              showError(
                passwordError,
                "البريد الإلكتروني أو كلمة المرور غير صحيحة. <a href='passwordScreen1.html'>نسيت كلمة المرور؟</a>"
              );
            } else if (error.message.includes("يرجى التحقق من رقم الهاتف")) {
              showError(passwordError, error.message);
            } else {
              showError(passwordError, "حدث خطأ: " + error.message);
            }
          }
        } else {
          scrollToFirstError(document.getElementById("loginForm"));
        }
      });
  }

  // Signup Step 1
  if (document.getElementById("signupBtn")) {
    document
      .getElementById("signupBtn")
      .addEventListener("click", function (e) {
        e.preventDefault();

        const form = document.getElementById("signupForm1");
        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("signupPassword").value.trim();
        const confirmPassword = document
          .getElementById("confirmPassword")
          .value.trim();
        const privacyCheckbox =
          document.getElementById("privacyCheckbox1").checked;

        const fullNameError = document.getElementById("fullNameError");
        const emailError = document.getElementById("signupEmailError");
        const phoneError = document.getElementById("phoneError");
        const passwordError = document.getElementById("signupPasswordError");
        const confirmPasswordError = document.getElementById(
          "confirmPasswordError"
        );
        const privacyError = document.getElementById("privacyError");

        clearError(fullNameError);
        clearError(emailError);
        clearError(phoneError);
        clearError(passwordError);
        clearError(confirmPasswordError);
        clearError(privacyError);

        let isValid = true;

        if (!validateNotEmpty(fullName)) {
          showError(fullNameError, "الرجاء إدخال الاسم الكامل");
          isValid = false;
        }

        if (!validateEmail(email)) {
          showError(emailError, "البريد الإلكتروني غير صحيح");
          isValid = false;
        }

        if (!validatePhone(phone)) {
          showError(phoneError, "رقم الهاتف غير صحيح (10-15 رقم)");
          isValid = false;
        }

        if (!validatePassword(password)) {
          showError(passwordError, "كلمة المرور يجب أن تكون 8 أحرف على الأقل");
          isValid = false;
        }

        if (!validatePasswordsMatch(password, confirmPassword)) {
          showError(confirmPasswordError, "كلمات المرور غير متطابقة");
          isValid = false;
        }

        if (!privacyCheckbox) {
          showError(privacyError, "يجب الموافقة على سياسة الخصوصية");
          isValid = false;
        }

        if (isValid) {
          localStorage.setItem(
            "signupDataStep1",
            JSON.stringify({
              fullName,
              email,
              phone,
              password,
            })
          );
          window.location.href = "signup2.html";
        } else {
          scrollToFirstError(form);
        }
      });
  }

  // Signup Step 2
  if (document.getElementById("loginbtn2")) {
    document
      .getElementById("loginbtn2")
      .addEventListener("click", async function (e) {
        e.preventDefault();

        const form = document.getElementById("signupForm2");
        const specialization = document
          .getElementById("specialization")
          .value.trim();
        const country = document.getElementById("country").value;
        const experience = document.getElementById("experience").value;
        const gender = document.getElementById("gender").value;
        const aboutMe = document.getElementById("about_me").value.trim();
        const privacyCheckbox =
          document.getElementById("privacyCheckbox2").checked;

        const specializationError = document.getElementById(
          "specializationError"
        );
        const countryError = document.getElementById("countryError");
        const experienceError = document.getElementById("experienceError");
        const genderError = document.getElementById("genderError");
        const aboutMeError = document.getElementById("aboutMeError");
        const privacyError = document.getElementById("privacyError2");

        clearError(specializationError);
        clearError(countryError);
        clearError(experienceError);
        clearError(genderError);
        clearError(aboutMeError);
        clearError(privacyError);

        let isValid = true;

        if (!validateNotEmpty(specialization)) {
          showError(specializationError, "الرجاء إدخال التخصص");
          isValid = false;
        }

        if (!country) {
          showError(countryError, "الرجاء اختيار البلد");
          isValid = false;
        }

        if (!experience) {
          showError(experienceError, "الرجاء اختيار سنوات الخبرة");
          isValid = false;
        }

        if (!gender) {
          showError(genderError, "الرجاء اختيار الجنس");
          isValid = false;
        }

        if (!validateNotEmpty(aboutMe)) {
          showError(aboutMeError, "الرجاء إدخال نبذة عنك");
          isValid = false;
        } else if (!validateAboutMe(aboutMe)) {
          showError(aboutMeError, "النبذة يجب أن تحتوي على 20 حرفًا على الأقل");
          isValid = false;
        }

        if (!privacyCheckbox) {
          showError(privacyError, "يجب الموافقة على سياسة الخصوصية");
          isValid = false;
        }

        if (isValid) {
          const step1Data = JSON.parse(localStorage.getItem("signupDataStep1"));
          if (!step1Data) {
            alert(
              "بيانات الخطوة الأولى غير موجودة، يرجى العودة إلى الخطوة الأولى"
            );
            window.location.href = "signup1.html";
            return;
          }

          const userData = {
            fullName: step1Data.fullName,
            email: step1Data.email,
            phone: step1Data.phone,
            password: step1Data.password,
            specialization,
            country,
            experience,
            gender,
            aboutMe,
          };

          try {
            const response = await window.auth.register(userData);
            localStorage.setItem(
              "tempUserId",
              response.userId || response.tempId
            );
            localStorage.removeItem("signupDataStep1");
            window.location.href = "signup3.html";
          } catch (error) {
            if (error.message.includes("Validation failed")) {
              const errors = JSON.parse(
                error.message.replace("طلب غير صحيح: Validation failed: ", "")
              );
              Object.keys(errors).forEach((field) => {
                const errorElement = document.getElementById(`${field}Error`);
                if (errorElement) {
                  showError(errorElement, errors[field]);
                }
              });
              scrollToFirstError(form);
            } else {
              alert(error.message);
            }
          }
        } else {
          scrollToFirstError(form);
        }
      });
  }

  // Signup Step 3 (Phone Verification)
  if (document.getElementById("loginbtn3")) {
    document
      .getElementById("loginbtn3")
      .addEventListener("click", async function (e) {
        e.preventDefault();

        const codeInputs = document.querySelectorAll(".resetCode");
        const code = Array.from(codeInputs)
          .map((input) => input.value)
          .join("");

        if (!validateCode(code)) {
          alert("الرجاء إدخال الكود المكون من 4 أرقام");
          return;
        }

        const userId = localStorage.getItem("tempUserId");

        try {
          const response = await window.auth.verifyPhone(userId, code);
          localStorage.removeItem("tempUserId");
          localStorage.setItem("authToken", response.token);
          window.location.href = "explore.html";
        } catch (error) {
          alert(error.message);
        }
      });
  }

  // Password Reset
  if (document.getElementById("repassword")) {
    document
      .getElementById("repassword")
      .addEventListener("click", async function (e) {
        e.preventDefault();

        const email = document.getElementById("resetEmail").value.trim();
        const resetEmailError = document.getElementById("resetEmailError");

        clearError(resetEmailError);

        if (!validateEmail(email)) {
          showError(resetEmailError, "البريد الإلكتروني غير صحيح");
          return;
        }

        try {
          await window.auth.requestPasswordReset(email);
          localStorage.setItem("resetEmail", email);
          window.location.href = "passwordScreen2.html";
        } catch (error) {
          showError(resetEmailError, error.message);
        }
      });
  }

  // Complete Password Reset
  if (document.getElementById("changePasswordBtn")) {
    document
      .getElementById("changePasswordBtn")
      .addEventListener("click", async function (e) {
        e.preventDefault();

        const newPassword = document.getElementById("newPassword").value.trim();
        const confirmPassword = document
          .getElementById("confirmNewPassword")
          .value.trim();
        const newPasswordError = document.getElementById("newPasswordError");
        const confirmPasswordError = document.getElementById(
          "confirmNewPasswordError"
        );

        clearError(newPasswordError);
        clearError(confirmPasswordError);

        let isValid = true;

        if (!validatePassword(newPassword)) {
          showError(
            newPasswordError,
            "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
          );
          isValid = false;
        }

        if (!validatePasswordsMatch(newPassword, confirmPassword)) {
          showError(confirmPasswordError, "كلمات المرور غير متطابقة");
          isValid = false;
        }

        if (isValid) {
          const email = localStorage.getItem("resetEmail");
          const codeInputs = document.querySelectorAll(".resetCodePass1");
          const code = Array.from(codeInputs)
            .map((input) => input.value)
            .join("");

          try {
            await window.auth.resetPassword(email, newPassword, code);
            localStorage.removeItem("resetEmail");
            alert("تم تغيير كلمة المرور بنجاح");
            window.location.href = "index.html";
          } catch (error) {
            alert(error.message);
          }
        } else {
          scrollToFirstError(document.getElementById("resetPasswordForm"));
        }
      });
  }

  // Navigation Handlers
  if (document.getElementById("arrowRightS1")) {
    document
      .getElementById("arrowRightS1")
      .addEventListener("click", function () {
        window.location.href = "signup1.html";
      });
  }

  if (document.getElementById("arrowRightS2")) {
    document
      .getElementById("arrowRightS2")
      .addEventListener("click", function () {
        window.location.href = "signup2.html";
      });
  }

  if (document.getElementById("registerBtn")) {
    document
      .getElementById("registerBtn")
      .addEventListener("click", function () {
        window.location.href = "index.html";
      });
  }

  if (document.getElementById("forgetBtn")) {
    document.getElementById("forgetBtn").addEventListener("click", function () {
      window.location.href = "passwordScreen1.html";
    });
  }

  if (document.getElementById("signupBtn1")) {
    document
      .getElementById("signupBtn1")
      .addEventListener("click", function () {
        window.location.href = "signup1.html";
      });
  }
});
